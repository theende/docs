---
last_modified: 2026-06-18
title: "TypeScript support"
description: "TypeScript is a first-class language in Ende. Run .ts files directly with no build step, type-check with ende check, and reuse your tsconfig.json, with no extra toolchain."
oldUrl:
  - /runtime/manual/advanced/typescript/
  - /runtime/manual/typescript/
  - /runtime/manual/typescript/overview/
  - /runtime/manual/getting_started/typescript/
  - /manual/advanced/typescript
  - /runtime/manual/advanced/typescript/overview/
  - /runtime/fundamentals/
---

TypeScript is a first-class language in Ende. Put TypeScript in a file and run
it. There is no compiler to install and no build step, and configuration is
optional: a `tsconfig.json` works if you already have one, but you don't need to
write one to get started.

```ts title="main.ts"
function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet("world"));
```

```sh
ende run main.ts
```

Ende also ships the type checker: `ende check` plays the role of `tsc --noEmit`,
with strict mode on by default. The same checker runs inside your editor through
the [Ende language server](/runtime/getting_started/setup_your_environment/), so
type errors surface as you type.

## How TypeScript runs in Ende

Ende treats executing TypeScript and type-checking it as two separate concerns:

- **Execution**: when you `ende run` a TypeScript file, Ende strips the types
  and hands the resulting JavaScript to V8. This is fast, happens in-process,
  and is cached, but it does not look at whether the types are correct.
- **Type checking**: `ende check` (or `ende run --check`) runs the real
  TypeScript compiler over your code without executing it.

This means **type errors do not stop your code from running unless you ask**.
Type-checking a whole module graph is expensive, so Ende keeps it out of the hot
edit-run loop and lets you invoke it where it earns its cost: in your editor
(via the Ende language server), in CI, and in `ende test`, which type-checks by
default.

A consequence worth knowing: Ende does not write JavaScript next to your
sources. The stripped output goes into an internal cache instead (you can see
its location listed as "Emitted modules cache" in the output of `ende info`), so
there is no `outDir`, no `dist/` directory, and no source map configuration to
manage. Error stack traces still point at your `.ts` sources directly. If you
genuinely need `.js` files on disk (for example, to ship a library to consumers
that need JavaScript), use
[`ende transpile`](/runtime/reference/cli/transpile/).

## Type checking

