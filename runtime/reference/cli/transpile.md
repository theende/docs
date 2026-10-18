---
last_modified: 2026-05-20
title: "ende transpile"
command: transpile
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende transpile"
description: "Transpile TypeScript, JSX, or TSX to JavaScript"
---

The `ende transpile` command emits JavaScript from TypeScript, JSX, or TSX
sources. It's useful when you need plain `.js` output to ship to a runtime that
doesn't understand TypeScript, or to feed into a build step that expects
JavaScript.

For most workflows you do **not** need `ende transpile` — `ende run`,
`ende test`, and `ende serve` already accept `.ts` / `.tsx` files directly.
Reach for it when:

- You're shipping JavaScript to consumers that can't run TypeScript, such as a
  browser.
- A downstream tool only understands `.js`.
- You want pre-compiled `.js` checked into a build artifact rather than
  transpiled on the fly.

## Usage

```sh
ende transpile <files...> [flags]
```

`<files>` is one or more source file paths (globs are expanded by the shell).
`ende transpile` does **not** crawl a directory — pass the files you want
transpiled, optionally via a shell glob.

### Output modes

| Mode                           | Effect                                                           |
| ------------------------------ | ---------------------------------------------------------------- |
| _no output flag_               | Write the transpiled output to standard out.                     |
| `-o <path>`, `--output <path>` | Write the output to a single file. Conflicts with `--outdir`.    |
| `--outdir <dir>`               | Write each input file into `<dir>`, mirroring the source layout. |

```sh
# Print to stdout
ende transpile main.ts

# Write to a single file
ende transpile main.ts -o dist/main.js

# Transpile multiple files into an output directory
ende transpile src/main.ts src/helpers.ts --outdir dist

# Use a shell glob
ende transpile src/*.ts --outdir dist
```

### Input / output extension mapping

| Input  | Output | Source map |
| ------ | ------ | ---------- |
| `.ts`  | `.js`  | `.js.map`  |
| `.tsx` | `.js`  | `.js.map`  |
| `.jsx` | `.js`  | `.js.map`  |
| `.mts` | `.mjs` | `.mjs.map` |
| `.cts` | `.cjs` | `.cjs.map` |

JSX transform, decorators, target, and other emit settings come from
`compilerOptions` in your `ende.json` (or `tsconfig.json`), so the output
matches what `ende run` would execute. See
[TypeScript compiler options](/runtime/fundamentals/typescript/#configuring-typescript-compiler-options)
for the full list.

### Source maps

Pass `--source-map` with one of:

| Mode       | Effect                                                 |
| ---------- | ------------------------------------------------------ |
| `none`     | (default) no source map                                |
| `inline`   | embed the source map as a `data:` comment in each file |
| `separate` | write a sibling `.js.map` (or `.mjs.map` / `.cjs.map`) |

```sh
ende transpile main.ts -o dist/main.js --source-map separate
```

### Type declarations

Use `--declaration` to emit `.d.ts` declaration files. Declarations are produced
by `tsc` (using the bundled TypeScript), so this flag honors the
`compilerOptions` from your `ende.json` / `tsconfig.json`.

`.d.ts` files are always written to disk — next to the source when no output
location is set, or into `--outdir` when one is supplied — even if the
JavaScript output is going to stdout or a single `-o` file.

```sh
ende transpile src/*.ts --outdir dist --declaration
```

## How it differs from `tsc`

`ende transpile` and TypeScript's `tsc` overlap, but they aren't drop-in
replacements for each other:

| Concern                  | `ende transpile`                                       | `tsc`                            |
| ------------------------ | ------------------------------------------------------ | -------------------------------- |
| **Type checking**        | None — emit only. Use `ende check` separately.         | Full type checking by default.   |
| **`.d.ts` generation**   | Yes, with `--declaration`. Delegates to bundled `tsc`. | Yes.                             |
| **JSR / remote imports** | Resolves them.                                         | Doesn't resolve them.            |
| **Config source**        | `ende.json` (or `tsconfig.json`).                      | `tsconfig.json` only.            |
| **Speed**                | Fast SWC-based emit.                                   | Slower (type-checking included). |

If you want type errors to surface, run
[`ende check`](/runtime/reference/cli/check/) before or after transpilation.
`ende transpile` will happily emit code that fails to type-check.

## Caveats

- **No bundling.** Each input file produces one output file, and import
  specifiers are left as written: `./foo.ts` stays `./foo.ts` in the output, so
  rewrite relative imports yourself if the JavaScript will run somewhere that
  doesn't resolve `.ts` files.
- **No directory crawl.** Passing a directory does nothing — pass the files
  explicitly (`src/**/*.ts`) or via a glob.
- **Source maps and stdout.** `--source-map inline` works when writing to
  stdout; `separate` requires an output path it can write the map next to.

## See also

- [`ende check`](/runtime/reference/cli/check/) — type-check without emitting
- [TypeScript support](/runtime/fundamentals/typescript/) — overview of how
  TypeScript works in Ende
