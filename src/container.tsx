import * as chalk from 'chalk';
import * as fs from 'fs';
import {Component, h, Text} from 'ink';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import {promisify} from 'util';
import {Less, View} from './components';

export class Container extends Component {
  private props: {
    content: string;
    flags: {
      filename: string;
      [prop: string]: any;
    };
    output: string;
  };

  private state: {
    saved: boolean;
    error: string;
  };

  private constructor(props) {
    super(props);
    this.state = {
      error: null,
      saved: false,
    };
  }

  private get output() {
    return path.resolve(this.props.output);
  }

  public async ensureDir(): Promise<void> {
    try {
      await promisify(mkdirp)(path.dirname(this.output));
    } catch (err) {
      // tslint:disable-next-line no-console
      console.error(chalk.red(err.essage));
      process.exit(1);
    }
  }

  public async ensureNotExistsFile(filename: string): Promise<never | void> {
    await promisify(fs.access)(filename, fs.constants.F_OK);
    throw new Error('Its file is already exists. Overwrite?');
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
          save={async () => {
            await this.ensureDir();

            try {
              await this.ensureNotExistsFile(this.output);
            } catch (err) {
              if (this.state.error === null) {
                (this as any).setState({
                  error: err.message,
                });
                return;
              }
            }

            fs.writeFileSync(this.output, this.props.content, 'utf-8');
            (this as any).setState({
              saved: true,
            });
          }}
        />
        <div>
          <div />
          <div>
            <Text yellow>»</Text> Save? <Text blue>y</Text>/n{' '}
            <Text gray>:: down:j up:k</Text>
          </div>
          {this.state.error ? (
            <div>
              <Text red>!</Text> {this.state.error} <Text blue>y</Text>/n
            </div>
          ) : null}
          {this.state.saved ? (
            <div>
              <Text green>✔</Text> Created to <Text bold>{this.output}</Text>
            </div>
          ) : null}
        </div>
      </View>
    );
  }
}