Ende type-checks in
[strict mode](https://www.typescriptlang.org/tsconfig/#strict) by default. It
also turns on `noImplicitOverride`, which `tsc` leaves off even under `strict`.
The
[compiler options table](/runtime/reference/ts_config_migration/#ts-compiler-options)
lists every default.

Check your code without running it using
[`ende check`](/runtime/reference/cli/check/):

```sh
# Check the whole project
ende check

# Check a specific file or directory
ende check main.ts
ende check src/

# Also type-check remote modules
ende check --all main.ts

# Type-check JavaScript files too, without adding @ts-check to each one
ende check --check-js main.js
```

`ende check` exits non-zero on errors, so it works as-is in CI. The `--check-js`
flag shown above is covered in
[type checking JavaScript](#type-checking-javascript) below. `ende check` can
also check code blocks in JSDoc comments and markdown files; see
[documentation tests](/runtime/test/doc_tests/).

To type-check before execution, add `--check` to `ende run`:

```sh
ende run --check main.ts

# Include remote modules in the check
ende run --check=all main.ts
```

With this flag, a type error stops the process before any code runs. You can
resolve the error, suppress it with a `// @ts-expect-error` or `// @ts-ignore`
comment, or drop the flag.

`ende test` and `ende bench` type-check by default. Pass `--no-check` to skip
it:

```sh
ende test --no-check
```

### Faster type checking with the native compiler (tsgo)

TypeScript's [native compiler](https://devblogs.microsoft.com/typescript/),
written in Go and often around 10 times faster than the JavaScript `tsc`, is
integrated into Ende behind an unstable flag. Unlike running the standalone
`tsgo` binary, Ende's integration understands Ende's module resolution and
types, so `jsr:` specifiers and the `Ende` global all resolve as usual.

Enable it for a single command with the `ENDE_UNSTABLE_TSGO` environment
variable or the `--unstable-tsgo` flag:

```sh
ENDE_UNSTABLE_TSGO=1 ende check main.ts
ende check --unstable-tsgo main.ts
```

Or turn it on for a whole project in `ende.json`:

```json title="ende.json"
{
  "unstable": ["tsgo"]
}
```

> [!CAUTION]
> This is an unstable, preview feature. The native compiler is not yet
> feature-complete, so some programs that type-check with the default compiler
> may report different results. Don't rely on it for CI or release builds yet,
> and please [report issues](https://github.com/theende/ende/issues).

## Configuring TypeScript compiler options

Ende's defaults are strict and modern, so most projects need no configuration at
all. When you do want to change the checker's behavior, set the options under
`compilerOptions`, either in [`ende.json`](/runtime/fundamentals/configuration/)
or in a `tsconfig.json` (see
[using an existing tsconfig.json](#using-an-existing-tsconfigjson)). For a
Ende-first project, keeping them in `ende.json` means one config file instead of
two:

```json title="ende.json"
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

The
[full list of supported options and their defaults](/runtime/reference/ts_config_migration/#ts-compiler-options)
is in the configuration reference. For JSX settings (React, Preact, and
friends), see the [JSX reference](/runtime/reference/jsx/).

### Using an existing tsconfig.json

You do not have to translate your configuration to try Ende. Each workspace
directory containing an `ende.json` is probed for a `tsconfig.json`; if one
exists, Ende automatically uses it for type checking and the language server, no
flags needed.

For example, an existing project with this `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "lib": ["dom", "esnext"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

will be picked up automatically by `ende check` and the Ende language server. If
a `ende.json` with its own `compilerOptions` is added later, those take
precedence. Emit-related options are ignored (with a warning), since Ende does
not write output files.

For Ende-first projects, prefer `compilerOptions` in `ende.json` over a separate
`tsconfig.json`. See
[Configuring TypeScript](/runtime/reference/ts_config_migration/) for supported
fields, precedence rules, and project-reference behavior.

## Type checking JavaScript

Ende runs JavaScript and TypeScript side by side, but only type-checks
TypeScript files by default. There are three ways to opt a JavaScript file in:
add a `// @ts-check` pragma at the top of the file, enable
`compilerOptions.checkJs` for the whole project, or pass `--check-js` on the
command line (`ende check --check-js main.js`) for a one-off check without
touching any configuration.

With the file in scope, the checker flags the same errors it would in
TypeScript:

```js title="main.js"
// @ts-check

let x = "hello";
x = 42; // Type 'number' is not assignable to type 'string'.
```

The pragma checks a single file; `checkJs` turns it on project-wide:

```json title="ende.json"
{
  "compilerOptions": {
    "checkJs": true
  }
}
```

JavaScript files can't contain TypeScript syntax like type annotations, but you
can provide the same information in
[JSDoc comments](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html),
which the type checker reads:

```js title="main.js"
// @ts-check

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
```

## Providing declaration files

When importing an untyped JavaScript module from TypeScript, the checker assumes
everything it exports is `any`. To fix that, supply a `.d.ts` declaration file
(unless the JavaScript is already annotated with JSDoc).

One important difference from `tsc`: `tsc` automatically picks up a `.d.ts` file
sitting next to a `.js` file with the same basename. **Ende does not.** You must
say where the declaration file is, either in the JavaScript source or at the
import site.

### Providing types in the source

Prefer declaring types in the `.js` file itself with `@ts-self-types`, so every
importer gets them for free:

```js title="add.js"
// @ts-self-types="./add.d.ts"

export function add(a, b) {
  return a + b;
}
```

```ts title="add.d.ts"
export function add(a: number, b: number): number;
```

### Providing types in the importer

If you can't modify the JavaScript source, annotate the import with `@ts-types`:

```ts title="main.ts"
// @ts-types="./add.d.ts"
import { add } from "./add.js";
```

### Typing dynamic imports

The `@ts-types` directive only applies to static `import` statements, not to
dynamic `import()`. To type a dynamic import of a module that ships without
declarations, use a type assertion that points at its declaration file:

```ts title="main.ts"
const { add } = await import("./add.js") as typeof import("./add.d.ts");
```

### Providing types for HTTP modules

Servers hosting JavaScript modules can advertise a declaration file in an
`X-TypeScript-Types` response header, which Ende resolves relative to the module
URL (like a `Location` header) and uses during type checking. CDNs such as
[esm.sh](https://esm.sh) set this header for you.

## Targeting browsers and web workers

By default, Ende type-checks code against the Ende runtime's global scope (the
`ende.window` library): [`Ende.readFile`](/api/ende/~/Ende.readFile/) exists,
`document` does not. Code destined for other environments can swap the type
libraries via `compilerOptions.lib`. The common case is code shared between Ende
and the browser:

```json title="ende.json"
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "dom.asynciterable", "ende.ns"]
  }
}
```

This adds browser globals like `document` while keeping the `Ende` namespace
available through `ende.ns`. Use `lib: ["ende.worker"]` (or a
`/// <reference lib="ende.worker" />` directive) for code that runs in a
`new Worker`. The
[lib property reference](/runtime/reference/ts_config_migration/#using-the-lib-property)
describes the available libraries, conflicts to expect, and worker-specific
setup.

## Augmenting global types

When polyfilling a global API, you can teach the type checker about it with
`declare global`. Note that Ende has no `window` object; globals live on
`globalThis`, so declare them with `var`:

```ts
declare global {
  var polyfilledAPI: () => string;
}
```

With this declaration imported, `globalThis.polyfilledAPI` type-checks.

Alternatively, put the augmentation in a `.d.ts` file and load it via a
triple-slash directive (`/// <reference types="./global.d.ts" />`) or globally
in `ende.json`:

```json title="ende.json"
{
  "compilerOptions": {
    "types": ["./global.d.ts"]
  }
}
```

Avoid global augmentation when an ordinary import will do: globals can cause
naming conflicts, make code harder to reason about, and are not supported when
publishing to [JSR](https://jsr.io).

## Next steps

- Set up your editor with the Ende language server for inline type checking. See
  [Setup your environment](/runtime/getting_started/setup_your_environment/).
- Read the
  [TypeScript configuration reference](/runtime/reference/ts_config_migration/)
  for the full compiler options table and `tsconfig.json` semantics.
- Type-check the examples in your docs with
  [documentation tests](/runtime/test/doc_tests/).
