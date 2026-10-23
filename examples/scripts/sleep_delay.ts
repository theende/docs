/**
 * @title Sleep and delay execution
 * @difficulty beginner
 * @tags cli, web
 * @run <url>
 * @resource {https://jsr.io/@ende/async/doc/~/delay} Doc: @ende/async delay
 * @resource {https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal} MDN: AbortSignal
 * @group Basics
 *
 * Scripts often need to wait: between retries, while polling, or to pace
 * requests. This example shows how to sleep without blocking, and how to
 * make a sleep cancelable.
 */

// The simplest sleep is a promise around `setTimeout`.
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("waiting...");
await sleep(100);
console.log("done"); // prints 100ms later

// The Standard Library provides a `delay` helper, with extras.
import { delay } from "jsr:@ende/async/delay";
await delay(100);

// A `delay` accepts an `AbortSignal`, which makes it cancelable. Aborting
// rejects the promise.
const controller = new AbortController();
setTimeout(() => controller.abort(), 50);

try {
  await delay(10_000, { signal: controller.signal });
} catch {
  console.log("sleep canceled after 50ms"); // sleep canceled after 50ms
}

// A pending timer keeps the process alive. The persistent option releases
// it, so a long delay will not stop a finished program from exiting.
await delay(0, { persistent: false });
