import * as Handlebars from 'handlebars';

export function wrap(mark: string, str: string) {
  return `${mark}${str}${mark}`;
}
Handlebars.registerHelper('wrap', wrap);

export function doubleQuote(str: string) {
  return `"${str}"`;
}
Handlebars.registerHelper('double-quote', doubleQuote);
Handlebars.registerHelper('dq', doubleQuote);

export function singleQuote(str: string) {
  return `'${str}'`;
}
Handlebars.registerHelper('single-quote', singleQuote);
Handlebars.registerHelper('sq', singleQuote);
