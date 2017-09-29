import * as glob from 'glob';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import {h, render, Component, Text} from 'ink';
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {loadFile, parse} from './helpers';
import {Less} from './less';

console.log(h)
console.log(render)
console.log(Component)

process.on('unhandledRejection', function(reason, p) {
  console.error(reason);
});

Handlebars.registerHelper('wrap', (mark: string, str: string) => {
  console.log(mark, str);
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
      const ctx = matter(content);
      return {
        filename,
        ...ctx,
        get flags() {
          return Object.keys(ctx.data);
        },
        // get classifiedFlags(): Array<[string[], string[]]> {
        //   return this.flags.reduce((acc, flag) => {
        //     if (ctx.data[flag] === null) {
        //       acc[0].push(flag);
        //     } else {
        //       acc[1].push(flag);
        //     }
        //     return acc;
        //   }, [[], []]);
        // }
      };
      // return {
      //   contents,
      //   filename,
      //   options: parse(contents),
      // };
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
        b => {
          if (ctx.usage) {
            b.usage('aaa');
          }

          ctx.flags.forEach(flag => {
            b.option(flag, {
              default: ctx.data[flag]
            });
          });

          // ctx.options.forEach((opt: any) => {
          //   b.option(opt.var, {
          //     default: opt.default,
          //     type: 'string',
          //   });
          // });

          // b.demandOption(requiredFlags);
          b.help('help');

          return b;
        },
        async argv => {
          const flags = ctx.flags.reduce((result, flag) => {
            if (typeof argv[flag] !== 'undefined') {
              result[flag] = argv[flag];
            }
            return result;
          }, {});

          // console.log(Object.assign({}, ctx.data, flags));
          const result = Handlebars.compile(ctx.content)(
            Object.assign({}, ctx.data, flags)
          );
          // const result = Object.keys(ctx.flags).reduce((a: string, varname: string) => {
          //   return a.replace(new RegExp('{' + varname + '.*}'), ctx.flags[varname]);
          // }, ctx.content);
          // console.log(result);
          console.log(Less)
          // render(<Text>aldkfjalskdjf</Text>);
          render(<Less/>);
        }
      );
      // .help()
      // .argv;
    });
    yargs.argv;
  });
})();
