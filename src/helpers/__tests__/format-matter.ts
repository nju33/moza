import {formatMatter} from '../format-matter';

test('formatMatter', () => {
  expect(formatMatter({data: {flag: 'foo'}})).toMatchObject({
    data: {
      flag: {
        default: 'foo',
      },
    },
  });

  expect(
    formatMatter({data: {flag: {default: 'foo', type: 'number'}}}),
  ).toMatchObject({
    data: {
      flag: {
        default: 'foo',
        type: 'number',
      },
    },
  });
});
