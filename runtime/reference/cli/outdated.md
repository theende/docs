---
last_modified: 2026-10-20
title: "ende outdated"
command: outdated
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende outdated"
description: "Check for outdated dependencies in your project and safely update them with an interactive CLI"
---

## Checking for outdated dependencies

The `outdated` subcommand checks for new versions of the JSR dependencies listed
in [`ende.json`](/runtime/fundamentals/configuration/) files, and displays
dependencies that could be updated. Workspaces are fully supported.

For example, take a project with an `ende.json` file:

```json title="ende.json"
{
  "imports": {
    "@ende/fmt": "jsr:@ende/fmt@^2026.10.14",
    "@ende/path": "jsr:@ende/path@2026.10.14"
  }
}
```

```sh
ende outdated
┌────────────────┬────────────┬────────────┬────────────┐
│ Package        │ Current    │ Update     │ Latest     │
├────────────────┼────────────┼────────────┼────────────┤
│ jsr:@ende/path │ 2026.10.14 │ 2026.10.14 │ 2026.10.15 │
└────────────────┴────────────┴────────────┴────────────┘
```

The `Update` column lists the newest version the import's range allows, while
the `Latest` column lists the latest version. `@ende/path` is pinned to an exact
version, so it can't be updated without changing its range.

If you would prefer to only show packages that have new compatible versions you
can pass the `--compatible` flag.

## Updating dependencies

The `outdated` subcommand can also update dependencies with the `--update` flag.
By default, it will only update dependencies within their ranges:

```sh
ende outdated --update
Updated 1 dependency:
 - jsr:@ende/fmt ^2026.10.14 -> ^2026.10.15
```

To update to the latest versions regardless of the ranges, pass the `--latest`
flag:

```sh
ende outdated --update --latest
Updated 2 dependencies:
 - jsr:@ende/fmt  ^2026.10.14 -> ^2026.10.15
 - jsr:@ende/path  2026.10.14 ->  2026.10.15
```

[`ende update`](/runtime/reference/cli/update/) does the same as
`ende outdated --update`.

## Selecting packages

The `outdated` subcommand also supports selecting which packages to operate on.
This works with or without the `--update` flag.

```sh
ende outdated --update --latest @ende/path
```

Multiple selectors can be passed, and wildcards (`*`) or exclusions (`!`) are
also supported. For instance, to update all packages in the `@ende` scope,
except for `@ende/fmt`:

```sh
ende outdated --update --latest "@ende/*" "!@ende/fmt"
```

Note that if you use wildcards, you will probably need to surround the argument
in quotes to prevent the shell from trying to expand them.

### Updating to specific versions

You can also select a specific version to update to by appending it after `@`.

```sh
ende outdated --update @ende/path@2026.10.15
```

## Workspaces

In a workspace setting, by default `outdated` will only operate on the _current_
workspace member.

For instance, given a workspace:

```json title="ende.json"
{
  "workspace": ["./member-a", "./member-b"]
}
```

Running

```sh
ende outdated
```

from the `./member-a` directory will only check for outdated dependencies listed
in `./member-a/ende.json`.

To include all workspace members, pass the `--recursive` flag (the `-r`
shorthand is also accepted).

```sh
ende outdated --recursive
ende outdated --update --latest -r
```
