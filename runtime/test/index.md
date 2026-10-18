---
last_modified: 2026-07-06
title: "Testing"
description: "Write and run tests with Ende's built-in test runner: assertions, test steps, hooks, filtering, and reporters, with dedicated guides for mocking, snapshots, and coverage."
oldUrl:
  - /runtime/fundamentals/testing/
  - /runtime/manual/basics/testing/
  - /runtime/manual/basics/testing/assertions/
  - /runtime/manual/basics/testing/behavior_driven_development
  - /runtime/manual/testing
---

Ende provides a built-in test runner for writing and running tests in both
JavaScript and TypeScript. This makes it easy to ensure your code is reliable
and functions as expected without needing to install any additional dependencies
or tools. The `ende test` runner allows you fine-grained control over
permissions for each test, ensuring that code does not do anything unexpected.

In addition to the built-in test runner, you can also use other test runners
from the JS ecosystem, such as Jest, Mocha, or AVA, with Ende. Moving an
existing Jest suite over? See
[Migrating from Jest](/runtime/test/migrate_from_jest/).

## Writing Tests

To define a test in Ende, you use the [`Ende.test()`](/api/ende/~/Ende.test/)
function. Here are some examples:

```ts title="my_test.ts"
import { assertEquals } from "jsr:@ende/assert";
import { delay } from "jsr:@ende/async";

Ende.test("simple test", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Ende.test("async test", async () => {
  const x = 1 + 2;
  await delay(100);
  assertEquals(x, 3);
});

Ende.test({
  name: "read file test",
  fn: () => {
    const data = Ende.readTextFileSync("./somefile.txt");
    assertEquals(data, "expected content");
  },
});
```

