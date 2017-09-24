export function parse(contents: string): any {
  const matches = contents.match( /{.+?}/g);

  if (matches === null) {
    return [];
  }

  return matches.map(match => {
    const [, varname, defaultValue] = match.match(/{(.+?)(?::(.+))?}/)!;
    return {
      default: defaultValue,
      var: varname,
    };
  });
}
