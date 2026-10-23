/**
 * @title Watching the filesystem
 * @difficulty beginner
 * @tags cli
 * @run -R <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.watchFs} Doc: Ende.watchFs
 * @resource {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} MDN: for await of
 * @resource {https://jsr.io/@ende/async/doc/debounce/~} Doc: @ende/async/debounce
 * @group File System
 *
 * When creating frameworks or CLI tools, it is often necessary to watch the filesystem for changes.
 */
// The easiest way to watch a filesystem is to use the Ende built-in `watchFs`.
// `Ende.watchFs` returns an `FsWatcher` which is an async iterable.
let watcher = Ende.watchFs("./");

// The easiest way to interact with async iterables is the JavaScript `for await of` syntax.
for await (const event of watcher) {
  console.log(">>>> event", event);

  // To stop the watcher we can simply call `watcher.close()`.
  watcher.close();
}

// In real applications, it is quite rare that an application needs to react
// to every change instantly. Events will be duplicated and multiple events will
// be dispatched for the same changes. To get around this, we can "debounce" our
// functions.
import { debounce } from "jsr:@ende/async/debounce";

// In this specific case, we use the Standard Library to do the work for us.
// This function will run at most once every two hundred milliseconds.
const log = debounce((event: Ende.FsEvent) => {
  console.log("[%s] %s", event.kind, event.paths[0]);
}, 200);

watcher = Ende.watchFs("./");

for await (const event of watcher) {
  log(event);
}
