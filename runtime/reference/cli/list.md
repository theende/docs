---
last_modified: 2026-10-20
title: "ende list"
command: list
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende list"
description: "List the dependencies declared in your project"
---

The `ende list` command prints the packages your project declares as
dependencies. It reads them from the `imports` in your
[`ende.json`](/runtime/fundamentals/configuration/), resolves each to the
version currently in use, and prints them grouped by package.

It answers a different question than
[`ende info`](/runtime/reference/cli/info/): `ende info` walks the module graph
from an entrypoint and reports every file it reaches, while `ende list` reports
what the project depends on straight from the manifest, without an entrypoint.

## Usage

```sh
ende list [OPTIONS] [filters...]
```

By default `ende list` prints a flat table of your direct dependencies. Optional
positional `filters` narrow the output by package name and support wildcards and
`!` negation, the same matcher
[`ende outdated`](/runtime/reference/cli/outdated/) uses.

## Options

| Option        | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `--depth <N>` | Render the resolved dependency tree N levels deep (read from the lockfile). |
| `--recursive` | Include the dependencies of every workspace member.                         |

## Examples

List direct dependencies:

```sh
ende list
```

Show the dependency tree two levels deep:

```sh
ende list --depth 2
```

List only dependencies whose name starts with `@ende/`:

```sh
ende list "@ende/*"
```
