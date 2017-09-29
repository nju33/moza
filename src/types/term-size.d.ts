declare module 'term-size' {
  function termSize(): {columns: number, rows: number};
  export = termSize;
}