If you prefer a "jest-like" `expect` style of assertions, the Ende standard
library provides an [`expect`](https://jsr.io/@ende/expect) function that can be
used in place of `assertEquals`:

```ts title="my_test.ts"
import { expect } from "jsr:@ende/expect";
import { add } from "./add.js";

Ende.test("add function adds two numbers correctly", () => {
  const result = add(2, 3);
  expect(result).toBe(5);
});
```

## Running Tests

To run your tests, use the [`ende test`](/runtime/reference/cli/test/)
subcommand.

If run without a file name or directory name, this subcommand will automatically
find and execute all tests in the current directory (recursively) that match the
glob `{*_,*.,}test.{ts, tsx, mts, js, mjs, jsx}`. Additionally, any script file
inside a directory named `__tests__` is treated as a test file, regardless of
its file name.

```sh
# Run all tests in the current directory and all sub-directories
ende test

# Run all tests in the util directory
ende test util/

# Run just my_test.ts
ende test my_test.ts

# Run test modules in parallel
ende test --parallel

# Pass additional arguments to the test file that are visible in `Ende.args`
ende test my_test.ts -- -e --foo --bar

# Provide permission for ende to read from the filesystem, which is necessary
# for the final test above to pass
ende test --allow-read=. my_test.ts
```

## Test Steps

Ende also supports test steps, which allow you to break down tests into smaller,
manageable parts. This is useful for setup and teardown operations within a
test:

```ts
Ende.test("database operations", async (t) => {
  using db = await openDatabase();
  await t.step("insert user", async () => {
    // Insert user logic
  });
  await t.step("insert book", async () => {
    // Insert book logic
  });
});
```

## Timeouts

You can set a maximum duration for individual tests using the `timeout` option.
If a test exceeds its deadline it is marked as failed. Both asynchronous hangs
(a promise that never resolves) and synchronous hot loops (`while (true) {}`)
are caught.

```ts
Ende.test({
  name: "completes within deadline",
  timeout: 5000, // 5 seconds
  async fn() {
    const response = await fetch("https://example.com");
    await response.body?.cancel();
  },
});
```

If a test times out the next test in the same file still runs normally.

Setting `timeout` to `0` or omitting it means the test runs without a deadline.

## Retrying and repeating tests

Two per-test options control how many times a test runs. `retry` re-runs a
failing test and passes if any attempt passes, which is useful for tolerating a
known-flaky test. `repeats` runs the test several times and requires every run
to pass, which is useful for catching flakiness:

```ts
Ende.test({
  name: "flaky network call",
  retry: 3, // re-run up to 3 times; pass if any attempt passes
  async fn() {
    const response = await fetch("https://example.com");
    await response.body?.cancel();
  },
});

Ende.test({
  name: "must be deterministic",
  repeats: 5, // run 5 times; fail if any run fails
  fn() {
    // ...
  },
});
```

The two options compose, so each repetition may itself be retried. Every attempt
re-runs the `beforeEach` and `afterEach` hooks and captures a fresh leak-check
baseline, so a resource leak is retried like any other failure.

The `--retry` and `--repeats` flags set a default for the whole run. A test that
sets its own option takes precedence, including an explicit `0` that opts the
test out of a flag-provided default:

```sh
ende test --retry=2
```

## Parameterized tests

[`Ende.test.each`](/api/ende/~/Ende.EndeTest/#each) runs the same test body over
a table of cases. It registers one real test per case, so each case reports
independently and can be filtered or run on its own.

Array cases are spread as positional arguments. The name template interpolates
the case values with `printf`-style tokens (`%s`, `%d`/`%i`, `%f`, `%j`,
`%o`/`%O`) consumed in order, plus `%#` for the zero-based case index:

```ts
import { assertEquals } from "jsr:@ende/assert";

Ende.test.each([
  [1, 1, 2],
  [2, 3, 5],
])("add(%i, %i) = %i", (a, b, expected) => {
  assertEquals(a + b, expected);
});
```

Object or primitive cases are passed as a single argument. For object cases,
`$key` (and `$key.nested`) in the template interpolates the matching property:

```ts
Ende.test.each([
  { a: 1, b: 1, sum: 2 },
  { a: 2, b: 3, sum: 5 },
])("$a + $b = $sum", ({ a, b, sum }) => {
  assertEquals(a + b, sum);
});
```

[`Ende.test.each`](/api/ende/~/Ende.EndeTest/#each) accepts the usual per-test
options object, and the `only` and `ignore` shorthands compose with it as
`.only.each` and `.ignore.each`.

## Test Hooks

Ende provides test hooks that allow you to run setup and teardown code before
and after tests. These hooks are useful for initializing resources, cleaning up
after tests, and ensuring consistent test environments.

### Available Hooks

- `Ende.test.beforeAll(fn)` - Runs once before all tests in the current scope
- `Ende.test.beforeEach(fn)` - Runs before each individual test
- `Ende.test.afterEach(fn)` - Runs after each individual test
- `Ende.test.afterAll(fn)` - Runs once after all tests in the current scope

### Hook Execution Order

- **beforeAll/beforeEach**: Execute in FIFO (first in, first out) order
- **afterEach/afterAll**: Execute in LIFO (last in, first out) order

If an exception is raised in any hook, remaining hooks of the same type will not
run, and the current test will be marked as failed.

### Examples

```ts
import { assertEquals } from "jsr:@ende/assert";

interface User {
  id: number;
  name: string;
}

let users: Map<number, User>;
let nextId: number;

Ende.test.beforeAll(() => {
  console.log("Setting up the test store...");
  users = new Map();
});

Ende.test.beforeEach(() => {
  console.log("Clearing the store for a clean test state...");
  users.clear();
  nextId = 1;
});

Ende.test.afterEach(() => {
  console.log("Test completed, cleaning up resources...");
  // Any additional cleanup after each test
});

Ende.test.afterAll(() => {
  console.log("Tearing down the test store...");
});

Ende.test("user creation", () => {
  const user = { id: nextId++, name: "alice" };
  users.set(user.id, user);
  assertEquals(users.get(1)?.name, "alice");
});

Ende.test("user deletion", () => {
  const user = { id: nextId++, name: "bob" };
  users.set(user.id, user);
  users.delete(user.id);
  assertEquals(users.get(user.id), undefined);
});
```

### Multiple Hooks

You can register multiple hooks of the same type, and they will execute in the
order specified above:

```ts
Ende.test.beforeEach(() => {
  console.log("First beforeEach hook");
});

Ende.test.beforeEach(() => {
  console.log("Second beforeEach hook");
});

// Output:
// First beforeEach hook
// Second beforeEach hook
// (test runs)
```

## Filtering tests

Run a subset of tests with the `--filter` flag. It accepts a string, or a
regular expression wrapped in forward slashes:

```sh
# Run tests whose name contains the word "my"
ende test --filter "my" tests/

# Run tests whose name matches a pattern
ende test --filter "/test-*\d/" tests/
```

To control which test files are collected in the first place, set `test.include`
and `test.exclude` in your
[configuration file](/runtime/reference/ende_json/#include-and-exclude). See the
[`ende test` reference](/runtime/reference/cli/test/#filtering) for the full
filtering semantics.

## Running affected tests

While iterating on a change, running the whole suite on every save is wasteful.
`ende test` can narrow a run to just the tests your change affects, selecting
them by git history or by dependency. Both flags below do a single one-shot run,
not a continuous watch.

### Tests affected by your git changes

`--changed` runs only the test modules affected by files you have changed in
git. With no value it looks at the working tree, including staged, unstaged, and
untracked files:

```sh
ende test --changed
```

Pass a git ref to also include everything committed since you branched off it.
Ende compares against the merge-base (the `<ref>...HEAD` three-dot form that
Vitest and Jest use), so it captures the full set of changes on your branch
rather than just the latest commit:

```sh
# Every test affected since branching off main
ende test --changed=origin/main
```

### Tests that depend on specific files

`--related` runs the test modules that depend on the source files you name,
without consulting git at all. Reach for it when you already know which modules
you touched:

```sh
# Run the tests that import src/util.ts, directly or transitively
ende test --related=src/util.ts
```

### How selection works

For both flags, Ende builds the module graph of the collected test files and
keeps only the tests that reach a changed or named file through their imports. A
test in `cart_test.ts` runs when it imports `cart.ts` and `cart.ts` changed,
even if that import is several modules deep; a test that imports none of the
affected files is skipped. The flags compose with the rest of test selection, so
you can still combine them with a directory argument, `--filter`, or
`test.include`/`test.exclude` to narrow the run further.

This is a good fit for a pre-commit hook or a fast local inner loop. CI that
must verify everything should keep running the full suite, optionally split
across machines with [`--shard`](/runtime/reference/cli/test/#sharding).

## Test definition selection

Ende provides two options for selecting tests within the test definitions
themselves: ignoring tests and focusing on specific tests.

### Ignoring/Skipping Tests

You can ignore certain tests based on specific conditions using the `ignore`
boolean in the test definition. If `ignore` is set to `true`, the test will be
skipped. This is useful, for example, if you only want a test to run on a
specific operating system.

```ts
Ende.test({
  name: "do macOS feature",
  ignore: Ende.build.os !== "darwin", // This test will be ignored if not running on macOS
  fn() {
    // do MacOS feature here
  },
});
```

If you want to ignore a test without passing any conditions, you can use the
`ignore()` function from the [`Ende.test`](/api/ende/~/Ende.test/) object:

```ts
Ende.test.ignore("my test", () => {
  // your test code
});
```

### Only Run Specific Tests

If you want to focus on a particular test and ignore the rest, you can use the
`only` option. This tells the test runner to run only the tests with `only` set
to true. Multiple tests can have this option set. However, if any test is
flagged with only, the overall test run will always fail, as this is intended to
be a temporary measure for debugging.

```ts
Ende.test.only("my test", () => {
  // some test code
});
```

or

```ts
Ende.test({
  name: "Focus on this test only",
  only: true, // Only this test will run
  fn() {
    // test complicated stuff here
  },
});
```

## Failing fast

If you have a long-running test suite and wish for it to stop on the first
failure, you can specify the `--fail-fast` flag when running the suite.

```shell
ende test --fail-fast
```

This will cause the test runner to stop execution after the first test failure.

## Reporters

Test output defaults to the detailed `pretty` reporter. Switch formats with the
`--reporter` flag (`dot`, `junit`, `tap`), or write a JUnit XML report to a file
with `--junit-path` while keeping readable output in the terminal:

```sh
ende test --reporter=dot
ende test --junit-path=./report.xml
```

See the [`ende test` reference](/runtime/reference/cli/test/#reporters) for the
full list of reporters.

## Mocking and test doubles

Isolate the code under test by replacing its collaborators with spies, stubs,
and mocks from `@ende/testing`, and control the clock with `FakeTime`. See
[Mocking and test doubles](/runtime/test/mocking/) for the full guide with
runnable examples.

## Coverage

Collect coverage while testing with `ende test --coverage`, then turn it into
terminal, HTML, or lcov reports with `ende coverage`. The data comes straight
from V8. See [Test coverage](/runtime/test/coverage/) for the workflow,
including CI integration.

## Behavior-Driven Development

With the [`@ende/testing/bdd`](/runtime/reference/std/testing/) module you can
write your tests in a familiar format for grouping tests and adding
setup/teardown hooks used by other JavaScript testing frameworks like Jasmine,
Jest, and Mocha.

The `describe` function creates a block that groups together several related
tests. The `it` function registers an individual test case. For example:

```ts
import { describe, it } from "jsr:@ende/testing/bdd";
import { expect } from "jsr:@ende/expect";
import { add } from "./add.js";

describe("add function", () => {
  it("adds two numbers correctly", () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });

  it("handles negative numbers", () => {
    const result = add(-2, -3);
    expect(result).toBe(-5);
  });
});
```

Check out the [`@ende/testing` documentation](/runtime/reference/std/testing/)
for more information on these functions and hooks.

- [BDD testing tutorial](/examples/bdd_tutorial/)

## Documentation tests

`ende test --doc` runs the code examples inside your JSDoc comments and markdown
files as tests, so documentation can't silently go stale. See
[Documentation tests](/runtime/test/doc_tests/) for how snippets are extracted,
typed, and skipped.

## Sanitizers

The test runner can catch misbehavior that assertions don't see: leaked async
operations, unclosed resources, and unexpected
[`Ende.exit()`](/api/ende/~/Ende.exit/) calls. The exit sanitizer is on by
default; the op and resource sanitizers are opt-in . See
[Test sanitizers](/runtime/test/sanitizers/) for each sanitizer and the global
enablement options.

## Snapshot testing

Compare a value against a serialized reference stored next to your test, and
update the references with a single flag when behavior intentionally changes.
See [Snapshot testing](/runtime/test/snapshots/) for the workflow, including
updating and reviewing snapshots.

## Tests and Permissions

The `permissions` property in the [`Ende.test`](/api/ende/~/Ende.test/)
configuration allows you to specifically deny permissions, but does not grant
them. Permissions must be provided when running the test command. When building
robust applications, you often need to handle cases where permissions are
denied, (for example you may want to write tests to check whether fallbacks have
been set up correctly).

Consider a situation where you are reading from a file, you may want to offer a
fallback value in the case that the function does not have read permission:

```ts
import { assertEquals } from "jsr:@ende/assert";
import getFileText from "./main.ts";

Ende.test({
  name: "File reader gets text with permission",
  // no `permissions` means "inherit"
  fn: async () => {
    const result = await getFileText();
    console.log(result);
    assertEquals(result, "the content of the file");
  },
});

Ende.test({
  name: "File reader falls back to error message without permission",
  permissions: { read: false },
  fn: async () => {
    const result = await getFileText();
    console.log(result);
    assertEquals(result, "oops don't have permission");
  },
});
```

```sh
# Run the tests with read permission
ende test --allow-read
```

The permissions object supports detailed configuration:

```ts
Ende.test({
  name: "permission configuration example",
  // permissions: { read: true } // Grant all read permissions and deny all others
  // OR
  permissions: {
    read: ["./data", "./config"], // Grant read to specific paths only
    write: false, // Explicitly deny write permissions
    net: ["example.com:443"], // Allow specific host:port combinations
    env: ["API_KEY"], // Allow access to specific env variables
    run: false, // Deny subprocess execution
    ffi: false, // Deny loading dynamic libraries
    hrtime: false, // Deny high-resolution time
  },
  fn() {
    // Test code that respects these permission boundaries
  },
});
```

Remember that any permission not explicitly granted at the command line will be
denied, regardless of what's specified in the test configuration.

## Related tutorials

For more hands-on testing guides, check out:

- [Basic testing tutorial](/examples/testing_tutorial/)
- [Mocking and test doubles](/runtime/test/mocking/)
- [Snapshot testing](/runtime/test/snapshots/)
- [Migrating from Jest](/runtime/test/migrate_from_jest/)
- [Testing web applications tutorial](/examples/web_testing_tutorial/)
