---
last_modified: 2026-10-20
title: "ende watch"
command: watch
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende watch"
description: "Run a program in watch mode with hot module replacement"
---

The `ende watch` command runs a program and reloads it when its source files
change. It is a shorthand for
[`ende run --watch-hmr`](/runtime/reference/cli/run/): the program runs with hot
module replacement enabled, so on a change Ende swaps the updated modules in
place where it can instead of doing a full restart.

## Usage

```sh
ende watch main.ts
```

This is equivalent to:

```sh
ende run --watch-hmr main.ts
```

Because `ende watch` reuses `ende run`, every `ende run` flag works, including
the watch options:

- `--watch-hmr=<paths>` adds extra paths to watch.
- `--watch-exclude=<paths>` excludes paths from triggering a reload.
- `--no-clear-screen` keeps previous output instead of clearing the screen on
  each reload.

```sh
ende watch --watch-exclude=dist/ -RN main.ts
```
