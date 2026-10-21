---
last_modified: 2026-10-20
title: "Config files"
description: "How Ende projects are configured: the ende.json file, .jsonc support and discovery, and an overview of what you can configure. See the ende.json reference for every field."
oldUrl:
  - /runtime/manual/getting_started/configuration_file/
---

Ende is configured with an `ende.json` file. It is optional: scripts run without
one, and you add it when you want to declare dependencies or configure Ende's
tooling, such as the formatter, linter, TypeScript compiler, or tasks.

## ende.json

`ende.json` is where you configure Ende itself: tasks, dependencies, and tools
like the TypeScript compiler, linter, and formatter. It is optional; a minimal
file looks like this:

```json title="ende.json"
{
  "tasks": {
    "dev": "ende run --watch main.ts"
  },
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15"
  },
  "fmt": {
    "lineWidth": 100
  }
}
```

It supports `.json` and
[`.jsonc`](https://code.visualstudio.com/docs/languages/json#_json-with-comments)
extensions, so with `ende.jsonc` you can add comments and trailing commas.

Ende automatically detects a `ende.json` or `ende.jsonc` file in your current
working directory or any parent directory, which is what makes a project's
settings apply to every file under it. Use the `--config` flag to point at a
different file. In a monorepo, a root `ende.json` can define a
[workspace](/runtime/fundamentals/workspaces/) whose members each carry their
own `ende.json`.

Ende still reads `deno.json`, `deno.jsonc` and `deno.lock`, and `DENO_*`
environment variables, as fallbacks for projects coming from Deno. They print a
deprecation warning, and the `ende.*` names take precedence when both exist.

## What you can configure

A `ende.json` file configures Ende's tooling and your project. Every field is
documented in the
[Configuration file (ende.json) reference](/runtime/reference/ende_json/),
including:

- [Dependencies and import maps](/runtime/reference/ende_json/#dependencies)
- [Tasks](/runtime/reference/ende_json/#tasks)
- [Linting](/runtime/reference/ende_json/#linting) and
  [formatting](/runtime/reference/ende_json/#formatting)
- [Lockfile](/runtime/reference/ende_json/#lockfile)
- [TypeScript compiler options](/runtime/reference/ende_json/#typescript-compiler-options)
- [Unstable feature flags](/runtime/reference/ende_json/#unstable-features)
- [`include` and `exclude`](/runtime/reference/ende_json/#include-and-exclude)
- [Exports](/runtime/reference/ende_json/#exports)
- [Permissions](/runtime/reference/ende_json/#permissions)
- [Compile options](/runtime/reference/ende_json/#compile-config)
- [Minimum dependency age](/runtime/reference/ende_json/#minimum-dependency-age)

See the reference for a
[full example ende.json file](/runtime/reference/ende_json/#an-example-endejson-file)
and the [JSON schema](/runtime/reference/ende_json/#json-schema) for editor
autocompletion.
