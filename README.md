# moza

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm version](https://badge.fury.io/js/moza.svg)](https://badge.fury.io/js/moza)
[![CircleCI](https://circleci.com/gh/nju33/moza.svg?style=svg&circle-token=3c3a1a3149f11cf61b6c21898fe11d8e279ffb3b)](https://circleci.com/gh/nju33/moza)
[![codecov](https://codecov.io/gh/nju33/moza/branch/master/graph/badge.svg?token=Co6rsyvfZu)](https://codecov.io/gh/nju33/moza)

## Install

```bash
npm i -g moza
# yarn global add moza
```

## Usage

Place `*.hbs` under `./.moza/` or `~/.config/moza/` directory. The contents are like this.

```text
---
text: foo
---

<p>{{foo}}</p>
```

Suppose you put this as `html.hbs`. Then, The `html` command is enabled.

```bash
moza --help
# Commands:
#   html
```

And it is now possible to pass the `text` flag.

```bash
moza foo --help
# Variables
#   --text
```

> The entity of this `text` object is an [option of yargs](https://github.com/yargs/yargs/blob/master/docs/api.md#optionskey-opt). When the `string` is set as above, it is converted as follows.
> ```yaml
> text:
>  default: foo
> ```

After that, just do it like this.

```bash
moza html --text baz path/to/baz.html
# <p>baz</p>
```


## Other commands

### `ls`

Show enabled command list on put the local(`./.moza/*.hbs`). When add `--global` falg,  global(`~/.config/moza/*.hbs`) command list is shown.

```bash
moza ls
```

### `add`

Can fetch `.hbs` file from remote url. it put on local in default but this too can put on global using `--global`

```bash
moza add <url> --output foo.hbs
```

### `note`

Show text of `NOTE` part of the option of Front-matter.

```bash
# baz.hbs
# ---
# NOTE: baz note
# ---
#
# <p></p>

moza note baz
# baz note
```
