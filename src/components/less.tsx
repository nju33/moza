import * as clear from 'clear';
import {Component, h, render} from 'ink';

export class Less extends Component {
  public props: {rows: number; content: string; save(): void};
  public state: any;
  private setState: any;

  private constructor(props) {
    super(props);

    const contentLineLength = props.content.split('\n').length;
    this.state = {
      contentLineLength,
      rows: contentLineLength < props.rows ? contentLineLength : props.rows,
      scrollLine: 0,
    };
    // console.log(this.state);
    // process.exit(0);
  }

  private get viewableContent() {
    return this.props.content
      .split('\n')
      .concat(Array(this.state.rows).fill(''))
      .slice(this.state.scrollLine, this.state.scrollLine + this.state.rows)
      .join('\n');
  }

  public render(props) {
    clear();
    return <div>{this.viewableContent}</div>;
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
        case 'return' /* enter */:
        case 'y': {
          this.props.save();
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
