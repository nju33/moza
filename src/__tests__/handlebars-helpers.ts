import * as helpers from '../handlebars-helpers';

test('wrap', () => {
  expect(helpers.wrap('#', 'foo')).toBe('#foo#');
});

test('doubleQuote', () => {
  expect(helpers.doubleQuote('foo')).toBe('"foo"');
});

test('singleQuote', () => {
  // tslint:disable-next-line quotemark
  expect(helpers.singleQuote('foo')).toBe("'foo'");
});
