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
        // const contents = await loadFile(filename);
        // console.log(parse(contents));
        console.log(argv);
        // console.log(arguments);
      })
      .help()
      .argv;
    });
  });
})();
