import * as clear from 'clear';
import {Component, h, render} from 'ink';
import termSize = require('term-size');

export class Less extends Component {
  public props: {content: string; save(): void};
  public state: any;
  private setState: any;

  constructor(props) {
    super(props);

    this.state = {
      ...termSize(),
      contentLineLength: props.content.split('\n').length,
      scrollLine: 0,
    };
  }

  get visibleContent() {
    return this.props.content
      .split('\n')
      .slice(this.state.scrollLine, this.state.scrollLine + this.state.rows)
      .join('\n');
  }

  public render(props) {
    // return <Text green>{this.state.i} tests passed</Text>;
    // tslint:disable-next-line
    clear();
    return <div>{this.visibleContent}</div>;
  }

  public scroll(num: number) {
    this.setState({
      scrollLine: this.state.scrollLine + num,
    });
  }

  public componentDidMount() {
    process.stdin.on('keypress', (ch, key) => {
      if (!key) {
        return;
      }

      switch (key.name) {
        case 'j': {
          if (
            this.state.scrollLine + this.state.rows + 1 <
            this.state.contentLineLength
          ) {
            this.scroll(1);
          }
          break;
        }
        case 'k': {
          if (this.state.scrollLine > 0) {
            this.scroll(-1);
          }
          break;
        }
        case 'y': {
          this.props.save();
          process.exit(0);
        }
        case 'n':
        default:
      }
    });
  }

  // componentDidMount() {
  //   this.timer = setInterval(() => {
  //     this.setState({
  //       i: this.state.i + 1
  //     });
  //   }, 100);
  // }
  //
  // componentWillUnmount() {
  //   clearInterval(this.timer);
  // }
}
