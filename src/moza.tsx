import * as fs from 'fs';
import * as glob from 'glob';
import matter = require('gray-matter');
import * as Handlebars from 'handlebars';
import {Component, h, render, Text} from 'ink';
import * as path from 'path';
import * as R from 'ramda';
import {promisify} from 'util';
import * as yargs from 'yargs';
import {FlexCol, Less} from './components';
import {formatMatter, loadFile, parse} from './helpers';

process.on('unhandledRejection', (reason, p) => {
  // tslint:disable-next-line no-console
  console.error(reason);
});

Handlebars.registerHelper('wrap', (mark: string, str: string) => {
  return `${mark}${str}${mark}`;
});

Handlebars.registerHelper('double-quote', (str: string) => {
  return `"${str}"`;
});

Handlebars.registerHelper('dq', (str: string) => {
  return `"${str}"`;
});

class Container extends Component {
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
      <FlexCol>
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
      </FlexCol>
    );
  }
}

(async () => {
  const filePattern = path.join(process.cwd(), 'example/*');

  glob(filePattern, async (err, filenames) => {
    const promises = filenames.map(async filename => {
      const content = await loadFile(filename);
      const ctx = formatMatter(matter(content));
      return {
        filename,
        ...ctx,
        get flags() {
          return Object.keys(ctx.data);
        },
      };
    });

    const ctxs: {[key: string]: any} = await Promise.all(promises);

    ctxs.forEach(ctx => {
      yargs.command(
        path.basename(ctx.filename, '.hbs'),
        ctx.description || false,
        command => {
          ctx.flags.forEach(flag => {
            command.option(flag, ctx.data[flag]);
          });
          return command.usage(ctx.usage || null).help('help');
        },
        async argv => {
          const flags = ctx.flags.reduce((acc, flag) => {
            if (typeof argv[flag] !== 'undefined') {
              if (argv[flag]) {
                acc[flag] = argv[flag];
              } else if (ctx.data[flag].default) {
                acc[flag] = ctx.data[flag].default;
              }
            }
            return acc;
          }, {});

          const result = Handlebars.compile(ctx.content)(
            Object.assign({}, ctx.data, flags),
          );

          render(<Container content={result.trim()} flags={flags} />);
        },
      );
    });
    return yargs.argv;
  });
})();
