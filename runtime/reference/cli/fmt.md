---
last_modified: 2026-10-20
title: "ende fmt"
oldUrl:
  - /runtime/tools/formatter/
  - /runtime/manual/tools/formatter/
  - /runtime/manual/tools/fmt/
  - /runtime/reference/cli/formatter/
command: fmt
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende fmt"
description: "Format your code with Ende's built-in formatter"
---

Ende ships with a built-in code formatter based on [dprint](https://dprint.dev/)
that auto-formats your code to a consistent style. For a broader overview, see
[Linting and Formatting](/runtime/lint_and_format/).

## Basic usage

Format all supported files in the current directory:

```sh
ende fmt
```

Format specific files or directories:

```sh
ende fmt main.ts src/
```

## Watch mode

Automatically re-format files when they change:

```sh
ende fmt --watch
```

## Check formatting in CI

Use `--check` to verify files are formatted without modifying them. The command
exits with a non-zero status code if any files are unformatted:

```sh
ende fmt --check
```

Add `--fail-fast` to stop on the first unformatted file instead of reporting all
of them, which is useful in large codebases:

```sh
ende fmt --check --fail-fast
```

## Formatting stdin

Format code piped through stdin — useful for editor integrations:

```sh
cat main.ts | ende fmt -
```

## Configuring the formatter

Customize formatting options in your `ende.json`:

```json title="ende.json"
{
  "fmt": {
    "useTabs": false,
    "lineWidth": 80,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false,
    "proseWrap": "preserve"
  }
}
```

See the [Configuration](/runtime/reference/ende_json/#formatting) page for all
available options.

## Inheriting settings from .editorconfig

`ende fmt` also reads [`.editorconfig`](https://editorconfig.org/) files and
uses them to fill in any formatting option you have not set elsewhere. The
precedence, from highest to lowest, is:

1. CLI flags (`--indent-width`, `--use-tabs`, and so on)
2. The `fmt` block in `ende.json`
3. `.editorconfig`
4. Built-in defaults

So `.editorconfig` only supplies values you have not already configured through
a flag or `ende.json`. Properties such as `indent_style`, `indent_size`, and
`max_line_length` map onto the corresponding `ende fmt` options.

## Including and excluding files

Specify which files to format in `ende.json`:

```json title="ende.json"
{
  "fmt": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/generated/**/*.ts"]
  }
}
```

You can also exclude files from the command line:

```sh
ende fmt --ignore=dist/,build/
```

## Supported file types

<!-- This list needs to be updated along with https://github.com/theende/ende/blob/primary/cli/tools/fmt.rs -->

| File Type            | Extension                                              | Notes                                                                                  |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| JavaScript           | `.js`, `.cjs`, `.mjs`                                  |                                                                                        |
| TypeScript           | `.ts`, `.mts`, `.cts`                                  |                                                                                        |
| JSX                  | `.jsx`                                                 |                                                                                        |
| TSX                  | `.tsx`                                                 |                                                                                        |
| Markdown             | `.md`, `.mkd`, `.mkdn`, `.mdwn`, `.mdown`, `.markdown` |                                                                                        |
| JSON                 | `.json`                                                |                                                                                        |
| JSONC                | `.jsonc`                                               |                                                                                        |
| CSS                  | `.css`                                                 |                                                                                        |
| HTML                 | `.html`                                                |                                                                                        |
| XML                  | `.xml`                                                 |                                                                                        |
| SVG                  | `.svg`                                                 |                                                                                        |
| [Nunjucks][Nunjucks] | `.njk`                                                 |                                                                                        |
| [Vento][Vento]       | `.vto`                                                 |                                                                                        |
| YAML                 | `.yml`, `.yaml`                                        |                                                                                        |
| SCSS                 | `.scss`                                                |                                                                                        |
| LESS                 | `.less`                                                |                                                                                        |
| Jupyter Notebook     | `.ipynb`                                               |                                                                                        |
| Astro                | `.astro`                                               | Requires `--unstable-component` flag or `"unstable": ["fmt-component"]` config option. |
| Svelte               | `.svelte`                                              | Requires `--unstable-component` flag or `"unstable": ["fmt-component"]` config option. |
| Vue                  | `.vue`                                                 | Requires `--unstable-component` flag or `"unstable": ["fmt-component"]` config option. |
| SQL                  | `.sql`                                                 | Requires `--unstable-sql` flag or `"unstable": ["fmt-sql"]` config option.             |

[Nunjucks]: https://mozilla.github.io/nunjucks/
[Vento]: https://github.com/ventojs/vento

> [!NOTE]
> **`ende fmt` can format code snippets in Markdown files.** Snippets must be
> enclosed in triple backticks and have a language attribute.

The markup formatters (HTML, XML, SVG, and the `--unstable-component` formats)
and the style formatters (CSS, SCSS, and Less) were rebuilt to only adjust
whitespace. They never reorder or rewrite tokens, and they pass unknown syntax
(vendor extensions, future at-rules, template expressions, even broken markup)
through unchanged instead of erroring, so formatting is more robust on
real-world files.

## Ignoring code

### JavaScript / TypeScript / JSONC

Ignore formatting code by preceding it with a `// ende-fmt-ignore` comment:

```ts
// ende-fmt-ignore
export const identity = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
];
```

Or ignore an entire file by adding a `// ende-fmt-ignore-file` comment at the
top of the file.

### Markdown / HTML / CSS

Ignore formatting next item by preceding it with `<!--- ende-fmt-ignore -->`
comment:

```html title="HTML"
<html>
  <body>
    <p>
      Hello there
      <!-- ende-fmt-ignore -->
    </p>
  </body>
</html>
```

To ignore a section of code, surround the code with
`<!-- ende-fmt-ignore-start -->` and `<!-- ende-fmt-ignore-end -->` comments.

Or ignore an entire file by adding a `<!-- ende-fmt-ignore-file -->` comment at
the top of the file.

### YAML

Ignore formatting next item by preceding it with `# ende-fmt-ignore` comment:

```html title="HTML"
# ende-fmt-ignore aaaaaa: bbbbbbb
```
