declare module 'gray-matter' {
  namespace matter {
    export interface Context {
      content: string;
      excerpt: string;
      data: {
        [flag: string]: Options;
      };
    }

    export type Choice = string | true | undefined;
    export type Choices = Choice[];

    export interface Options {
      alias?: string | string[];
      array?: boolean;
      boolean?: boolean;
      choices?: Choices;
      coerce?: (arg: any) => any;
      config?: boolean;
      configParser?: (configPath: string) => object;
      conflicts?: string | object;
      count?: boolean;
      default?: any;
      defaultDescription?: string;
      /** @deprecated since version 6.6.0 */
      demand?: boolean | string;
      demandOption?: boolean | string;
      desc?: string;
      describe?: string;
      description?: string;
      global?: boolean;
      group?: string;
      implies?: string | object;
      nargs?: number;
      normalize?: boolean;
      number?: boolean;
      require?: boolean | string;
      required?: boolean | string;
      requiresArg?: boolean | string;
      skipValidation?: boolean;
      string?: boolean;
      type?: 'array' | 'boolean' | 'count' | 'number' | 'string';

      [key: string]: any;
    }
  }

  function matter(content: string): matter.Context;

  export = matter;
}
