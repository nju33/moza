import {Context} from '../context';

test('Context.toKebabProps', () => {
  const result = Context.toKebabProps(
    {
      A: 1,
      B: 2,
      fooBar: 3,
      hoge_fuga: 4,
    },
    ['A'],
  );

  expect(result).toMatchObject([
    {
      A: 1, // tslint:disable-line object-literal-key-quotes
      b: 2, // tslint:disable-line object-literal-key-quotes
      'foo-bar': 3,
      'hoge-fuga': 4,
    },
    {
      A: 'A', // tslint:disable-line object-literal-key-quotes
      b: 'B', // tslint:disable-line object-literal-key-quotes
      'foo-bar': 'fooBar',
      'hoge-fuga': 'hoge_fuga',
    },
  ]);
});

test('Context', () => {
  const content = `---
CONFIG:
  description: description
  usage: usage
NOTE: |
  foo
  bar
  baz
foo: foo
barBaz:
  type: array
  demandOption: true
---

hoge`;
  const ctx = new Context('foo/bar.hbs', content, 'global');

  expect(ctx.filename).toMatch(/foo\/bar\.hbs/);
  expect(ctx.scope).toBe('global');
  expect(ctx.commandName).toBe('bar');
  expect(ctx.description).toBe('description');
  expect(ctx.usage).toBe('usage');
  expect(ctx.note.trim()).toBe('foo\nbar\nbaz');
  expect(ctx.flags).toMatchObject(['foo', 'bar-baz']);

  expect(ctx.getOriginalProp(ctx.flags[1])).toBe('barBaz');

  const callback = jest.fn();
  ctx.forEachFlag(callback);
  expect(callback.mock.calls.length).toBe(2);
  expect(callback.mock.calls[0][0]).toBe('foo');
  expect(callback.mock.calls[0][1]).toMatchObject({default: 'foo'});
  expect(callback.mock.calls[1][0]).toBe('bar-baz');
  expect(callback.mock.calls[1][1]).toMatchObject({
    demandOption: true,
    type: 'array',
  });
});
