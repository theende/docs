---
last_modified: 2026-10-20
title: "ende types"
oldUrl: /runtime/manual/tools/types/
command: types
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende types"
description: "Print Ende's built-in TypeScript type declarations"
---

`ende types` prints the TypeScript type declarations for all Ende-specific APIs.
This is useful for editors and tools that need Ende's type information.

## Basic usage

Print type declarations to stdout:

```sh
ende types
```

Save to a file for use with an editor or type checker:

```sh
ende types > ende.d.ts
```

## When to use this

Editors connected to the
[Ende language server](/runtime/getting_started/setup_your_environment/) handle
types automatically. You may need `ende types` if you are:

- Using an editor without Ende LSP support
- Generating type declarations for a build pipeline
- Inspecting which APIs are available at your current Ende version
