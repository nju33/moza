import * as glob from 'glob';
import * as path from 'path';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {loadFile} from './helpers/import';

(async () => {
  const filePattern = path.join(process.cwd(), 'example/*');
  // const filenames = await promisify(glob)(filePattern, {}, () => {});
  // console.log(filenames);

  glob(filePattern, (err, filenames) => {
    filenames.forEach(filename => {
      console.log(filename);

      const a = yargs.command(path.basename(filename), 'test', b => {

        return b
          .usage('aaa')
          .option('aa', {
            alias: 'a',
            description: 'help',
          })
          .help('help')
        // .argv;
      }, function (argv){
        console.log(argv);
        console.log(arguments);
      })
      .help()
      .argv;
    });
  });
})();
