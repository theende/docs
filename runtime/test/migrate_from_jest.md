---
last_modified: 2026-10-20
title: "Migrating from Jest"
description: "Move a Jest test suite to ende test: describe/it via @ende/testing/bdd, expect mappings, mock function equivalents, snapshot testing, fake timers, and translating Jest configuration."
---

Most Jest suites translate to `ende test` without rewriting test logic: the
Standard Library's `@ende/testing/bdd` module provides the same `describe`/`it`
structure, and `@ende/expect` ships the matchers you already use. What changes
is a handful of imports and how the runner is configured.

## The same test, in Ende

A typical Jest test needs only new imports:

```ts title="cart.test.ts"
import { beforeEach, describe, it } from "jsr:@ende/testing/bdd";
import { expect, fn } from "jsr:@ende/expect";

describe("shopping cart", () => {
  let cart: string[];

  beforeEach(() => {
    cart = [];
  });

  it("starts empty", () => {
    expect(cart).toHaveLength(0);
  });

  it("notifies a listener", () => {
    const onAdd = fn();
    cart.push("apple");
    onAdd(cart.length);
    expect(onAdd).toHaveBeenCalledWith(1);
  });
});
```

```sh
$ ende test cart.test.ts
ok | 1 passed (2 steps) | 0 failed (13ms)
```

Unlike Jest, nothing is injected as a global: `describe`, `it`, `expect`, and
the hooks are explicit imports, so each file states what it uses.

## What maps to what

| Jest                              | Ende                                                             |
| --------------------------------- | ---------------------------------------------------------------- |
| `describe`, `it`, `beforeEach`, … | [`@ende/testing/bdd`](/examples/bdd_tutorial/)                   |
| `expect(...)` matchers            | `jsr:@ende/expect`                                               |
| `jest.fn()`                       | `fn()` from `jsr:@ende/expect`                                   |
| `jest.spyOn(obj, "m")`            | [`spy`/`stub` from `@ende/testing/mock`](/runtime/test/mocking/) |
| `toMatchSnapshot()`               | [`assertSnapshot`](/examples/snapshot_test_tutorial/)            |
| `jest.useFakeTimers()`            | [`FakeTime`](/runtime/test/mocking/#faking-time)                 |
| `npx jest`                        | `ende test`                                                      |
| `npx jest --watch`                | `ende test --watch`                                              |
| `npx jest -t "name"`              | `ende test --filter "name"`                                      |

## Translate the configuration

Jest configuration mostly disappears: TypeScript, JSX, and ES modules work
without transforms, so `ts-jest`, `babel-jest`, and `transform` entries have no
equivalent to migrate. File selection moves into `ende.json`:

```json title="ende.json"
{
  "test": {
    "include": ["src/**/*.test.ts"],
    "exclude": ["src/fixtures/"]
  }
}
```

## Module mocks

There is no equivalent of `jest.mock("./module")`, because module records are
immutable in Ende. Tests that rely on it migrate to one of:

- dependency injection: pass the collaborator in, and hand the test a
  [spy or stub](/runtime/test/mocking/),
- stubbing the object the module exposes, with `stub` from `@ende/testing/mock`.

This is usually the only part of a migration that requires touching the code
under test.
