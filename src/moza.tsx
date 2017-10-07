import * as chalk from 'chalk';
import * as Table from 'cli-table2';
import * as fs from 'fs';
import * as got from 'got';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import {Component, h, render, Text} from 'ink';
import isUrl = require('is-url');
import * as path from 'path';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {Container} from './container';
import {Context} from './context';
import {ensureDir, ensureFile, formatMatter, pglob} from './helpers';

process.on('unhandledRejection', (reason, p) => {
  // tslint:disable-next-line no-console
  console.error(reason);
});

(async () => {
  const filePatterns = [
    path.join(process.env.HOME, '.config/moza/*'),
    path.join(process.cwd(), '.moza/*'),
  ];

  const ctxsAllPromises = filePatterns
    .map(filePattern => pglob(filePattern))
    .map((filenameSetPromise, idx): [Promise<string[]>, 'global' | 'local'] => {
      if (idx === 0) {
        return [filenameSetPromise, 'global'];
      } else {
        return [filenameSetPromise, 'local'];
      }
    })
    .map(async ([filenameSetPromise, scope]) => {
      const filenameSet = await filenameSetPromise;
      const ctxsSet: Context[] = await Promise.all(
        filenameSet.map(async filename => {
          const content = await promisify(fs.readFile)(filename, 'utf-8');
          return new Context(filename, content, scope);
        }),
      );
      return ctxsSet;
    })
    .reduce(
      async (accPromise, ctxsSetPromise) => {
        const acc = await accPromise;
        const ctxsSet = await ctxsSetPromise;
        return [...acc, ...ctxsSet];
      },
      [] as Promise<Context[]> | undefined[],
    );

  if (Array.isArray(ctxsAllPromises)) {
    return;
  }

  const ctxs = await ctxsAllPromises;
  ctxs.forEach(ctx => {
    yargs.command(
      ctx.commandName,
      (() => {
        try {
          return ctx.data.description!.default;
        } catch (_) {
          return '';
        }
      })(),
      command => {
        ctx.forEachFlag((flag, data) => {
          command.option(flag, data);
        });
        return command
          .group(ctx.flags, 'Variables:')
          .usage(ctx.usage || null)
          .help('help');
      },
      async argv => {
        const [, destination] = argv._;
        if (destination === undefined) {
          // tslint:disable-next-line no-console
          console.error(
            chalk.red('Expected second arguments for destination path'),
          );
          process.exit(1);
        }

        const flags = ctx.flags.reduce((acc, flag) => {
          const originalFlag = ctx.getOriginalProp(flag);
          acc[originalFlag] = argv[flag];
          if (acc[originalFlag] === null || acc[originalFlag] === undefined) {
            acc[originalFlag] = ctx.data[flag].default;
          }
          return acc;
        }, {});

        require('./handlebars-helpers');
        const result = Handlebars.compile(ctx.content)(flags);
        render(
          <Container
            content={result.trim()}
            flags={flags}
            output={path.resolve(destination)}
          />,
        );
      },
    );
  });

  yargs.command(
    'ls',
    'Show command list',
    command => {
      return command
        .option('global', {
          alias: 'g',
          default: false,
          type: 'boolean',
        })
        .usage('$ moza ls [-g]')
        .help();
    },
    argv => {
      const table = new Table({
        head: ['Command', 'Path'],
      });
      ctxs.forEach(ctx => {
        if (argv.global && ctx.scope === 'global') {
          /**
           * 型がおかしいので`any`化
           */
          (table.push as any)([chalk.yellow(ctx.commandName), ctx.filename]);
        } else if (!argv.global && ctx.scope === 'local') {
          /**
           * 同上
           */
          (table.push as any)([chalk.yellow(ctx.commandName), ctx.filename]);
        }
      });
      // tslint:disable-next-line no-console
      console.log(table.toString());
      process.exit(0);
    },
  );

  yargs.command(
    'add',
    'Fetch a template',
    command => {
      return command
        .option('global', {
          alias: 'g',
          default: false,
          type: 'boolean',
        })
        .option('output', {
          alias: 'o',
          demandOption: true,
          type: 'string',
        })
        .usage('$ yarn add [-g] <url>')
        .help();
    },
    async argv => {
      const [, url] = argv._;
      if (!isUrl(url)) {
        // tslint:disable-next-line no-console
        console.error(chalk.red('Specify url for first argument'));
        process.exit(1);
      }

      const content = await (async () => {
        try {
          const response: {body: string} = await got(url);
          return response.body;
        } catch (err) {
          // tslint:disable-next-line no-console
          console.log(chalk.red(err.message));
          process.exit(1);
        }
      })();

      if (argv.global) {
        const dirname = path.resolve(process.env.HOME, '.config/moza');
        const filename = path.join(dirname, argv.output);
        await ensureDir(dirname);
        await ensureFile(filename);
        await promisify(fs.writeFile)(filename, content);
      } else {
        const dirname = path.resolve(process.cwd(), '.moza');
        const filename = path.join(dirname, argv.output);
        await ensureDir(dirname);
        await ensureFile(filename);
        await promisify(fs.writeFile)(filename, content);
      }
    },
  );

  return yargs.argv;
})();
