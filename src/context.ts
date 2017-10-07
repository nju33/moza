import * as matter from 'gray-matter';
import kebabCase = require('lodash.kebabcase');
import * as path from 'path';
import {formatMatter} from './helpers';

export class Context {
  public static toKebabProps(obj: object, ignoreProps?: string[]): object {
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
      [{}, {}],
    );
  }

  public filename: string;
  public scope: ContextScope;
  public data: ContextData;
  public content: string;
  private propMap: object;

  constructor(filename: string, content: string, scope: ContextScope) {
    const ctx = formatMatter(matter(content));
    this.filename = filename;
    this.scope = scope;
    const [data, propMap] = Context.toKebabProps(ctx.data, ['CONFIG']) as [
      ContextData,
      object
    ];
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

  private getData(flag: string): string {
    try {
      return this.data.CONFIG[flag] || '';
    } catch (_) {
      return '';
    }
  }

  public get commandName() {
    return path.basename(this.filename, '.hbs');
  }

  public get description(): string {
    return this.getData('description');
  }

  public get usage(): string {
    return this.getData('usage');
  }

  public get flags(): string[] {
    return Object.keys(this.data).filter(flag => {
      if (flag === 'CONFIG') {
        return false;
      }
      return true;
    });
  }
}

export type ContextScope = 'global' | 'local';
export interface ContextData {
  [flag: string]: matter.Options;
}
