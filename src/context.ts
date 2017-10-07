import * as matter from 'gray-matter';
import kebabCase = require('lodash.kebabcase');
import * as path from 'path';
import {formatMatter} from './helpers';

export class Context {
  public static toKebabProps(
    obj: {[p: string]: any},
    ignoreProps?: string[],
  ): object {
    return Object.keys(obj).reduce(
      ([data, propMap], originalKey) => {
        let key = originalKey;
        if (
          ignoreProps === undefined ||
          (ignoreProps !== undefined && ignoreProps.indexOf(key) === -1)
        ) {
          key = kebabCase(originalKey);
        }
        propMap[key] = originalKey;
        data[key] = obj[originalKey];
        return [data, propMap];
      },
      [{}, {}] as [{[p: string]: any}, {[p: string]: any}],
    );
  }

  public filename: string;
  public scope: ContextScope;
  public config?: {
    filename?: string;
    description?: string;
    usage?: string;
  };
  public note?: string;
  public data: ContextData;
  public content: string;
  private propMap: {[prop: string]: any};

  constructor(filename: string, content: string, scope: ContextScope) {
    const ctx = formatMatter(matter(content));
    this.filename = filename;
    this.scope = scope;
    const [data, propMap] = Context.toKebabProps(ctx.data, [
      'CONFIG',
      'NOTE',
    ]) as [ContextData, object];
    this.config = (ctx.data as any).CONFIG;
    this.note = (ctx.data as any).NOTE;
    this.data = data;
    this.propMap = propMap;
    this.content = ctx.content;
  }

  public getOriginalProp(prop: string): string {
    return this.propMap[prop];
  }

  public forEachFlag(cb: (flag: string, data: matter.Options) => void) {
    this.flags.forEach(flag => {
      cb(flag, this.data[flag]);
    });
  }

  private getData(flag: ContextConfigType): matter.Options | string | false {
    try {
      return this.config![flag] || false;
    } catch (_) {
      return false;
    }
  }

  public get commandName() {
    return path.basename(this.filename, '.hbs');
  }

  public get description(): string | undefined {
    return this.getData('description') as string;
  }

  public get usage(): string | undefined {
    return this.getData('usage') as string;
  }

  public get flags(): string[] {
    return Object.keys(this.data).filter(flag => {
      if (flag === 'CONFIG' || flag === 'NOTE') {
        return false;
      }
      return true;
    });
  }
}

export type ContextScope = 'global' | 'local';
export type ContextConfigType = 'filename' | 'description' | 'usage';
export interface ContextData {
  [flag: string]: matter.Options;
}
