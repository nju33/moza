import * as chalk from 'chalk';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import {promisify} from 'util';

export async function ensureDir(dirname: string): Promise<void | never> {
  try {
    await promisify(mkdirp)(dirname);
  } catch (err) {
    // tslint:disable-next-line no-console
    console.error(chalk.red(err.essage));
    process.exit(1);
  }
}
