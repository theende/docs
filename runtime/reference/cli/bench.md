---
last_modified: 2026-10-20
title: "ende bench"
oldUrl:
  - /runtime/manual/tools/benchmarker/
  - /runtime/reference/cli/benchmarker/
command: bench
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende bench"
description: "Run benchmarks using Ende's built-in bench tool."
---

## Quickstart

Firstly, let's create a file `url_bench.ts` and register a bench using the
[`Ende.bench()`](/api/ende/~/Ende.bench/) function.

```ts
// url_bench.ts
Ende.bench("URL parsing", () => {
  new URL("https://ende.sh");
});
```

Secondly, run the benchmark using the `ende bench` subcommand.

```sh
ende bench url_bench.ts
Check file:///path/to/url_bench.ts
    CPU | 12th Gen Intel(R) Core(TM) i3-12100
Runtime | Ende 2026.10.17 (x86_64-unknown-linux-gnu)

file:///path/to/url_bench.ts

| benchmark     | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
| URL parsing   |        345.8 ns |     2,892,000 | (325.4 ns … 497.2 ns) | 346.9 ns | 443.2 ns | 497.2 ns |
```

## Writing benchmarks

To define a benchmark you need to register it with a call to the
[`Ende.bench`](/api/ende/~/Ende.bench/) API. There are multiple overloads of
this API to allow for the greatest flexibility and easy switching between the
forms (eg. when you need to quickly focus a single bench for debugging, using
the `only: true` option):

```ts
// Compact form: name and function
Ende.bench("hello world #1", () => {
  new URL("https://ende.sh");
});

// Compact form: named function.
Ende.bench(function helloWorld3() {
  new URL("https://ende.sh");
});

// Longer form: bench definition.
Ende.bench({
  name: "hello world #2",
  fn: () => {
    new URL("https://ende.sh");
  }
});

// Similar to compact form, with additional configuration as a second argument.
Ende.bench("hello world #4", { permissions: { read: true } }, () => {
  new URL("https://ende.sh");
});

// Similar to longer form, with bench function as a second argument.
Ende.bench(
  { name: "hello world #5", permissions: { read: true } },
  () => {
    new URL("https://ende.sh");
  }
);

// Similar to longer form, with a named bench function as a second argument.
Ende.bench({ permissions: { read: true } }, function helloWorld6() {
  new URL("https://ende.sh");
});
```

### Async functions

You can also bench asynchronous code by passing a bench function that returns a
promise. For this you can use the `async` keyword when defining a function:

```ts
Ende.bench("async hello world", async () => {
  await 1;
});
```

### Critical sections

Sometimes the benchmark case needs to include setup and teardown code that would
taint the benchmark results. For example, if you want to measure how long it
takes to read a small file, you need to open the file, read it, and then close
it. If the file is small enough the time it takes to open and close the file
might outweigh the time it takes to read the file itself.

