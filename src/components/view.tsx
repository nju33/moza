import {Component, h} from 'ink';
import termSize = require('term-size');

export class View extends Component {
  private props: {
    children: Array<{props: {size?: number; rows?: number}; children: any[]}>;
  };

  private state: {
    rows: number;
    columns: number;
  };

  constructor(props) {
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
