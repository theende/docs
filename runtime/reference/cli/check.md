---
last_modified: 2026-10-20
title: "ende check"
oldUrl: /runtime/manual/tools/check/
command: check
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende check"
description: "Download and type-check code without execution"
---

`ende check` type-checks your TypeScript (or JavaScript) code without running
it. This is useful in CI pipelines or before deploying to catch type errors
early. For more on TypeScript in Ende, see the
[TypeScript](/runtime/fundamentals/typescript/) guide.

## Basic usage

```sh
ende check main.ts
```

Check multiple files:

```sh
ende check src/server.ts src/utils.ts
```

## Scoping and excluding files

You can pass directories or globs as positional arguments to type-check a whole
tree at once:

```sh
ende check src/
ende check "src/**/*.ts"
```

To skip files or directories, use the top-level `exclude` field in `ende.json`.
It applies to `ende check` along with other subcommands like `ende fmt` and
`ende lint`:

```jsonc title="ende.json"
{
  "exclude": ["dist/", "vendor/", "**/*.generated.ts"]
}
```

See [include and exclude](/runtime/reference/ende_json/#include-and-exclude) in
the configuration reference for the full glob syntax, including how to
un-exclude a sub-path.

## Type-checking remote modules

By default, only local modules are type-checked. Use `--all` to also type-check
remote dependencies:

```sh
ende check --all main.ts
```

## Type-checking JavaScript files

If you have a JavaScript project and want to type-check it without adding
`// @ts-check` to every file, use the `--check-js` flag:

```sh
ende check --check-js main.js
```

## Using in CI

`ende check` exits with a non-zero status code if there are type errors, making
it suitable for CI pipelines:

```sh
ende check main.ts && echo "Types OK"
```

Note that [`ende test`](/runtime/reference/cli/test/) and
[`ende bench`](/runtime/reference/cli/bench/) already perform type-checking by
default, so you don't need a separate `ende check` step if you're already
running tests. Use `ende check` when you want to type-check without running
anything — for example, as a fast early step in CI:

```sh
ende check main.ts
ende lint
ende test
```
