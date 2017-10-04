import * as fs from 'fs';
import {Component, h, Text} from 'ink';
import * as path from 'path';
import {Less, View} from './components';

export class Container extends Component {
  private props: {
    content: string;
    flags: {
      filename: string;
      [prop: string]: any;
    };
  };

  private state: {
    saved: boolean;
  };

  private constructor(props) {
    super(props);
    this.state = {
      saved: false,
    };
  }

  public componentDidUpdate() {
    if (this.state.saved) {
      process.exit(0);
    }
  }

  public render() {
    return (
      <View>
        <Less
          content={this.props.content}
          save={() => {
            fs.writeFileSync(
              path.resolve(`example/${this.props.flags.filename}`),
              this.props.content,
              'utf-8',
            );
            (this as any).setState({
              saved: true,
            });
          }}
        />
        <div>
          <div />
          <div>
            » Save? <Text blue>y</Text>/n <Text gray>:: down:j up:k</Text>
          </div>
          {this.state.saved ? (
            <Text>
              » Created to{' '}
              {path.resolve(`example/${this.props.flags.filename}`)}
            </Text>
          ) : null}
        </div>
      </View>
    );
  }
}
