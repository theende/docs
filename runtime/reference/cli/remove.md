---
last_modified: 2026-10-20
title: "ende remove"
command: remove
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende remove"
description: "Remove a dependency from your project"
---

`ende remove` removes dependencies from your project's configuration file. It is
the inverse of [`ende add`](/runtime/reference/cli/add/).

## Basic usage

Remove a package:

```sh
ende remove @ende/path
```

Remove multiple packages at once:

```sh
ende remove @ende/path @ende/assert
```

## Where dependencies are removed from

`ende remove` removes the matching dependency from
[`ende.json`](/runtime/fundamentals/configuration/).

Removing a dependency does not delete it from the global cache. To reclaim disk
space, see [`ende clean`](/runtime/reference/cli/clean/).

## Removing a global executable

Pass `--global` (or `-g`) to remove a globally installed executable script, the
same as [`ende uninstall --global`](/runtime/reference/cli/uninstall/):

```sh
ende remove --global serve
```

A global removal targets a single executable, so you cannot combine `--global`
with multiple names. Use `--root` to target a custom installation root.
