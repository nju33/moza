import * as glob from 'glob';
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {loadFile, parse} from './helpers';

(async () => {
  const filePattern = path.join(process.cwd(), 'example/*');
  // const filenames = await promisify(glob)(filePattern, {}, () => {});
  // console.log(filenames);

  glob(filePattern, async (err, filenames) => {
    const promises = filenames.map(async filename => {
      const contents = await loadFile(filename);
      return {
        contents,
        filename,
        options: parse(contents),
      };
    });

    const parts: {[key: string]: any} = await Promise.all(promises);

    parts.forEach(part => {
      part.pick = R.pick(part.options.map(opt => opt.var));
    });

    parts.forEach(part => {
      yargs.command(path.basename(part.filename), 'test', b => {
        b.usage('aaa');

        part.options.forEach((opt: any) => {
          b.option(opt.var, {
            default: opt.default,
            type: 'string',
          });
        });

        b.demandOption(part.options.filter(opt => typeof opt.default === 'undefined').map(opt => opt.var))
        b.help('help');

        return b;
      }, async function (argv){
        // console.log(argv);
        const flags = part.pick(argv);
        console.log(flags);

        const result = Object.keys(flags).reduce((a: string, varname: string) => {
          return a.replace(new RegExp('{' + varname + '.*}'), flags[varname]);
        }, part.contents);
        console.log(result);
        // for (const varname in flags) {
        //   part.contents.
        // }

        // const {aaa, bbb, ccc}: {[key: string]: string} = Object.keys(argv).reduce((flags: any, key) => {
        //   if (part.options.map(opt => opt.var).indexOf(key) === -1) {
        //     return flags;
        //   }
        //   flags[key] = argv[key];
        //   return flags;
        // }, {});
        //
        // console.log(aaa, bbb, ccc);
        // const contents = await loadFile(filename);
        // console.log(parse(contents));
        // console.log(arguments);
      });
      // .help()
      // .argv;
    });
    yargs.argv;
  });
})();
