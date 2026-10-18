---
last_modified: 2026-10-18
title: "ende create"
command: create
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende create"
description: "Scaffold a new project from a template package"
---

The `ende create` command scaffolds a new project from a template package
published on [JSR](https://jsr.io/).

## Usage

```sh
ende create [OPTIONS] [PACKAGE] [-- [ARGS]...]
```

The `[PACKAGE]` argument needs a `jsr:` prefix, or the `--jsr` flag for an
unprefixed name.

## How it works

A JSR package acts as a template by defining a `./create` entry point in its
[`ende.json`](/runtime/fundamentals/configuration/):

```json title="ende.json"
{
  "name": "@my-scope/my-template",
  "version": "1.0.0",
  "exports": {
    ".": "./mod.ts",
    "./create": "./create.ts"
  }
}
```

When you run `ende create jsr:@my-scope/my-template`, Ende looks for the
`./create` export and runs it as the scaffolding script.

## Examples

Create a project from a JSR package:

```sh
ende create jsr:@my-scope/my-template
```

Pass arguments to the template package:

```sh
ende create jsr:@my-scope/my-template -- --force
```

## Flags

- `--jsr` - Treat unprefixed package names as JSR packages
- `-y, --yes` - Bypass the prompt and run with full permissions
