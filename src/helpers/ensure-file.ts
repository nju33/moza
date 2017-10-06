import * as chalk from 'chalk';
import * as fs from 'fs';
import {promisify} from 'util';

export async function ensureFile(filename: string): Promise<void | never> {
  try {
    await promisify(fs.access)(filename, fs.constants.F_OK);
  } catch (_) {
    try {
      await promisify(fs.writeFile)(filename, '');
    } catch (err) {
      // tslint:disable-next-line no-console
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  }
}
