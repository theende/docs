/**
 * @title Write benchmarks with Ende.bench
 * @difficulty beginner
 * @tags cli
 * @run ende bench <url>
 * @resource {https://docs.ende.sh/runtime/reference/cli/bench/} Doc: Benchmarking
 * @resource {https://docs.ende.sh/api/ende/~/Ende.bench} Doc: Ende.bench
 * @group CLI
 *
 * Ende has a built-in benchmark runner. Register benchmarks with Ende.bench
 * and run them with the ende bench subcommand, which reports timings and
 * compares grouped benchmarks against a baseline.
 */

// A classic question: for membership checks, how much faster is a Set than
// an Array? Prepare both with the same ten thousand items, then look for an
// element near the end, the worst case for the array.
const items = Array.from({ length: 10_000 }, (_, i) => `item-${i}`);
const itemsArray = [...items];
const itemsSet = new Set(items);
const needle = "item-9999";

// Benchmarks that belong to the same group are compared with each other in
// the summary. Exactly one of them can be marked as the baseline.
Ende.bench({
  name: "Array.prototype.includes",
  group: "lookup",
  baseline: true,
  fn: () => {
    itemsArray.includes(needle);
  },
});

Ende.bench({
  name: "Set.prototype.has",
  group: "lookup",
  fn: () => {
    itemsSet.has(needle);
  },
});

// Sometimes a benchmark needs setup that should not be measured. The bench
// context passed to the function exposes start and end methods that limit
// the measured section. Here only the join call is timed, not building the
// input array.
Ende.bench("join parts", (b) => {
  const parts = Array.from({ length: 1_000 }, (_, i) => `part-${i}`);
  b.start();
  parts.join(", ");
  b.end();
});

// Run the file with ende bench. The trailing columns with min, max and
// percentiles are trimmed here to keep the table narrow:
//
//   ende bench ende_bench.ts
//       CPU | Apple M1 Max
//   Runtime | Ende 2026.10.17 (aarch64-apple-darwin)
//
//   | benchmark                  | time/iter (avg) |        iter/s |
//   | -------------------------- | --------------- | ------------- |
//   | join parts                 |         15.8 µs |        63,360 |
//
//   group lookup
//   | Array.prototype.includes   |          9.9 µs |       101,400 |
//   | Set.prototype.has          |          4.3 ns |   233,500,000 |
//
//   summary
//     Array.prototype.includes
//        2303x slower than Set.prototype.has
//
// The linear scan takes microseconds while the hash lookup takes
// nanoseconds, so the Set wins by more than three orders of magnitude.

// Useful flags: ende bench --filter lookup runs only matching benchmarks,
// and ende bench --json emits machine-readable results.
