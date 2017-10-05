import * as chalk from 'chalk';
import * as fs from 'fs';
import * as got from 'got';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import {Component, h, render, Text} from 'ink';
import isUrl = require('is-url');
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {Container} from './container';
import {formatMatter, loadFile, parse, pglob} from './helpers';

process.on('unhandledRejection', (reason, p) => {
  // tslint:disable-next-line no-console
  console.error(reason);
});

Handlebars.registerHelper('wrap', (mark: string, str: string) => {
  return `${mark}${str}${mark}`;
});

Handlebars.registerHelper('double-quote', (str: string) => {
  return `"${str}"`;
});

Handlebars.registerHelper('dq', (str: string) => {
  return `"${str}"`;
});

interface Context extends matter.Context {
  filename: string;
  commandName: string;
  description: string;
  usage: string;
  flags: string[];
}

function getData(data: {[flag: string]: matter.Options}, flag: string): string {
  try {
    return data.CONFIG[flag]!.default;
  } catch (_) {
    return '';
  }
}

async function makeCtx(filename: string): Promise<Context> {
  const content = await loadFile(filename);
  const ctx = formatMatter(matter(content));
  return {
    filename,
    get commandName() {
      return path.basename(this.filename, '.hbs');
    },
    get description() {
      return getData(this.data, 'description');
    },
    get usage() {
      return getData(this.data, 'usage');
    },
    get flags() {
      return Object.keys(ctx.data);
    },
    ...ctx,
  };
}

// tslint:disable-next-line
(async () => {
  const filePatterns = [
    path.join(process.env.HOME, '.config/moza/*'),
    path.join(process.cwd(), '.moza/*'),
  ];

  const setPromises = filePatterns.map(async filePattern => {
    const set = await pglob(filePattern);
    return set;
  });
  const filenamesSet = await Promise.all(setPromises);
  const filenames = filenamesSet.reduce((acc, set) => [...acc, ...set], []);

  const ctxPromises = filenames.map(makeCtx);
  const ctxs: Context[] = await Promise.all(ctxPromises);

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
        ctx.flags.forEach(flag => {
          if (flag === 'CONFIG') {
            return;
          }

          command.option(flag, ctx.data[flag] as matter.Options);
        });
        return command.usage(ctx.usage || null).help('help');
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
          acc[flag] = argv[flag];
          if (acc[flag] === null || acc[flag] === undefined) {
            acc[flag] = ctx.data[flag].default;
          }
          return acc;
        }, {});

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

  const args = yargs.usage(
    '$ moza <comand | url> [command-options] <destination-path>',
  ).argv;

  const [url] = args._;
  if (!isUrl(url)) {
    // tslint:disable-next-line no-console
    console.error(chalk.red('Specify command or url to first argument'));
    process.exit(1);
  }

  const response = await got(url);
  console.log();
})();
