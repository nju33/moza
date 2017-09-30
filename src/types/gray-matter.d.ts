type AToZ =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

declare module 'gray-matter' {
  interface ContextData {
    alias?: AToZ;
    default?: any;
    demandOption?: boolean;
    describe?: string;
    type?: 'array' | 'boolean' | 'count' | 'number' | 'string';
  }

  namespace matter {
    export interface Context {
      content: string;
      excerpt: string;
      data: {
        [flag: string]: ContextData | string;
      };
    }
  }

  function matter(content: string): matter.Context;

  export = matter;
}
