import * as fs from 'fs';
import {promisify} from 'util';
import {ensureDir} from '../ensure-dir';

const dirname = __dirname + '/test';

afterEach(async () => {
  await promisify(fs.rmdir)(dirname);
});

test('ensureDir', async () => {
  await ensureDir(dirname);
  expect(() => promisify(fs.access)(dirname, fs.constants.F_OK)).not.toThrow();
});
