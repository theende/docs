---
last_modified: 2026-10-20
title: "Run code"
description: "Run JavaScript and TypeScript with Ende: the secure-by-default permission model, running files, URLs and stdin, script arguments, watch mode, and project tasks."
oldUrl:
  - /manual/getting_started/command_line_interface
  - /runtime/manual/getting_started/command_line_interface/
  - /runtime/getting_started/command_line_interface/
  - /runtime/fundamentals/command_line_interface/
  - /runtime/manual/tools/
---

Ende runs JavaScript and TypeScript directly (no build step, no config) behind a
security sandbox that grants access only when you ask for it. This page covers
how your code actually runs: permissions, the ways to launch it, watch mode, and
tasks.

## Run a file

Point Ende at a file. TypeScript runs as-is:

```sh
ende run main.ts
```

`ende run` is explicit, but you can drop `run` for a file or task and Ende will
figure it out:

```sh
ende main.ts          # same as `ende run main.ts`
```

## Permissions: secure by default

This is the part that's different from Node. Code runs in a sandbox with **no
access to the network, filesystem, environment, or subprocesses** until you
grant it. A script that tries to read a file without permission stops and asks,
or fails if prompts are disabled.

Grant access with `--allow-*` flags (each has a short form), and scope them down
to exactly what's needed:

```sh
ende run --allow-net main.ts                     # network    (-N)
ende run --allow-read=./data main.ts             # filesystem (-R), scoped
ende run -N=api.example.com -E main.ts           # combined, short forms
```

Use `--deny-*` to carve out exceptions, or `-A` / `--allow-all` to skip the
sandbox entirely. That is handy in trusted environments, but it gives up the
guarantees. See [Permissions](/runtime/reference/permissions/) for every flag
and [Security](/runtime/fundamentals/security/) for the model behind them.

## Passing script arguments

Arguments for your own script go **after** the script name; Ende passes them
through in [`Ende.args`](/api/ende/~/Ende.args/):

```ts title="main.ts"
console.log(Ende.args);
```

```shell
$ ende run main.ts arg1 arg2 arg3
[ "arg1", "arg2", "arg3" ]
```

For anything beyond a flat list, parse the arguments with
[`parseArgs` from `jsr:@ende/cli`](https://jsr.io/@ende/cli/doc/parse-args/~/parseArgs)
or
[`parseArgs` from `node:util`](https://nodejs.org/api/util.html#utilparseargsconfig).

### Argument and flag ordering

> [!CAUTION]
> Anything passed after the script name is a script argument, not an Ende
> runtime flag. This is a common source of confusion, so make sure runtime flags
> appear **before** the script name.

This leads to the following pitfall:

```shell
# Good. We grant net permission to net_client.ts.
ende run --allow-net net_client.ts

# Bad! --allow-net was passed to Ende.args, throws a net permission error.
ende run net_client.ts --allow-net
```

## Run from a URL or stdin

Ende can run code straight from a URL (handy for one-off tools and installers)
or from stdin:

```sh
ende run https://example.com/script.ts
echo 'console.log(1 + 1)' | ende run -
```

Remote code is sandboxed like everything else: it gets no permissions unless you
grant them.

## Reload on change with watch mode

Add `--watch` and Ende reruns your program whenever a file it depends on
changes. No `nodemon`, no extra dependency:

```sh
ende run --watch main.ts
```

`ende test`, `ende fmt`, and others accept `--watch` too. For what gets watched,
excluding paths, and hot module replacement, see
[Watch mode and HMR](/runtime/run/watch_mode/).

## Run project tasks

Define repeatable commands in `ende.json` and run them with
[`ende task`](/runtime/reference/cli/task/):

```json title="ende.json"
{
  "tasks": {
    "dev": "ende run --watch --allow-net main.ts",
    "start": "ende run --allow-net main.ts"
  }
}
```

```sh
ende task dev
```

Tasks can run other tasks, set environment variables, and work cross-platform.

## Try code quickly

For experiments, evaluate an expression inline or open a REPL:

```sh
ende eval "console.log(Ende.version)"
ende repl
```

## Going further

- **[Write an HTTP server](/runtime/fundamentals/http_server/).** Handle
  requests with the web-standard [`Ende.serve`](/api/ende/~/Ende.serve/).
- **[Web development](/runtime/fundamentals/web_dev/).** Build apps with Fresh,
  Next.js, Astro, and web-standard APIs.
- **[Web platform APIs](/runtime/reference/web_platform_apis/).** `fetch`,
  `Request`/`Response`, streams, Web Crypto, and the other browser globals Ende
  implements.
- **[Debugging](/runtime/fundamentals/debugging/).** Attach Chrome DevTools or
  your editor's debugger.
- **[ende run reference](/runtime/reference/cli/run/).** Every flag in detail.
