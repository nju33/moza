import * as glob from 'glob';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {loadFile, parse} from './helpers';

process.on('unhandledRejection', function(reason, p){
  console.error(reason);
});

(async () => {
  const filePattern = path.join(process.cwd(), 'example/*');
  // const filenames = await promisify(glob)(filePattern, {}, () => {});
  // console.log(filenames);

  glob(filePattern, async (err, filenames) => {
    const promises = filenames.map(async filename => {
      const content = await loadFile(filename);
      const ctx = matter(content);
      return {filename, ...ctx, get flags() {
        return Object.keys(ctx.data);
      }};
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
      yargs.command(path.basename(ctx.filename), ctx.description || false, b => {
        if (ctx.usage) {
          b.usage('aaa');
        }

        ctx.flags.forEach(flag => {
          b.option(flag);
        });

        // ctx.options.forEach((opt: any) => {
        //   b.option(opt.var, {
        //     default: opt.default,
        //     type: 'string',
        //   });
        // });

        // b.demandOption(part.options.filter(opt => typeof opt.default === 'undefined').map(opt => opt.var))
        b.help('help');

        return b;
      }, async argv => {
        const flags = ctx.flags.reduce((result, flag) => {
          if (typeof argv[flags] !== 'undefined') {
            result[flag] = argv[flag];
          }
          return result;
        }, {});

        console.log((Object.assign({}, ctx.data, flags)));
        const result = Handlebars.compile(ctx.content)(Object.assign({}, ctx.data, flags));
        // const result = Object.keys(ctx.flags).reduce((a: string, varname: string) => {
        //   return a.replace(new RegExp('{' + varname + '.*}'), ctx.flags[varname]);
        // }, ctx.content);
        console.log(result);
      });
      // .help()
      // .argv;
    });
    yargs.argv;
  });
})();
