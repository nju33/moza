import * as fs from 'fs';
import {promisify} from 'util';
import {ensureFile} from '../ensure-file';

const filename = __dirname + '/test.js';

afterEach(async () => {
  await promisify(fs.unlink)(filename);
});

test('ensureFile', async () => {
  await ensureFile(filename);
  expect(() => promisify(fs.access)(filename, fs.constants.F_OK)).not.toThrow();
});
