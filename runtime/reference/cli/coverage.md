---
last_modified: 2026-10-20
title: "ende coverage"
oldUrl: /runtime/manual/tools/coverage/
command: coverage
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende coverage"
description: "Generate a coverage report for your code"
---

`ende coverage` generates coverage reports from data collected by
[`ende test --coverage`](/runtime/reference/cli/test/#code-coverage).

## Inclusions and Exclusions

By default coverage includes any of your code that exists on the local file
system, and its imports.

You can customize the inclusions and exclusions by using the `--include` and
`--exclude` options.

You can expand the coverage to include files that are not on the local file
system by using the `--include` option and customizing the regex pattern.

```sh
ende coverage --include="^file:|https:"
```

The default inclusion pattern should be sufficient for most use cases, but you
can customize it to be more specific about which files are included in your
coverage report.

Files that contain `test.js`, `test.ts`, `test.jsx`, or `test.tsx` in their name
are excluded by default.

This is equivalent to:

```sh
ende coverage --exclude="test\.(js|mjs|ts|jsx|tsx)$"
```

This default setting prevents your test code from contributing to your coverage
report. For a URL to match it must match the include pattern and not match the
exclude pattern.

## Ignoring Code

Code can be ignored in generated coverage reports by adding coverage ignore
comments. Branches and lines in ignored code will be excluded from the report.
Ignored branches and lines do not count as covered lines. Instead, ignored lines
of code are treated as empty lines.

To ignore an entire file, add a `// ende-coverage-ignore-file` comment at the
top of the file.

```ts
// ende-coverage-ignore-file

// all code in this file is ignored
```

Ignored files will not appear in the coverage report.

To ignore a single line, add a `// ende-coverage-ignore` comment on the line
above the code you want to ignore.

```ts
// ende-coverage-ignore
console.log("this line is ignored");
```

To ignore multiple lines, add a `// ende-coverage-ignore-start` comment above
the code you want to ignore and a `// ende-coverage-ignore-stop` comment below.

```ts
// ende-coverage-ignore-start
if (condition) {
  console.log("both the branch and lines are ignored");
}
// ende-coverage-ignore-stop
```

All code after a `// ende-coverage-ignore-start` comment is ignored until a
`// ende-coverage-ignore-stop` is reached.

Each `// ende-coverage-ignore-start` comment must be terminated by a
`// ende-coverage-ignore-stop` comment, and ignored ranges may not be nested.
When these requirements are not met, some lines may be unintentionally included
in the coverage report. The `ende coverage` command will log warnings for any
invalid comments.

```ts
// ende-coverage-ignore-start
if (condition) {
  // ende-coverage-ignore-start - A warning will be logged because the previous
  //                              coverage range is unterminated.
  console.log("this code is ignored");
  // ende-coverage-ignore-stop
}
// ende-coverage-ignore-stop

// ...

// ende-coverage-ignore-start - This comment will be ignored and a warning will
//                              be logged, because this range is unterminated.
console.log("this code is not ignored");
```

Only white space may precede the coverage directive in a coverage comment.
However, any text may trail the directive.

```ts
// ende-coverage-ignore Trailing text is allowed.
console.log("This line is ignored");

// But leading text isn't. ende-coverage-ignore
console.log("This line is not ignored");
```

Coverage comments must start with `//`. Comments starting with `/*` are not
valid coverage comments.

```ts
// ende-coverage-ignore
console.log("This line is ignored");

/* ende-coverage-ignore */
console.log("This line is not ignored");
```

## Function coverage

The summary table and the HTML report include a **function coverage** column
alongside the branch and line columns:

```console
---------------------------------------------
File         | Branch % | Line % | Function %
---------------------------------------------
main.ts      |   85.7   |  92.3  |    100.0
util.ts      |   75.0   |  88.5  |     66.7
---------------------------------------------
all files    |   80.0   |  90.5  |     83.3
---------------------------------------------
```

Function coverage measures the percentage of declared functions that were called
at least once during the test run. The same data is also available in the `lcov`
output.

## Coverage thresholds

By default `ende coverage` and `ende test --coverage` exit with code zero no
matter how low the numbers are. To gate CI on coverage, set a minimum threshold
and the command exits non-zero when coverage falls below it.

Pass `--threshold` to `ende coverage` with a whole-number percentage. The value
applies to all three metrics shown in the summary table: line, branch, and
function coverage.

```sh
ende coverage --threshold=90
```

When you collect and check in a single step, pass `--coverage-threshold` to
`ende test`:

```sh
ende test --coverage --coverage-threshold=90
```

To set a different target per metric, add a `coverage` section to `ende.json`.
Each key under `thresholds` is optional and accepts a fractional percentage:

```json
{
  "coverage": {
    "thresholds": {
      "lines": 90,
      "branches": 80,
      "functions": 90
    }
  }
}
```

A metric with no configured threshold is not checked, so `branches: 80` passes
for a file that has no branches. The check runs against the aggregate across
every reported file, using the same numbers the summary table prints.

When you pass the CLI flag, its single value applies to line, branch, and
function coverage and overrides whatever the config sets for each metric. With
no flag, the per-metric `ende.json` values are used.

## Output Formats

By default we support Ende's own coverage format - but you can also output
coverage reports in the
[lcov format](https://github.com/linux-test-project/lcov?tab=readme-ov-file) (a
standard file format used to describe code coverage data), or in html.

```sh
ende coverage --lcov --output=cov.lcov
```

This lcov file can be used with other tools that support the lcov format.

```sh
ende coverage --html
```

This will output a coverage report as a html file

## Examples

Generate a coverage report from the default coverage profile in your workspace

```sh
ende test --coverage
ende coverage
```

Generate a coverage report from a coverage profile with a custom name

```sh
ende test --coverage=custom_profile_name
ende coverage custom_profile_name
```

> Note: You can alternatively set coverage directory by `ENDE_COVERAGE_DIR` env
> var.
>
> ```
> ENDE_COVERAGE_DIR=custom_profile_name ende test
> ende coverage custom_profile_name
> ```

Only include coverage that matches a specific pattern - in this case, only
include tests from main.ts

```sh
ende coverage --include="main.ts"
```

Export test coverage from the default coverage profile to an lcov file

```sh
ende test --coverage
ende coverage --lcov --output=cov.lcov
```