To help with such situations you can
[`Ende.BenchContext.start`](/api/ende/~/Ende.BenchContext/#start) and
[`Ende.BenchContext.end`](/api/ende/~/Ende.BenchContext/#end) to tell the
benchmarking tool about the critical section you want to measure. Everything
outside of the section between these two calls will be excluded from the
measurement.

```ts
Ende.bench("foo", async (b) => {
  // Open a file that we will act upon.
  using file = await Ende.open("a_big_data_file.txt");

  // Tell the benchmarking tool that this is the only section you want
  // to measure.
  b.start();

  // Now let's measure how long it takes to read all of the data from the file.
  await new Response(file.readable).arrayBuffer();

  // End measurement here.
  b.end();
});
```

The above example requires the `--allow-read` flag to run the benchmark:
`ende bench --allow-read file_reading.ts`.

## Grouping and baselines

When registering a bench case, it can be assigned to a group, using
[`Ende.BenchDefinition.group`](/api/ende/~/Ende.BenchDefinition/#group) option:

```ts
// url_bench.ts
Ende.bench("url parse", { group: "url" }, () => {
  new URL("https://ende.sh");
});
```

It is useful to assign several cases to a single group and compare how they
perform against a "baseline" case.

In this example we'll check how performant is `Date.now()` compared to
`performance.now()`, to do that we'll mark the first case as a "baseline" using
[`Ende.BenchDefinition.baseline`](/api/ende/~/Ende.BenchDefinition/#baseline)
option:

```ts
// time_bench.ts
Ende.bench("Date.now()", { group: "timing", baseline: true }, () => {
  Date.now();
});

Ende.bench("performance.now()", { group: "timing" }, () => {
  performance.now();
});
```

```sh
ende bench time_bench.ts
    CPU | 12th Gen Intel(R) Core(TM) i3-12100
Runtime | Ende 2026.10.17 (x86_64-unknown-linux-gnu)

file:///path/to/time_bench.ts

| benchmark           | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
| ------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |

group timing
| Date.now()          |         44.2 ns |    22,630,000 | ( 42.3 ns …  73.4 ns) |  44.0 ns |  54.1 ns |  55.1 ns |
| performance.now()   |         59.9 ns |    16,700,000 | ( 56.0 ns …  94.8 ns) |  60.7 ns |  76.6 ns |  79.5 ns |

summary
  Date.now()
     1.35x faster than performance.now()
```

You can specify multiple groups in the same file.

## Running benchmarks

To run a benchmark, call `ende bench` with the file that contains your bench
function. You can also omit the file name, in which case all benchmarks in the
current directory (recursively) that match the glob
`{*_,*.,}bench.{ts, tsx, mts, js, mjs, jsx}` will be run. If you pass a
directory, all files in the directory that match this glob will be run.

The glob expands to:

- files named `bench.{ts, tsx, mts, js, mjs, jsx}`,
- or files ending with `.bench.{ts, tsx, mts, js, mjs, jsx}`,
- or files ending with `_bench.{ts, tsx, mts, js, mjs, jsx}`

```sh
# Run all benches in the current directory and all sub-directories
ende bench

# Run all benches in the util directory
ende bench util/

# Run just my_bench.ts
ende bench my_bench.ts
```

> ⚠️ If you want to pass additional CLI arguments to the bench files use `--` to
> inform Ende that remaining arguments are scripts arguments.

```sh
# Pass additional arguments to the bench file
ende bench my_bench.ts -- -e --foo --bar
```

`ende bench` uses the same permission model as `ende run` and therefore will
require, for example, `--allow-write` to write to the file system during
benching.

To see all runtime options with `ende bench`, you can reference the command line
help:

```sh
ende help bench
```

## Filtering

There are a number of options to filter the benches you are running.

### Command line filtering

Benches can be run individually or in groups using the command line `--filter`
option.

The filter flags accept a string or a pattern as value.

Assuming the following benches:

```ts
Ende.bench({
  name: "my-bench",
  fn: () => {/* bench function zero */}
});
Ende.bench({
  name: "bench-1",
  fn: () => {/* bench function one */}
});
Ende.bench({
  name: "bench2",
  fn: () => {/* bench function two */}
});
```

This command will run all of these benches because they all contain the word
"bench".

```sh
ende bench --filter "bench" benchmarks/
```

On the flip side, the following command uses a pattern and will run the second
and third benchmarks.

```sh
ende bench --filter "/bench-*\d/" benchmarks/
```

_To let Ende know that you want to use a pattern, wrap your filter with
forward-slashes like the JavaScript syntactic sugar for a regex._

### Bench definition filtering

Within the benches themselves, you have two options for filtering.

#### Filtering out (ignoring these benches)

Sometimes you want to ignore benches based on some sort of condition (for
example you only want a benchmark to run on Windows). For this you can use the
`ignore` boolean in the bench definition. If it is set to true the bench will be
skipped.

```ts
Ende.bench({
  name: "bench windows feature",
  ignore: Ende.build.os !== "windows",
  fn() {
    // do windows feature
  }
});
```

#### Filtering in (only run these benches)

Sometimes you may be in the middle of a performance problem within a large bench
class and you would like to focus on just that single bench and ignore the rest
for now. For this you can use the `only` option to tell the benchmark harness to
only run benches with this set to true. Multiple benches can set this option.
While the benchmark run will report on the success or failure of each bench, the
overall benchmark run will always fail if any bench is flagged with `only`, as
this is a temporary measure only which disables nearly all of your benchmarks.

```ts
Ende.bench({
  name: "Focus on this bench only",
  only: true,
  fn() {
    // bench complicated stuff
  }
});
```

## JSON output

To retrieve the output as JSON, use the `--json` flag:

```sh
ende bench my_bench.ts --json
{
  "version": 1,
  "runtime": "Ende/2.4.2 x86_64-unknown-linux-gnu",
  "cpu": "12th Gen Intel(R) Core(TM) i3-12100",
  "benches": [
    {
      "origin": "file:///path/to/my_bench.ts",
      "group": null,
      "name": "Test",
      "baseline": false,
      "results": [
        {
          "ok": {
            "n": 51,
            "min": 946.7129,
            "max": 3024.3281,
            "avg": 1241.3926823529412,
            "p75": 1174.9718,
            "p99": 3024.3281,
            "p995": 3024.3281,
            "p999": 3024.3281,
            "highPrecision": false,
            "usedExplicitTimers": false
          }
        }
      ]
    }
  ]
}
```
