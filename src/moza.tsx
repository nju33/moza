import * as fs from 'fs';
import * as glob from 'glob';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import {Component, h, render, Text} from 'ink';
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {Container} from './container';
import {formatMatter, loadFile, parse} from './helpers';

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
  } catch {
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

(async () => {
  const filePatterns = [
    path.join(process.env.HOME, '.config/moza/*'),
    path.join(process.cwd(), '.moza/*'),
  ];

  await Promise.all(
    filePatterns.map(filePattern => {
      glob(filePattern, async (err, filenames) => {
        const ctxPromises = filenames.map(makeCtx);

        const ctxs: Context[] = await Promise.all(ctxPromises);

        ctxs.forEach(ctx => {
          yargs.command(
            ctx.commandName,
            (() => {
              try {
                return ctx.data.description!.default;
              } catch {
                return '';
              }
            })(),
            command => {
              ctx.flags.forEach(flag => {
                command.option(flag, ctx.data[flag] as matter.Options);
              });
              return command.usage(ctx.usage || null).help('help');
            },
            async argv => {
              const flags = ctx.flags.reduce((acc, flag) => {
                if (argv[flag] !== 'undefined') {
                  if (argv[flag] !== 'undefined') {
                    acc[flag] = argv[flag];
                  } else if (ctx.data[flag].default) {
                    acc[flag] = ctx.data[flag].default;
                  }
                }
                return acc;
              }, {});

              const result = Handlebars.compile(ctx.content)(flags);
              render(<Container content={result.trim()} flags={flags} />);
            },
          );
        });
        return yargs.argv;
      });
    }),
  );
})();
