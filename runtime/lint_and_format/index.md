---
last_modified: 2026-06-25
title: "Linting and formatting"
description: "A guide to Ende's built-in code quality tools. Learn how to use ende lint and ende fmt commands, configure rules, integrate with CI/CD pipelines, and maintain consistent code style across your projects."
oldUrl:
  - /runtime/fundamentals/linting_and_formatting/
---

Ende ships a linter and a formatter in the `ende` binary. No packages to
install, no config files required:

```sh
ende lint    # catch bugs and anti-patterns
ende fmt     # format code, markdown, and JSON
```

Both are fast, run the same way locally and in CI, and are configured (when you
need to configure anything at all) in the same `ende.json` as the rest of your
project.

## Linting

<a href="/lint/" type="docs-cta runtime-cta">Explore all the lint rules</a>

Linting is the process of analyzing your code for potential errors, bugs, and
stylistic issues. Ende's built-in linter,
[`ende lint`](/runtime/reference/cli/lint/), supports recommended set of rules
from [ESLint](https://eslint.org/) to provide comprehensive feedback on your
code. This includes identifying syntax errors, enforcing coding conventions, and
highlighting potential issues that could lead to bugs.

To run the linter, use the following command in your terminal:

```bash
ende lint
```

By default, `ende lint` analyzes all TypeScript and JavaScript files in the
current directory and its subdirectories. If you want to lint specific files or
directories, you can pass them as arguments to the command. For example:

```bash
ende lint src/
```

This command will lint all files in the `src/` directory.

A finding shows the rule name, the offending code, and a hint:

```console
$ ende lint main.ts
error[require-await]: Async function 'fetchData' has no 'await' expression
 --> /project/main.ts:1:1
  |
1 | async function fetchData() {
  | ^^^^^
  = hint: Remove 'async' keyword from the function or use 'await' expression inside.

  docs: https://docs.ende.sh/lint/rules/require-await

Found 1 problem
Checked 1 file
```

Some rules can fix the problem for you: run `ende lint --fix` to apply those
fixes automatically. To silence a rule for one line, add an ignore directive
naming the rule above it:

```ts
// deno-lint-ignore require-await
async function fetchData() {
  return "data";
}
```

See the [`ende lint` reference](/runtime/reference/cli/lint/) for all flags and
directive forms.

The linter can be configured in a
[`ende.json`](/runtime/reference/ende_json/#linting) file. You can specify
custom rules, plugins, and settings to tailor the linting process to your needs.

### Linting rules

You can view and search the list of available rules and their usage on the
[List of rules](/lint/) documentation page.

## Formatting

Formatting is the process of automatically adjusting the layout of your code to
adhere to a consistent style. Ende's built-in formatter, `ende fmt`, uses the
powerful [dprint](https://dprint.dev/) engine to ensure that your code is always
clean, readable, and consistent.

To format your code, simply execute the following command in your terminal:

```bash
ende fmt
```

By default, `ende fmt` formats all TypeScript and JavaScript files in the
current directory and its subdirectories. If you want to format specific files
or directories, you can pass them as arguments to the command. For example:

```bash
ende fmt src/
```

This command will format all files in the `src/` directory.

### Checking your formatting

The `ende fmt --check` command is used to verify if your code is properly
formatted according to Ende's default formatting rules. Instead of modifying the
files, it checks them and reports any formatting issues. This is particularly
useful for integrating into continuous integration (CI) pipelines or pre-commit
hooks to ensure code consistency across your project.

If there are formatting issues, `ende fmt --check` will list the files that need
formatting. If all files are correctly formatted, it will simply exit without
any output.

### Integration in CI

You can add `ende fmt --check` to your CI pipeline to automatically check for
formatting issues. For example, in a GitHub Actions workflow:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Ende
        run: |
          curl -fsSL https://ende.sh/install.sh | sh
          echo "$HOME/.ende/bin" >> "$GITHUB_PATH"
      - run: ende fmt --check
```

This ensures that any code changes adhere to the project's formatting standards
before being merged.

### Configuration

The formatter is configured with the `fmt` field in your
[`ende.json`](/runtime/reference/ende_json/#formatting) file. See
[all formatting options](/runtime/reference/ende_json/#formatting) for the full
list of settings and their defaults.

`ende fmt` also reads [`.editorconfig`](https://editorconfig.org/) files and
uses them to fill in any option you have not set through a CLI flag or the
`ende.json` `fmt` block. The precedence is CLI flags, then `ende.json`, then
`.editorconfig`, then the built-in defaults, so an `.editorconfig` value only
applies when nothing higher up has set it. See
[Inheriting settings from .editorconfig](/runtime/reference/cli/fmt/#inheriting-settings-from-editorconfig)
for the property mappings.
