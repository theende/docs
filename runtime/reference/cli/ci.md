---
last_modified: 2026-10-18
title: "ende ci"
command: ci
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende ci"
description: "Reproducible install for CI environments"
---

`ende ci` performs a reproducible install for CI environments. Use it in CI
scripts when you want a single, greppable command that's guaranteed to install
exactly what the lockfile records — no drift, no surprises.

```sh
ende ci
```

## What it does

`ende ci` is roughly equivalent to `ende install --frozen-lockfile`, but with
stricter error handling and clearer failure modes:

1. **Requires a lockfile.** If `ende.lock` is missing or unreadable, `ende ci`
   errors out instead of generating one. This guarantees that two runs of the
   same commit install the same versions.
2. **Locks resolution.** If `ende.json` has been edited without re-running
   `ende install` to refresh the lockfile, the command fails. This catches "I
   bumped a version but forgot to commit the lockfile" mistakes before they
   reach production.

If either check fails, the install does not proceed.

## When to use it

| Scenario                               | Use                        |
| -------------------------------------- | -------------------------- |
| CI build / test / lint pipeline        | `ende ci`                  |
| Local development (frequent edits)     | `ende install`             |
| Adding or removing a package           | `ende add` / `ende remove` |
| First-time bootstrap (no lockfile yet) | `ende install`             |

The rule of thumb: pick `ende ci` whenever the install must be reproducible and
there is no expectation that the lockfile should change. Pick `ende install`
whenever you're iterating on dependencies.

## Example: GitHub Actions

```yaml title=".github/workflows/test.yml"
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Ende
        run: |
          curl -fsSL https://ende.sh/install.sh | sh
          echo "$HOME/.ende/bin" >> "$GITHUB_PATH"
      - run: ende ci
      - run: ende test
      - run: ende lint
      - run: ende fmt --check
```

## Common failure modes

When `ende.lock` is missing, or doesn't match `ende.json`, `ende ci` fails with
`The lockfile is out of date` and prints the changes a fresh install would make.
Run `ende install` locally and commit the resulting `ende.lock`.

## See also

- [`ende install`](/runtime/reference/cli/install/) — everyday install, with
  full flag reference
- [Continuous integration](/runtime/reference/continuous_integration/) — guide
  to running Ende in GitHub Actions and other CI providers
