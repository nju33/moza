import * as fs from 'fs';
import * as glob from 'glob';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import {h, render} from 'ink';
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {formatMatter, loadFile, parse} from './helpers';
import {Less} from './less';

process.on('unhandledRejection', (reason, p) => {
  // tslint:disable-next-line
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

(async () => {
  const filePattern = path.join(process.cwd(), 'example/*');
  // const filenames = await promisify(glob)(filePattern, {}, () => {});
  // console.log(filenames);

  glob(filePattern, async (err, filenames) => {
    const promises = filenames.map(async filename => {
      const content = await loadFile(filename);
      const ctx = formatMatter(matter(content));
      return {
        filename,
        ...ctx,
        get flags() {
          return Object.keys(ctx.data);
        },
      };
    });

    const ctxs: {[key: string]: any} = await Promise.all(promises);

    // ctxs.forEach(part => {
    //   part.pick = R.pick(part.options.map(opt => opt.var));
    // });

    ctxs.forEach(ctx => {
      // const [requiredFlags, nonRequiredFlags] = ctx.classifiedFlags;
      // console.log(requiredFlags, nonRequiredFlags);

      yargs.command(
        path.basename(ctx.filename, '.hbs'),
        ctx.description || false,
        command => {
          ctx.flags.forEach(flag => {
            command.option(flag, ctx.data[flag]);
          });
          return command.usage(ctx.usage || null).help('help');
        },
        async argv => {
          // tslint:disable-next-line
          const flags = ctx.flags.reduce((result, flag) => {
            if (typeof argv[flag] !== 'undefined') {
              result[flag] = argv[flag];
            }
            return result;
          }, {});

          // console.log(Object.assign({}, ctx.data, flags));
          const result = Handlebars.compile(ctx.content)(
            Object.assign({}, ctx.data, flags),
          );
          // const result = Object.keys(ctx.flags).reduce((a: string, varname: string) => {
          //   return a.replace(new RegExp('{' + varname + '.*}'), ctx.flags[varname]);
          // }, ctx.content);
          // console.log(result);
          // tslint:disable-next-line
          console.log(Less);
          // render(<Text>aldkfjalskdjf</Text>);
          render(
            <Less
              content={result.trim()}
              save={() => {
                fs.writeFileSync(
                  path.resolve(`example/${ctx.data.filename}`),
                  result.trim(),
                  'utf-8',
                );
              }}
            />,
          );
        },
      );
      // .help()
      // .argv;
    });
    yargs.argv;
  });
})();
