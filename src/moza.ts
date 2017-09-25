import * as glob from 'glob';
import * as path from 'path';
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
        filename,
        options: parse(contents),
      };
    });

    const parts = await Promise.all(promises);

    parts.forEach(part => {

      const a = yargs.command(path.basename(part.filename), 'test', b => {
        b.usage('aaa');

        console.log(part.options)

        part.options.forEach((opt: any) => {
          b.option(opt.var, {
            default: opt.default,
            type: 'string',
          });
        });

        b.demandOption(part.options.map(opt => opt.var))
        b.help('help');

        return b;

        // return b
        //   .usage('aaa')
        //   .option('aa', {
        //     alias: 'a',
        //     description: 'help',
        //   })
        //   .help('help')
        // .argv;
      }, async function (argv){
        const {aaa, bbb, ccc}: {[key: string]: string} = Object.keys(argv).reduce((flags: any, key) => {
          if (part.options.map(opt => opt.var).indexOf(key) === -1) {
            return flags;
          }
          flags[key] = argv[key];
          return flags;
        }, {});

        console.log(aaa, bbb, ccc);
        // const contents = await loadFile(filename);
        // console.log(parse(contents));
        // console.log(arguments);
      })
      .help()
      .argv;
    });
  });
})();
