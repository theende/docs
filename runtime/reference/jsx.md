---
last_modified: 2026-10-18
title: "JSX"
description: "Configure JSX in Ende: choosing a JSX library from JSR, the automatic runtime, rendering JSX to HTML on the server, the precompile transform, and per-file pragmas."
oldUrl:
  - /deploy/manual/using-jsx/
  - /runtime/manual/advanced/jsx_dom/jsx/
  - /runtime/manual/advanced/jsx/
---

Ende runs JSX in `.jsx` and `.tsx` files with no build step. This page covers
how to configure it: which JSX library to use, how to render JSX to HTML on the
server, and the options that control the transform.

JSX needs a library to turn tags like `<h1>` into values at runtime. You select
it with the `jsxImportSource` setting in `ende.json`. Ende loads packages from
[JSR](https://jsr.io), so the library has to be published there. This page uses
[Hono](https://hono.dev/)'s JSX, from `jsr:@hono/hono`. Static sites can also
use [satz](https://jsr.io/@ende/satz)'s string renderer.

## Set up JSX

Configure JSX once in your `ende.json` with the automatic runtime. You write JSX
and Ende inserts the right imports for you, so you never import the JSX factory
by hand:

```json title="ende.json"
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@hono/hono/jsx"
  },
  "imports": {
    "@hono/hono": "jsr:@hono/hono@^4"
  }
}
```

A component is just a function that returns JSX:

```tsx title="hello.tsx"
export function Hello() {
  return <h1>Hello, world!</h1>;
}
```

> [!NOTE] Legacy classic runtime
>
> Ende's built-in default predates the automatic runtime: it is the classic
> `"react"` transform, which compiles JSX to `React.createElement` calls and
> expects a `React` variable to be in scope. Prefer the automatic runtime above.

## Render JSX to HTML on the server

Hono's JSX elements render to an HTML string with `toString()`. Text and
attribute values are escaped:

```tsx title="main.tsx"
function App({ name }: { name: string }) {
  return <h1>Hello {name}</h1>;
}

Ende.serve(async () => {
  const html = await (<App name="Ende"/>).toString();
  return new Response(`<!DOCTYPE html>${html}`, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
});
```

## Speed up server rendering

Ende ships a precompile transform built for server-side rendering. It analyzes
your JSX at build time and turns static markup into prebuilt HTML strings, so
the server skips most of the work of creating JSX objects on each request. Set
`jsx` to `"precompile"`:

```json title="ende.json"
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "@hono/hono/jsx"
  },
  "imports": {
    "@hono/hono": "jsr:@hono/hono@^4"
  }
}
```

The JSX library has to support it: its `jsx-runtime` must export the
`jsxTemplate`, `jsxAttr` and `jsxEscape` helpers the transform calls. Hono's and
satz's do.

## Configure JSX per file with pragmas

When most of your project uses one setup but a single file needs another, set
the import source for that file with a pragma comment instead of changing
`ende.json`. This is common for standalone scripts that have no project
configuration. The pragma must appear in the file's leading comments:

```tsx title="snippet.tsx"
/** @jsxImportSource jsr:@hono/hono@^4/jsx */

export function App() {
  return <h1>Hello from a one-off script</h1>;
}
```

If the library does not ship its own types, point Ende at a separate types
module with `@jsxImportSourceTypes`. The same `jsxImportSourceTypes` is also
available as a compiler option in `ende.json`.

## Transform options reference

The `jsx` compiler option selects how Ende compiles JSX. Set it in `ende.json`
under `compilerOptions`:

| `jsx` value      | What it does                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `"react-jsx"`    | Automatic runtime. Inserts imports from `<jsxImportSource>/jsx-runtime`. Recommended.        |
| `"react-jsxdev"` | Automatic runtime with debug info (file, line, column) added to each node. Development only. |
| `"precompile"`   | Optimized server-rendering transform. Fastest for SSR.                                       |
| `"react"`        | Legacy classic transform. Compiles to `React.createElement`; needs `React` in scope.         |

Related settings:

- `jsxImportSource`: the module JSX imports come from (`@hono/hono/jsx`,
  `@ende/satz`). Ende appends `/jsx-runtime` automatically.
- `jsxImportSourceTypes`: a types module to use when the JSX library ships none.
- `jsxPrecompileSkipElements`: tag names to leave out of the precompile
  transform.

For the full set of TypeScript compiler options Ende supports, see the
[`ende.json` reference](/runtime/reference/ende_json/) and
[Configuring TypeScript](/runtime/reference/ts_config_migration/).

## Next steps

- [HTTP server](/runtime/fundamentals/http_server/): serve the HTML your
  components render.
- [Configuration file](/runtime/reference/ende_json/): every `ende.json` field,
  including `compilerOptions`.
