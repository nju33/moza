declare module 'ink' {
  export class Component<T = {}, U = {}> {
    public props: T;
    public state: U;

    constructor(props: T, state?: U);
  }

  export function h(...args: any[]): any;

  export function render(vdom: any): void;

  // tslint:disable-next-line max-classes-per-file
  export class Text extends Component {}
}
