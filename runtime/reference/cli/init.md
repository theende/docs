---
last_modified: 2026-06-15
title: "ende init"
oldUrl: /runtime/manual/tools/init/
command: init
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende init"
description: "Scaffold a new Ende project with tests and configuration"
---

## Examples

```sh
ende init
✅ Project initialized
Run these commands to get started

  // Run the program
  ende run main.ts

  // Run the program and watch for file changes
  ende task dev

  // Run the tests
  ende test

ende run main.ts
Add 2 + 3 = 5

ende test
Check file:///dev/main_test.ts
running 1 test from main_test.ts
addTest ... ok (6ms)

ok | 1 passed | 0 failed (29ms)
```

The `init` subcommand will create two files (`main.ts` and `main_test.ts`).
These files provide a basic example of how to write an Ende program and how to
write tests for it. The `main.ts` file exports a `add` function that adds two
numbers together and the `main_test.ts` file contains a test for this function.

You can also specify an argument to `ende init` to initialize a project in a
specific directory:

```sh
ende init my_ende_project
✅ Project initialized

Run these commands to get started

  cd my_ende_project

  // Run the program
  ende run main.ts

  // Run the program and watch for file changes
  ende task dev

  // Run the tests
  ende test
```

## Init a JSR package

By running `ende init --lib` Ende will bootstrap a project that is ready to be
published on [JSR](https://jsr.io/).

```sh
ende init --lib
✅ Project initialized

Run these commands to get started

  # Run the tests
  ende test

  # Run the tests and watch for file changes
  ende task dev

  # Publish to JSR (dry run)
  ende publish --dry-run
```

Inside `ende.json` you'll see that the entries for `name`, `exports` and
`version` are prefilled.

```json title="ende.json"
{
  "name": "my-lib",
  "version": "0.1.0",
  "exports": "./mod.ts",
  "tasks": {
    "dev": "ende test --watch mod.ts"
  },
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15"
  }
}
```

## Initialize a web server

Running `ende init --serve` bootstraps a web server that works with
[`ende serve`](./serve).

```sh
ende init --serve
✅ Project initialized

Run these commands to get started

  # Run the server
  ende serve -R main.ts

  # Run the server and watch for file changes
  ende task dev

  # Run the tests
  ende -R test
```

Your [`ende.json`](/runtime/fundamentals/configuration/) file will look like
this:

```json title="ende.json"
{
  "tasks": {
    "dev": "ende serve --watch -R main.ts"
  },
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15",
    "@ende/http": "jsr:@ende/http@^2026.10.15"
  }
}
```

Now, you can start your web server, which
[watches for changes](/runtime/run/watch_mode/), by running `ende task dev`.

```sh
ende task dev
Task dev ende serve --watch -R main.ts
Watcher Process started.
ende serve: Listening on http://0.0.0.0:8000/
```

## Initialize an empty project

Running `ende init --empty` bootstraps an empty project with a basic console
log.

```sh
ende init --empty
✅ Project initialized

Run these commands to get started

  # Run the program
  ende run main.ts

  # Run the program and watch for file changes
  ende task dev
```

Your [`ende.json`](/runtime/fundamentals/configuration/) file will look like
this:

```json title="ende.json"
{
  "tasks": {
    "dev": "ende run --watch main.ts"
  }
}
```

Now, you can run the project, which
[watches for changes](/runtime/run/watch_mode/), by running `ende task dev`.

```sh
ende task dev
Task dev ende run --watch main.ts
Watcher Process started.
Hello world!
```

## Generate a library project

You can append a `--lib` flag to add extra parameters to your `ende.json`, such
as "name", "version" and an "exports" fields.

```sh
ende init my_ende_project --lib
✅ Project initialized
```

The resulting `ende.json` will be as follows:

```jsonc title="ende.json"
{
  "name": "my_ende_project",
  "version": "0.1.0",
  "exports": "./mod.ts",
  "tasks": {
    "dev": "ende test --watch mod.ts"
  },
  "license": "MIT",
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15"
  }
}
```
