import * as Handlebars from 'handlebars';

Handlebars.registerHelper('wrap', (mark: string, str: string) => {
  return `${mark}${str}${mark}`;
});

Handlebars.registerHelper('double-quote', (str: string) => {
  return `"${str}"`;
});

Handlebars.registerHelper('dq', (str: string) => {
  return `"${str}"`;
});

Handlebars.registerHelper('single-quote', (str: string) => {
  return `'${str}'`;
});

Handlebars.registerHelper('sq', (str: string) => {
  return `'${str}'`;
});
