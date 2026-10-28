---
last_modified: 2026-10-28
title: Coming from Deno
description: "Move a Deno project to Ende: what keeps working, what to rename, how to replace npm and Node imports, and which Deno features Ende removed."
---

Ende is a fork of [Deno](https://github.com/denoland/deno), and most Deno
projects run on it unchanged. Install Ende, run your project, and follow the
warnings it prints. This page walks through what keeps working, what to rename,
and what to replace.

## Run your project as it is

[Install Ende](/runtime/getting_started/installation/), then run your entry
point the way you ran it with Deno:

```sh
ende run --allow-net main.ts
```

Your code and config keep working without changes:

- The `Deno` global is a permanent alias of `Ende`, so `Deno.serve()` and
  `Ende.serve()` are the same function.
- `deno.json`, `deno.jsonc` and `deno.lock` are read when no `ende.*` file
  exists.
- `DENO_*` environment variables are read when their `ENDE_*` counterpart isn't
  set.
- `deno-lint-ignore` and `deno-fmt-ignore` comments are still honored.

Each fallback prints a deprecation warning, so the warnings double as a to-do
list for the rest of this page.

## Rename config files and variables

Rename these at your own pace. When both names exist, the `ende` one wins.

| Deno            | Ende            |
| --------------- | --------------- |
| `deno.json`     | `ende.json`     |
| `deno.jsonc`    | `ende.jsonc`    |
| `deno.lock`     | `ende.lock`     |
| `DENO_*`        | `ENDE_*`        |
| `deno-*-ignore` | `ende-*-ignore` |

Renaming `Deno.` to `Ende.` in your code is optional. One exception:
`Deno.version.deno` no longer exists, so read `Ende.version.ende` instead.

See [Config files](/runtime/fundamentals/configuration/) and
[Environment variables](/runtime/reference/env_variables/) for details.

## Replace npm and Node imports

Ende doesn't support npm packages, Node built-ins or CommonJS. Imports of
`npm:` and `node:*` specifiers fail with an error naming the import, and
`package.json` and `node_modules` are ignored. Dependencies come from
[JSR](https://jsr.io) and URLs.

For each npm package, look for a JSR equivalent, or use a web platform API. The
Node globals have web-standard replacements:

```ts
// Before
import { readFileSync } from "node:fs";
const text = readFileSync("config.txt", "utf8");
const port = process.env.PORT;
const bytes = Buffer.from("hello");

// After
const text = Ende.readTextFileSync("config.txt");
const port = Ende.env.get("PORT");
const bytes = new TextEncoder().encode("hello");
```

For zlib, use
[`CompressionStream` and `DecompressionStream`](/runtime/reference/web_platform_apis/#compressionstream-and-decompressionstream),
or `Ende.Inflater` and `Ende.deflateSync` for synchronous and incremental work
(Ende 2026.10.22+).

See [Modules](/runtime/fundamentals/modules/) and
[Dependency management](/runtime/packages/) for how imports work in Ende.

## Switch to the Ende standard library

The standard library is published as `@ende/*` on JSR. Replace `@std/*` imports
with their `@ende/*` counterparts:

```sh
ende remove @std/assert
ende add jsr:@ende/assert
```

Some `@std/*` packages read `Deno.version.deno` and break on Ende, so switch
even if your imports seem to work. Browse the packages in the
[standard library reference](/runtime/reference/std/).

## Drop features Ende removed

Ende removed these Deno features. Removed `--unstable-*` flags print a tip
saying they aren't supported, and removed `unstable` entries in `ende.json` are
ignored with a warning.

| Removed                                      | What to do instead                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Deno KV (`Deno.openKv`) and KV Connect       | Use any database; [Disc](https://disc.sh) generates TypeScript types from your schema |
| `deno bundle` and `Deno.bundle`              | Use an external bundler, or ship modules as they are                                  |
| Deno Deploy, `deno sandbox` and tunneling    | Build a binary with `ende compile` and host it anywhere                               |
| `deno jupyter`                               | No replacement                                                                        |
| `deno pack`, `deno audit`, `approve-scripts` | Not needed without npm packages                                                       |
| NAPI native addons                           | Use [FFI](/runtime/fundamentals/ffi/)                                                 |

For older APIs such as `Deno.run` and `deno vendor`, see
[Removed and deprecated APIs](/runtime/reference/migrate_deprecations/). For
the flags that remain, see
[Unstable feature flags](/runtime/reference/cli/unstable_flags/).
