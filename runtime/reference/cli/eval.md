---
last_modified: 2026-05-20
title: "ende eval"
oldUrl: /runtime/manual/tools/eval/
command: eval
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende eval"
description: "Evaluate JavaScript and TypeScript code in the command line"
---

`ende eval` executes a string of code directly from the command line without
needing a file. Unlike `ende run`, **`ende eval` runs with all permissions
enabled by default**.

## Basic usage

```sh
ende eval "console.log('Hello from Ende')"
```

TypeScript works out of the box:

```sh
ende eval "const greeting: string = 'Hello'; console.log(greeting)"
```

## Printing expression results

Use `--print` (or `-p`) to evaluate an expression and print its result, similar
to `node -p`:

```sh
ende eval -p "1 + 2"
# 3

ende eval -p "Ende.version"
# { ende: "2.x.x", v8: "...", typescript: "..." }
```

## Reading from stdin

Combine with piped input for quick data processing:

```sh
echo '{"name":"ende"}' | ende eval -p "
  const text = await new Response(Ende.stdin.readable).text();
  JSON.parse(text).name
"
```
