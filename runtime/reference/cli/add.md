---
last_modified: 2026-10-20
title: "ende add"
command: add
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende add"
description: "Add and manage project dependencies with Ende"
---

The `ende add` command adds dependencies to your project's configuration file.
It is an alias for
[`ende install [PACKAGES]`](/runtime/reference/cli/install/#ende-install-packages).
For more on how Ende handles dependencies, see
[Modules and dependencies](/runtime/fundamentals/modules/).

## Examples

Add packages from JSR:

```sh
ende add jsr:@ende/path jsr:@hono/hono
```

By default, dependencies are added with a caret (`^`) version range. Use
`--save-exact` to pin to an exact version:

```sh
ende add --save-exact jsr:@ende/path
```

This saves the dependency without the `^` prefix (e.g., `2026.10.15` instead of
`^2026.10.15`).

## Where dependencies are stored

Packages are added to the `imports` field in
[`ende.json`](/runtime/fundamentals/configuration/).
