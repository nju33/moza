import * as fs from 'fs';
import {promisify} from 'util';

export async function loadFile(path: string): Promise<string> {
  const contents = await promisify(fs.readFile)(path, 'utf-8');
  return contents;
}
