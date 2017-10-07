import {Component, h} from 'ink';
import termSize = require('term-size');

interface Props {
  children: Array<{props: {size?: number; rows?: number}; children: any[]}>;
}

interface State {
  rows: number;
  columns: number;
}

export class View extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      ...termSize(),
    };
  }

  public render() {
    this.props.children[0].props.rows = Math.floor(this.state.rows * 0.7);
    this.props.children[1].props.rows = 3;

    return <div>{this.props.children}</div>;
  }
}
