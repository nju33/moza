import {pglob} from '../pglob';

test('pglob', async () => {
  const filenames = await pglob(__dirname + '/pglob.ts');
  expect(filenames[0]).toMatch(/__tests__\/pglob.ts/);
});
