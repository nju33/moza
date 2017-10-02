import {Component, h} from 'ink';
import termSize = require('term-size');

export class FlexCol extends Component {
  private props: {
    children: Array<{props: {size?: number, rows?: number}, children: any[]}>,
  }

  private state: {
    rows: number;
    columns: number;
  }

  constructor(props) {
    super(props);

    this.state = {
      ...termSize()
    };
  }

  componentWillMoun

  public render() {
    this.props.children[0].props.rows = this.state.rows - 2;
    this.props.children[1].props.rows = 2;

    return (
      <div>
        {JSON.stringify(this.props.children)}
        {this.props.children}
      </div>
    )
  }
}
