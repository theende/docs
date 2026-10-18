---
last_modified: 2026-06-11
title: "Configure a monorepo with workspaces"
description: "Set up an Ende workspace with multiple packages: member names and exports, glob patterns, root-only options, and shared imports."
url: /examples/workspaces_monorepo_tutorial/
---

A workspace is a collection of folders, each with its own `ende.json`, managed
from a single root. Members can import each other by name, share dependencies,
and run tools like `ende test` and `ende fmt` across the whole repository at
once.

## Create the workspace

The root `ende.json` lists the member directories:

```json title="ende.json"
{
  "workspace": ["./utils", "./app"]
}
```

Each member gets its own `ende.json` with a `name`, a `version`, and an
`exports` field pointing at its entry point:

```json title="utils/ende.json"
{
  "name": "@acme/utils",
  "version": "0.1.0",
  "exports": "./mod.ts"
}
```

```ts title="utils/mod.ts"
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

```json title="app/ende.json"
{
  "name": "@acme/app",
  "version": "0.1.0",
  "exports": "./main.ts"
}
```

Other members import `@acme/utils` by its bare name: no relative paths and no
import map entry needed. Ende finds the member through the root `workspace` list
and resolves the import through its `exports`:

```ts title="app/main.ts"
import { greet } from "@acme/utils";

console.log(greet("workspace"));
```

```sh
$ ende run app/main.ts
Hello, workspace!
```

## Matching members with globs

Listing every member gets tedious in larger repositories. Each `/*` segment
matches one folder depth: `packages/*` matches `packages/foo` but not
`packages/foo/subpackage`.

```json title="ende.json"
{
  "workspace": ["packages/*", "examples/*/*"]
}
```

## Options that must live at the root

Some options control resolution for the whole workspace and are only read from
the root `ende.json`: `nodeModulesDir`, `vendor`, `minimumDependencyAge`,
`links`, `lock`, and `allowScripts`. Setting them in a member has no effect and
Ende will warn about it.

> [!NOTE]
> `name`, `version`, and `exports` go the other way: they belong in members, not
> in the root.

## Sharing dependencies from the root

Members inherit the root `imports` map, so common dependencies can be declared
once:

```json title="ende.json"
{
  "workspace": ["./utils", "./app"],
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15"
  }
}
```

A member can declare its own `imports` too; within that member's folder, its
entries override the root's.
