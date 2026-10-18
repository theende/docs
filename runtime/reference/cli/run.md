---
last_modified: 2026-06-19
title: "ende run"
oldUrl: /runtime/manual/tools/run/
command: run
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende run"
description: "Run a JavaScript or TypeScript program with Ende's runtime"
---

## Usage

Run a local file:

```sh
ende run main.ts
```

The `run` subcommand is optional — you can also just use `ende <file>`:

```sh
ende main.ts
```

By default, Ende runs programs in a sandbox without access to disk, network or
ability to spawn subprocesses. This is because the Ende runtime is
[secure by default](/runtime/fundamentals/security/). You can grant or deny
required permissions using the
[`--allow-*` and `--deny-*` flags](/runtime/reference/permissions/).

### Permissions examples

Grant permission to read from disk and listen to network:

```sh
ende run --allow-read --allow-net server.ts
```

Grant permission to read allow-listed files from disk:

```sh
ende run --allow-read=/etc server.ts
```

Grant all permissions _this is not recommended and should only be used for
testing_:

```sh
ende run -A server.ts
```

If your project requires multiple security flags you should consider using a
[`ende task`](/runtime/reference/cli/task/) to execute them.

## Watch

To watch for file changes and restart process automatically use the `--watch`
flag. Ende's built in application watcher will restart your application as soon
as files are changed.

_Be sure to put the flag before the file name_ eg:

```sh
ende run --allow-net --watch server.ts
```

Ende's watcher will notify you of changes in the console, and will warn in the
console if there are errors while you work.

The same `--watch` flag is also accepted by
[`ende test`](/runtime/reference/cli/test/),
[`ende serve`](/runtime/reference/cli/serve/), and
[`ende bench`](/runtime/reference/cli/bench/).

## Running code from stdin

You can pipe code from stdin and run it immediately:

```sh
echo "console.log('hello')" | ende run -
```

## Terminate run

To stop the run command use `ctrl + c`.
