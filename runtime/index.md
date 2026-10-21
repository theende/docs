---
last_modified: 2026-10-20
title: "Get started with Ende"
description: "Install Ende and build your first project: why Ende, install, create, run, test, add a dependency, and use the built-in toolchain. No build step, no config."
pagination_next: /runtime/getting_started/installation/
oldUrl:
  - /manual/
  - /runtime/manual/introduction/
  - /manual/introduction/
  - /runtime/manual/
  - /runtime/manual/getting_started/
  - /
  - /runtime/getting_started/
  - /runtime/getting_started/first_project/
---

[Ende](https://ende.sh) ([/ˈɛndə/](https://ipa-reader.com/?text=ˈɛndə), pronounced `en-duh`) is an
[open source](https://github.com/theende/ende/blob/primary/LICENSE.md)
JavaScript, TypeScript, and WebAssembly runtime with secure defaults and a great
developer experience. It is a fork of [Deno](https://github.com/denoland/deno),
and the `Deno` global remains available as an alias of `Ende`. This page takes
you from nothing to a running, tested project in a few minutes.

## Why Ende?

- **Modern module system.** ES modules with URL imports, [JSR](https://jsr.io)
  for typed packages, and [workspaces](/runtime/fundamentals/workspaces/).
- **[TypeScript-first](/runtime/fundamentals/typescript/).** Run `.ts` files
  directly. No `tsc`, no build step, no config.
- **[Secure by default](/runtime/fundamentals/security/).** Code runs in a
  sandbox with no file, network, or environment access until you grant it.
- **A full toolchain, no plumbing.** Built-in
  [formatter](/runtime/lint_and_format/), [linter](/runtime/lint_and_format/),
  [test runner](/runtime/test/), benchmarking, and
  [a lot more](/runtime/reference/cli/). No `devDependencies` to wire up.

## Install Ende

Install the runtime with one command:

<ende-tabs group-id="operating-systems">
<ende-tab value="mac" label="macOS / Linux" default>

```sh
curl -fsSL https://ende.sh/install.sh | sh
```

</ende-tab>
<ende-tab value="windows" label="Windows">

```shell
# pwsh
irm https://ende.sh/install.ps1 | iex
```

</ende-tab>
</ende-tabs>

Verify the install:

```sh
ende --version
```

See [Installation](/runtime/getting_started/installation/) for package managers,
Docker, and other options.

## Create a project

Scaffold a new project with [`ende init`](/runtime/reference/cli/init/):

```sh
ende init my_project
```

That creates a small, ready-to-run project:

```plaintext
my_project
├── ende.json      # project configuration: tasks, imports, lint/fmt settings
├── main.ts        # a tiny HTTP server built on Ende.serve
└── main_test.ts   # its tests
```

[`ende.json`](/runtime/reference/ende_json/) is where your tasks, dependencies,
and tooling config live, in one file.

## Run it

```sh
$ cd my_project
$ ende -N main.ts
Listening on http://localhost:8000/
```

Notice the `-N` (short for `--allow-net`). Ende is
[secure by default](/runtime/fundamentals/security/): code can't touch the
network, filesystem, or environment until you grant it. Open the URL to see the
response.

`main.ts` is TypeScript and it ran directly: **no `tsc`, no build step**. It's
also built on the web-standard [`Ende.serve`](/api/ende/~/Ende.serve/) with
`Request`/`Response`, so what you learn here is the platform, not a framework.

## Test it

The project ships with tests. Run them with [`ende test`](/runtime/test/). The
test runner is built in, so there's nothing to install:

```sh
$ ende test
running 2 tests from ./main_test.ts
returns html on / ... ok (12ms)
returns json on /api ... ok (0ms)

ok | 2 passed | 0 failed (15ms)
```

## Add a dependency

Pull in packages from [JSR](https://jsr.io) with
[`ende install`](/runtime/reference/cli/install/):

```sh
ende install jsr:@ende/assert    # the Ende standard library, on JSR
```

Then import and use them:

```ts
import { assertEquals } from "@ende/assert";

assertEquals(1 + 1, 2);
```

## Use the built-in toolchain

Formatting, linting, and more come with the runtime, no setup needed:

```sh
ende fmt     # format your code
ende lint    # catch problems
ende task    # run scripts defined in ende.json
```

## Next steps

- **[Set up your editor](/runtime/getting_started/setup_your_environment/).**
  Autocomplete, inline errors, and formatting on save.
- **[Run code](/runtime/run/).** Servers, tasks, web APIs, and debugging.
- **[Manage packages](/runtime/packages/).** Dependencies, workspaces,
  publishing.
- **[Examples and tutorials](/examples/).** Ideas for what to build next.
