/**
 * @title Writing tests
 * @difficulty beginner
 * @tags cli
 * @run ende test -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.test} Doc: Ende.test
 * @resource {https://jsr.io/@ende/assert/doc} Doc: @ende/assert
 * @group CLI
 *
 * One of the most common tasks in developing software is writing tests for
 * existing code. Ende has a built-in test runner which makes this very easy.
 */

// First, we import assert statements from the Standard Library. There are
// quite a few options but we will just import the most common ones here.
import { assert, assertEquals } from "jsr:@ende/assert";

// The most simple way to use the test runner is to just pass it a description
// and a callback function.
Ende.test("assert works correctly", () => {
  assert(true);
  assertEquals(1, 1);
});

// In more complex scenarios, we often need to have some setup and teardown code
// with some steps in between. This is also made simple with the built-in test runner.
Ende.test("testing steps", async (t) => {
  const file = await Ende.open("example.txt", {
    create: true,
    read: true,
    write: true
  });

  const encoder = new TextEncoder();
  const data = encoder.encode("Hello world!");

  await t.step("write some bytes", async () => {
    const bytesWritten = await file.write(data);
    assertEquals(bytesWritten, data.length);
    await file.seek(0, Ende.SeekMode.Start);
  });

  await t.step("read some bytes", async () => {
    const buffer = new Uint8Array(data.length);
    await file.read(buffer);
    assertEquals(buffer, data);
  });

  file.close();
});

// The test runner by default makes it very hard to shoot yourself in the foot. For
// each test, the test runner checks to make sure all resources created during the
// test are freed. There are situations where this is not useful behavior. We can use
// the more complex test definition to disable this behavior.
Ende.test({
  async fn() {
    await Ende.open("example.txt");
  },
  name: "leaky test",
  sanitizeResources: false
});
