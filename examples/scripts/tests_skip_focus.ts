/**
 * @title Skipping and focusing tests
 * @difficulty beginner
 * @tags cli
 * @run ende test <url>
 * @resource {https://docs.ende.sh/runtime/fundamentals/testing/} Doc: Testing
 * @resource {/examples/writing_tests/} Example: Writing tests
 * @group Testing
 *
 * Sometimes a test should not run: it is half-written, broken on one
 * platform, or you want to focus on a single failing case. This example
 * shows how to skip and focus tests.
 */
import { assertEquals } from "jsr:@ende/assert";

// A regular test, for comparison.
Ende.test("addition", () => {
  assertEquals(1 + 1, 2);
});

// To skip a test, set the ignore option. The test is reported as ignored
// rather than silently dropped, so it stays visible as a todo.
Ende.test({
  fn() {
    assertEquals(2 - 1, 1);
  },
  ignore: true,
  name: "subtraction"
});

// The shorthand reads nicely when there is no other option to set.
Ende.test.ignore("multiplication", () => {
  assertEquals(2 * 2, 4);
});

// The ignore option takes any boolean, which makes platform-specific or
// environment-specific skips one-liners.
Ende.test({
  fn() {
    // Only runs on Windows.
  },
  ignore: Ende.build.os !== "windows",
  name: "windows paths"
});

// Running the file reports each skipped test:
//
//   ende test skip.test.ts
//   ok | 1 passed | 0 failed | 3 ignored

// To focus on one test, use only. Every other test in the run is filtered
// out:
//
//   Ende.test.only("focus on this", () => {});
//
// As a guard against forgotten focus markers, the run itself fails after
// the tests pass:
//
//   ok | 1 passed | 0 failed | 1 filtered out
//   error: Test failed because the "only" option was used

// To pick tests at run time instead of in code, use the --filter flag; see
// the test runner documentation for the full options.
