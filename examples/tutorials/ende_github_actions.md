---
last_modified: 2026-10-20
title: "Run Ende in GitHub Actions"
description: "Set up a GitHub Actions workflow for an Ende project: install Ende with its install script, run fmt, lint and test, install with a frozen lockfile, and pin an Ende version."
url: /examples/ende_github_actions_tutorial/
---

Ende ships its formatter, linter, and test runner in the `ende` binary, so a CI
pipeline needs little more than installing Ende and running the corresponding
subcommands.

## A minimal workflow

Ende’s [install script](/runtime/getting_started/installation/) installs it on
the runner. This workflow checks formatting, lints, and runs tests on every push
and pull request:

```yaml title=".github/workflows/ci.yml"
name: CI

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

      - run: ende ci # Install dependencies from the lockfile

      - run: ende fmt --check
      - run: ende lint
      - run: ende test --allow-all
```

The script installs the latest release. To pin one, pass its version:
`curl -fsSL https://ende.sh/install.sh | sh -s v2026.10.17`.

## Installing with a frozen lockfile

`ende ci` installs exactly what `ende.lock` records: it errors out if
`ende.lock` is missing, and fails if `ende.json` changed without the lockfile
being refreshed. That catches "bumped a version but forgot to commit the
lockfile" mistakes before they reach production.

> [!NOTE]
> `ende ci` requires a committed `ende.lock`. If your repository doesn’t have
> one yet, run `ende install` locally and commit the resulting lockfile.

For cross-platform matrices, coverage uploads, and other CI providers, see
[Continuous integration](/runtime/reference/continuous_integration/).
