---
last_modified: 2025-07-01
title: "ende update"
command: update
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende update"
description: "Update outdated dependencies with an interactive CLI"
---

`ende update` updates dependencies in your
[`ende.json`](/runtime/fundamentals/configuration/). See
[Modules](/runtime/fundamentals/modules/) for more about managing dependencies.

## Updating dependencies

By default, the `update` subcommand will only update dependencies within their
version ranges:

```sh
ende update
Updated 1 dependency:
 - jsr:@ende/fmt ^2026.10.14 -> ^2026.10.15
```

To update to the latest versions regardless of the ranges, pass the `--latest`
flag:

```sh
ende update --latest
Updated 2 dependencies:
 - jsr:@ende/fmt  ^2026.10.14 -> ^2026.10.15
 - jsr:@ende/path  2026.10.14 ->  2026.10.15
```

## Selecting packages

The `update` subcommand also supports selecting which packages to operate on.

```sh
ende update --latest @ende/path
```

Multiple selectors can be passed, and wildcards (`*`) or exclusions (`!`) are
also supported. For instance, to update all packages in the `@ende` scope,
except for `@ende/fmt`:

```sh
ende update --latest "@ende/*" "!@ende/fmt"
```

Note that if you use wildcards, you will probably need to surround the argument
in quotes to prevent the shell from trying to expand them.

### Updating to specific versions

You can also select a specific version to update to by appending it after `@`.

```sh
ende update @ende/path@2026.10.15
```

## Workspaces

In a workspace setting, by default `update` will only operate on the _current_
workspace member.

For instance, given a workspace:

```json title="ende.json"
{
  "workspace": ["./member-a", "./member-b"]
}
```

Running

```sh
ende update
```

from the `./member-a` directory will only update dependencies listed in
`./member-a/ende.json`.

To include all workspace members, pass the `--recursive` flag (the `-r`
shorthand is also accepted).

```sh
ende update --recursive
ende update --latest -r
```
