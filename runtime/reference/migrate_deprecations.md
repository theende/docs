---
last_modified: 2026-10-18
title: "Removed and deprecated APIs"
description: "Replacements for the CLI commands and Ende namespace APIs that were removed or deprecated, such as ende vendor, Ende.Buffer and Ende.run."
oldUrl:
  - /runtime/manual/advanced/migrate_deprecations/
  - /runtime/reference/migration_guide/
---

Ende warns when code uses an API that is deprecated, and some older commands and
APIs are gone. This page lists each with its replacement. The
[`no-deprecated-deno-api`](/lint/rules/no-deprecated-deno-api/) lint rule flags
the deprecated APIs in your code.

## `ende vendor`

The `ende vendor` command has been replaced by a `"vendor": true` configuration
option in `ende.json`:

```json title="ende.json"
{
  "vendor": true
}
```

Remote dependencies are then downloaded into a local `vendor/` directory the
next time they're used.

## API changes

- `Ende.Buffer`

Use [`Buffer`](https://jsr.io/@ende/io/doc/buffer/~/Buffer) from the Standard
Library instead.

```diff
+ import { Buffer } from "jsr:@ende/io/buffer";

- const buffer = new Ende.Buffer();
+ const buffer = new Buffer();

  // ...
```

See [deno#9795][deno#9795] for details.

- `Ende.Closer`

Use [`Closer`](https://jsr.io/@ende/io/doc/types/~/Closer) from the Standard
Library instead.

```diff
+ import type { Closer } from "jsr:@ende/io/types";

- function foo(closer: Ende.Closer) {
+ function foo(closer: Closer) {
  // ...  
}
```

See [deno#9795][deno#9795] for details.

- `Ende.close()`

Use the `.close()` method on the resource instead.

```diff
  const conn = await Ende.connect({ port: 80 });

  // ...


- Ende.close(conn.rid);
+ conn.close();
```

```diff
  const file = await Ende.open("/foo/bar.txt");

  // ...

- Ende.close(file.rid);
+ file.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.Conn.prototype.rid`

Use [`Ende.Conn`](https://docs.ende.sh/api/ende/~/Ende.Conn) instance methods
instead.

```diff
  const conn = await Ende.connect({ port: 80 });

  const buffer = new Uint8Array(1_024);
- await Ende.read(conn.rid, buffer);
+ await conn.read(buffer);

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(conn.rid, data);
+ await conn.write(data);

- await Ende.shutdown(conn.rid);
+ await conn.closeWrite();

- Ende.close(conn.rid);
+ conn.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.ConnectTlsOptions.certChain`

Use the
[`cert`](https://docs.ende.sh/api/ende/~/Ende.TlsCertifiedKeyPem#property_cert)
option instead.

```diff
const caCert = await Ende.readTextFile("./certs/my_custom_root_CA.pem");
using conn = await Ende.connectTls({
  hostname: "192.0.2.1",
  port: 80,
  caCerts: [caCert],
- certChain: Ende.readTextFileSync("./server.crt"),
+ cert: Ende.readTextFileSync("./server.crt"),
  key: Ende.readTextFileSync("./server.key"),
});
```

See [deno#22274](https://github.com/denoland/deno/pull/22274) for details.

- `Ende.ConnectTlsOptions.certFile`

Use the
[`cert`](https://docs.ende.sh/api/ende/~/Ende.TlsCertifiedKeyPem#property_cert)
option instead.

```diff
const caCert = await Ende.readTextFile("./certs/my_custom_root_CA.pem");
using conn = await Ende.connectTls({
  hostname: "192.0.2.1",
  port: 80,
  caCerts: [caCert],
- certFile: "./server.crt",
+ cert: Ende.readTextFileSync("./server.crt"),
  key: Ende.readTextFileSync("./server.key"),
});
```

See [deno#22274](https://github.com/denoland/deno/pull/22274) for details.

- `Ende.ConnectTlsOptions.privateKey`

Use the
[`key`](https://docs.ende.sh/api/ende/~/Ende.TlsCertifiedKeyPem#property_key)
option instead.

```diff
const caCert = await Ende.readTextFile("./certs/my_custom_root_CA.pem");
using conn = await Ende.connectTls({
  hostname: "192.0.2.1",
  port: 80,
  caCerts: [caCert],
  cert: Ende.readTextFileSync("./server.crt"),
- keyFile: "./server.key",
+ key: Ende.readTextFileSync("./server.key"),
});
```

See [deno#22274](https://github.com/denoland/deno/pull/22274) for details.

- `Ende.copy()`

Use [`copy()`](https://jsr.io/@ende/io/doc/copy/~/copy) from the Standard
Library instead.

```diff
+ import { copy } from "jsr:@ende/io/copy";

  using file = await Ende.open("/foo/bar.txt");

- await Ende.copy(file, Ende.stdout);
+ await copy(file, Ende.stdout);
```

See [deno#9795][deno#9795] for details.

- `Ende.customInspect`

Use `Symbol.for("Ende.customInspect")` instead.

```diff
class Foo {
- [Ende.customInspect]() {
+ [Symbol.for("Ende.customInspect")] {
  }
}
```

See [deno#9294](https://github.com/denoland/deno/issues/9294) for details.

- `Ende.fdatasync()`

Use
[`Ende.FsFile.prototype.syncData()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.syncData)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt", { read: true, write: true });

  await file.write(new TextEncoder().encode("Hello, world!"));
- await Ende.fdatasync(file.rid);
+ await file.syncData();
```

- `Ende.fdatasyncSync()`

Use
[`Ende.FsFile.prototype.syncDataSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.syncDataSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt", { read: true, write: true });

  file.writeSync(new TextEncoder().encode("Hello, world!"));
- Ende.fdatasyncSync(file.rid);
+ file.syncDataSync();
```

- `Ende.File`

Use [`Ende.FsFile`](https://docs.ende.sh/api/ende/~/Ende.FsFile) instead.

```diff
- function foo(file: Ende.File) {
+ function foo(file: Ende.FsFile) {
  // ...
}
```

See [deno#13661](https://github.com/denoland/deno/issues/13661) for details.

- `Ende.flock()`

Use
[`Ende.FsFile.prototype.lock()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.lock)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- await Ende.flock(file.rid);
+ await file.lock();
```

See [deno#22178](https://github.com/denoland/deno/issues/22178) for details.

- `Ende.flockSync()`

Use
[`Ende.FsFile.prototype.lockSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.lockSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt");

- Ende.flockSync(file.rid);
+ file.lockSync();
```

See [deno#22178](https://github.com/denoland/deno/issues/22178) for details.

- `Ende.FsFile.prototype.rid`

Use [`Ende.FsFile`](https://docs.ende.sh/api/ende/~/Ende.FsFile) instance
methods instead.

```diff
  const file = await Ende.open("/foo/bar.txt");

  const buffer = new Uint8Array(1_024);
- await Ende.read(file.rid, buffer);
+ await file.read(buffer);

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(file.rid, data);
+ await file.write(data);

- Ende.close(file.rid);
+ file.close();
```

- `Ende.fstatSync()`

Use
[`Ende.FsFile.prototype.statSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.statSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt");

- const fileInfo = Ende.fstatSync(file.rid);
+ const fileInfo = file.statSync();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.fstat()`

Use
[`Ende.FsFile.prototype.stat()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.stat)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- const fileInfo = await Ende.fstat(file.rid);
+ const fileInfo = await file.stat();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.FsWatcher.prototype.rid`

Use [`Ende.FsWatcher`](https://docs.ende.sh/api/ende/~/Ende.FsWatcher) instance
methods instead.

```diff
  using watcher = Ende.watchFs("/dir");

  // ...

- Ende.close(watcher.rid);
+ watcher.close();
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.fsync()`

Use
[`Ende.FsFile.prototype.sync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.sync)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt", { read: true, write: true });

  await file.write(new TextEncoder().encode("Hello, world!"));
  await file.truncate(1);
- await Ende.fsync(file.rid);
+ await file.sync();
```

- `Ende.fsyncSync()`

Use
[`Ende.FsFile.prototype.syncSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.syncSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt", { read: true, write: true });

  file.writeSync(new TextEncoder().encode("Hello, world!"));
  file.truncateSync(1);
- Ende.fsyncSync(file.rid);
+ file.syncSync();
```

- `Ende.ftruncateSync()`

Use
[`Ende.FsFile.prototype.truncateSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.truncateSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt");

- Ende.ftruncateSync(file.rid, 7);
+ file.truncateSync(7);
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.ftruncate()`

Use
[`Ende.FsFile.prototype.truncate()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.truncate)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- await Ende.ftruncate(file.rid, 7);
+ await file.truncate(7);
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.funlock()`

Use
[`Ende.FsFile.prototype.unlock()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.unlock)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- await Ende.funlock(file.rid);
+ await file.unlock();
```

See [deno#22178](https://github.com/denoland/deno/issues/22178) for details.

- `Ende.funlockSync()`

Use
[`Ende.FsFile.prototype.unlockSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.unlockSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt");

- Ende.funlockSync(file.rid);
+ file.unlockSync();
```

See [deno#22178](https://github.com/denoland/deno/issues/22178) for details.

- `Ende.futimeSync()`

Use
[`Ende.FsFile.prototype.utimeSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.utimeSync)
instead.

```diff
  using file = Ende.openSync("/foo/bar.txt");

- Ende.futimeSync(file.rid, 1556495550, new Date());
+ file.utimeSync(1556495550, new Date());
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.futime()`

Use
[`Ende.FsFile.prototype.utime()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.utime)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- await Ende.futime(file.rid, 1556495550, new Date());
+ await file.utime(1556495550, new Date());
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.isatty()`

Use `Ende.FsFile.prototype.isTerminal()`, `Ende.stdin.prototype.isTerminal()`,
`Ende.stdout.prototype.isTerminal()` or `Ende.stderr.prototype.isTerminal()`
instead.

```diff
  using file = await Ende.open("/dev/tty6");

- Ende.isatty(file.rid);
+ file.isTerminal();
```

```diff
- Ende.isatty(Ende.stdin.rid);
+ Ende.stdin.isTerminal();
```

```diff
- Ende.isatty(Ende.stdout.rid);
+ Ende.stdout.isTerminal();
```

```diff
- Ende.isatty(Ende.stderr.rid);
+ Ende.stderr.isTerminal();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.iter()`

Use
[`iterateReader()`](https://jsr.io/@ende/io/doc/iterate-reader/~/iterateReader)
from the Standard Library instead.

```diff
+ import { iterateReader } from "jsr:@ende/io/iterate-reader";

- for await (const chunk of Ende.iter(Ende.stdout)) {
+ for await (const chunk of iterateReader(Ende.stdout)) {
  // ...
}
```

```diff
+ import { iterateReaderSync } from "jsr:@ende/io/iterate-reader";

  using file = await Ende.open("/foo/bar.txt");

- for await (const chunk of Ende.iter(file)) {
+ for await (const chunk of iterateReader(file)) {
  // ...
}
```

See [deno#9795][deno#9795] for details.

- `Ende.iterSync()`

Use
[`iterateReaderSync()`](https://jsr.io/@ende/io/doc/iterate-reader/~/iterateReaderSync)
from the Standard Library instead.

```diff
+ import { iterateReaderSync } from "jsr:@ende/io/iterate-reader";

- for (const chunk of Ende.iterSync(Ende.stdout)) {
+ for (const chunk of iterateReaderSync(Ende.stdout)) {
  // ...
}
```

```diff
+ import { iterateReaderSync } from "jsr:@ende/io/iterate-reader";

  using file = await Ende.open("/foo/bar.txt");

- for (const chunk of Ende.iterSync(file)) {
+ for (const chunk of iterateReaderSync(file)) {
  // ...
}
```

See [deno#9795][deno#9795] for details.

- `Ende.Listener.prototype.rid`

Use [`Ende.Listener`](https://docs.ende.sh/api/ende/~/Ende.Listener) instance
methods instead.

```diff
  const listener = Ende.listen({ port: 80 })

- Ende.close(listener.rid);
+ listener.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.ListenTlsOptions.certChain`

Use the
[`cert`](https://docs.ende.sh/api/ende/~/Ende.ListenTlsOptions#property_cert)
option instead.

```diff
using listener = Ende.listenTls({
  port: 443,
- certChain: Ende.readTextFile("./server.crt"),
+ cert: Ende.readTextFile("./server.crt"),
  key: Ende.readTextFileSync("./server.key"),
});
```

- `Ende.ListenTlsOptions.certFile`

Pass the certificate file contents to the
[`cert`](https://docs.ende.sh/api/ende/~/Ende.ListenTlsOptions#property_cert)
option instead.

```diff
using listener = Ende.listenTls({
  port: 443,
- certFile: "./server.crt",
+ cert: Ende.readTextFile("./server.crt"),
  key: Ende.readTextFileSync("./server.key"),
});
```

See [deno#12639](https://github.com/denoland/deno/issues/12639) for details.

- `Ende.ListenTlsOptions.keyFile`

Pass the key file contents to the
[`key`](https://docs.ende.sh/api/ende/~/Ende.ListenTlsOptions#property_key)
option instead.

```diff
using listener = Ende.listenTls({
  port: 443,
  cert: Ende.readTextFile("./server.crt"),
- keyFile: "./server.key",
+ key: Ende.readTextFileSync("./server.key"),
});
```

See [deno#12639](https://github.com/denoland/deno/issues/12639) for details.

- `Ende.metrics()`

There is no replacement API for this symbol.

- `Ende.readAllSync()`

Use [`readAllSync()`](https://jsr.io/@ende/io/doc/read-all/~/readAllSync) from
the Standard Library instead.

```diff
+ import { readAllSync } from "jsr:@ende/io/read-all";

- const data = Ende.readAllSync(Ende.stdin);
+ const data = readAllSync(Ende.stdin);
```

```diff
+ import { readAllSync } from "jsr:@ende/io/read-all";

  using file = Ende.openSync("/foo/bar.txt", { read: true });

- const data = Ende.readAllSync(file);
+ const data = readAllSync(file);
```

See [deno#9795][deno#9795] for details.

- `Ende.readAll()`

Use [`readAll()`](https://jsr.io/@ende/io/doc/read-all/~/readAll) from the
Standard Library instead.

```diff
+ import { readAll } from "jsr:@ende/io/read-all";

- const data = await Ende.readAll(Ende.stdin);
+ const data = await readAll(Ende.stdin);
```

```diff
+ import { readAll } from "jsr:@ende/io/read-all";

  using file = await Ende.open("/foo/bar.txt", { read: true });

- const data = await Ende.readAll(file);
+ const data = await readAll(file);
```

See [deno#9795][deno#9795] for details.

- `Ende.Reader`

Use [`Reader`](https://jsr.io/@ende/io/doc/~/Reader) from the Standard Library
instead.

```diff
+ import type { Reader } from "jsr:@ende/io/types";

- function foo(closer: Ende.Reader) {
+ function foo(closer: Reader) {
  // ...  
}
```

See [deno#9795][deno#9795] for details.

- `Ende.ReaderSync`

Use [`ReaderSync`](https://jsr.io/@ende/io/doc/~/ReaderSync) from the Standard
Library instead.

```diff
+ import type { ReaderSync } from "jsr:@ende/io/types";

- function foo(reader: Ende.ReaderSync) {
+ function foo(reader: ReaderSync) {
  // ...  
}
```

See [deno#9795][deno#9795] for details.

- `Ende.readSync()`

Use the `.readSync()` method on the resource itself.

```diff
  using conn = await Ende.connect({ port: 80 });
  const buffer = new Uint8Array(1_024);

- Ende.readSync(conn.rid, buffer);
+ conn.readSync(buffer);
```

```diff
  using file = Ende.openSync("/foo/bar.txt");
  const buffer = new Uint8Array(1_024);

- Ende.readSync(file.rid, buffer);
+ file.readSync(buffer);
```

See [deno#9795][deno#9795] for details.

- `Ende.read()`

Use the `.read()` method on the resource itself.

```diff
  using conn = await Ende.connect({ port: 80 });
  const buffer = new Uint8Array(1_024);

- await Ende.read(conn.rid, buffer);
+ await conn.read(buffer);
```

```diff
  using file = await Ende.open("/foo/bar.txt");
  const buffer = new Uint8Array(1_024);

- await Ende.read(file.rid, buffer);
+ await file.read(buffer);
```

See [deno#9795][deno#9795] for details.

- `Ende.resources()`

There is no replacement API for this symbol, as resource IDs (RIDs) are being
phased-out.

- `Ende.run()`

Use [`new Ende.Command()`](https://docs.ende.sh/api/ende/~/Ende.Command)
instead.

```diff
- const process = Ende.run({ cmd: [ "echo", "hello world" ], stdout: "piped" });
- const [{ success }, stdout] = await Promise.all([
-   process.status(),
-   process.output(),
- ]);
- process.close();
+ const command = new Ende.Command("echo", {
+   args: ["hello world"]
+ });
+ const { success, stdout } = await command.output();
  console.log(success);
  console.log(new TextDecoder().decode(stdout));
```

Note: This symbol is soft-removed . Its types have been removed, but its
implementation remains to reduce breaking changes. You can ignore "property does
not exist" TypeScript errors by using the
[`@ts-ignore`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#suppress-errors-in-ts-files-using--ts-ignore-comments)
directive.

```diff
+ // @ts-ignore `Ende.run()` is soft-removed .
  const process = Ende.run({ cmd: [ "echo", "hello world" ], stdout: "piped" });
  const [{ success }, stdout] = await Promise.all([
    process.status(),
    process.output(),
  ]);
  process.close();
  console.log(success);
  console.log(new TextDecoder().decode(stdout));
```

See [deno#16516](https://github.com/denoland/deno/pull/16516) for details.

- `Ende.Seeker`

Use [`Seeker`](https://jsr.io/@ende/io/doc/types/~/Seeker) from the Standard
Library instead.

```diff
+ import type { Seeker } from "jsr:@ende/io/types";

- function foo(seeker: Ende.Seeker) {
+ function foo(seeker: Seeker) {
  // ...  
}
```

- `Ende.SeekerSync`

Use [`SeekerSync`](https://jsr.io/@ende/io/doc/types/~/SeekerSync) from the
Standard Library instead.

```diff
+ import type { SeekerSync } from "jsr:@ende/io/types";

- function foo(seeker: Ende.SeekerSync) {
+ function foo(seeker: SeekerSync) {
  // ...  
}
```

- `Ende.seekSync()`

Use
[`Ende.FsFile.prototype.seekSync()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.seekSync)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- Ende.seekSync(file.rid, 6, Ende.SeekMode.Start);
+ file.seekSync(6, Ende.SeekMode.Start);
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.seek()`

Use
[`Ende.FsFile.prototype.seek()`](https://docs.ende.sh/api/ende/~/Ende.FsFile.prototype.seek)
instead.

```diff
  using file = await Ende.open("/foo/bar.txt");

- await Ende.seek(file.rid, 6, Ende.SeekMode.Start);
+ await file.seek(6, Ende.SeekMode.Start);
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.serveHttp()`

Use [`Ende.serve()`](https://docs.ende.sh/api/ende/~/Ende.serve) instead.

```diff
- const conn = Ende.listen({ port: 80 });
- const httpConn = Ende.serveHttp(await conn.accept());
- const e = await httpConn.nextRequest();
- if (e) {
-  e.respondWith(new Response("Hello World"));
- }
+ Ende.serve({ port: 80 }, () => new Response("Hello World"));
```

Note: This symbol is soft-removed . Its types have been removed, but its
implementation remains to reduce breaking changes. You can ignore "property does
not exist" TypeScript errors by using the
[`@ts-ignore`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#suppress-errors-in-ts-files-using--ts-ignore-comments)
directive.

```diff
  const conn = Ende.listen({ port: 80 });
+ // @ts-ignore `Ende.serveHttp()` is soft-removed .
  const httpConn = Ende.serveHttp(await conn.accept());
  const e = await httpConn.nextRequest();
  if (e) {
   e.respondWith(new Response("Hello World"));
  }
```

See the
[Deno 1.35 blog post](https://deno.com/blog/v1.35#denoserve-is-now-stable) for
details.

- `Ende.Server`

Use [`Ende.HttpServer`](https://docs.ende.sh/api/ende/~/Ende.HttpServer)
instead.

```diff
- function foo(server: Ende.Server) {
+ function foo(server: Ende.HttpServer) {
  // ...  
}
```

See [deno#20840](https://github.com/denoland/deno/issues/20840) for details.

- `Ende.shutdown()`

Use
[`Ende.Conn.closeWrite()`](https://docs.ende.sh/api/ende/~/Ende.Conn#method_closeWrite_0)
instead.

```diff
  using conn = await Ende.connect({ port: 80 });

- await Ende.shutdown(conn.rid);
+ await conn.closeWrite();
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.stderr.prototype.rid`

Use [`Ende.stderr`](https://docs.ende.sh/api/ende/~/Ende.stderr) instance
methods instead.

```diff
- if (Ende.isatty(Ende.stderr.rid)) {
+ if (Ende.stderr.isTerminal()) {
    console.log("`Ende.stderr` is a terminal");
  }

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(Ende.stderr.rid, data);
+ await Ende.stderr.write(data);

- Ende.close(Ende.stderr.rid);
+ Ende.stderr.close();
```

Note: This symbol is soft-removed . Its types have been removed, but its
implementation remains to reduce breaking changes. You can ignore "property does
not exist" TypeScript errors by using the
[`@ts-ignore`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#suppress-errors-in-ts-files-using--ts-ignore-comments)
directive.

```diff
+ // @ts-ignore `Ende.stderr.rid` is soft-removed .
  Ende.isatty(Ende.stderr.rid);
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.stdin.prototype.rid`

Use [`Ende.stdin`](https://docs.ende.sh/api/ende/~/Ende.stdin) instance methods
instead.

```diff
- if (Ende.isatty(Ende.stdin.rid)) {
+ if (Ende.stdin.isTerminal()) {
    console.log("`Ende.stdout` is a terminal");
  }

  const buffer = new Uint8Array(1_024);
- await Ende.write(Ende.stdin.rid, buffer);
+ await Ende.stdin.write(buffer);

- Ende.close(Ende.stdin.rid);
+ Ende.stdin.close();
```

Note: This symbol is soft-removed . Its types have been removed, but its
implementation remains to reduce breaking changes. You can ignore "property does
not exist" TypeScript errors by using the
[`@ts-ignore`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#suppress-errors-in-ts-files-using--ts-ignore-comments)
directive.

```diff
+ // @ts-ignore `Ende.stdin.rid` is soft-removed .
  Ende.isatty(Ende.stdin.rid);
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.stdout.prototype.rid`

Use [`Ende.stdout`](https://docs.ende.sh/api/ende/~/Ende.stdout) instance
methods instead.

```diff
- if (Ende.isatty(Ende.stdout.rid)) {
+ if (Ende.stdout.isTerminal()) {
    console.log("`Ende.stdout` is a terminal");
  }

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(Ende.stdout.rid, data);
+ await Ende.stdout.write(data);

- Ende.close(Ende.stdout.rid);
+ Ende.stdout.close();
```

Note: This symbol is soft-removed . Its types have been removed, but its
implementation remains to reduce breaking changes. You can ignore "property does
not exist" TypeScript errors by using the
[`@ts-ignore`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#suppress-errors-in-ts-files-using--ts-ignore-comments)
directive.

```diff
+ // @ts-ignore `Ende.stdout.rid` is soft-removed .
  Ende.isatty(Ende.stdout.rid);
```

See [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.TcpConn.prototype.rid`

Use [`Ende.TcpConn`](https://docs.ende.sh/api/ende/~/Ende.TcpConn) instance
methods instead.

```diff
  using tcpConn = await Ende.connect({ port: 80 });

  const buffer = new Uint8Array(1_024);
- await Ende.read(tcpConn.rid, buffer);
+ await tcpConn.read(buffer);

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(tcpConn.rid, data);
+ await tcpConn.write(data);

- await Ende.shutdown(tcpConn.rid);
+ await tcpConn.closeWrite();

- Ende.close(tcpConn.rid);
+ tcpConn.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.TlsConn.prototype.rid`

Use [`Ende.TlsConn`](https://docs.ende.sh/api/ende/~/Ende.TlsConn) instance
methods instead.

```diff
  const caCert = await Ende.readTextFile("./certs/my_custom_root_CA.pem");
  using tlsConn = await Ende.connectTls({ caCerts: [caCert], hostname: "192.0.2.1", port: 80 });

  const buffer = new Uint8Array(1_024);
- await Ende.read(tlsConn.rid, buffer);
+ await tlsConn.read(buffer);

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(tlsConn.rid, data);
+ await tlsConn.write(data);

- await Ende.shutdown(tlsConn.rid);
+ await tlsConn.closeWrite();

- Ende.close(tlsConn.rid);
+ tlsConn.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.TlsListener.prototype.rid`

Use [`Ende.TlsListener`](https://docs.ende.sh/api/ende/~/Ende.TlsListener)
instance methods instead.

```diff
  const listener = Ende.listenTls({
    port: 443,
    cert: Ende.readTextFileSync("./server.crt"),
    key: Ende.readTextFileSync("./server.key"),
  });

  // ...

- Ende.close(listener.rid);
+ listener.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.UnixConn.prototype.rid`

Use [`Ende.UnixConn`](https://docs.ende.sh/api/ende/~/Ende.UnixConn) instance
methods instead.

```diff
  using unixConn = await Ende.connect({ path: "/foo/bar.sock", transport: "unix" });

  const buffer = new Uint8Array(1_024);
- await Ende.read(unixConn.rid, buffer);
+ await unixConn.read(buffer);

  const data = new TextEncoder().encode("Hello, world!");
- await Ende.write(unixConn.rid, data);
+ await unixConn.write(data);

- await Ende.shutdown(unixConn.rid);
+ await unixConn.closeWrite();

- Ende.close(unixConn.rid);
+ unixConn.close();
```

See the [Deno 1.40 blog post][Deno 1.40 blog post] for details.

- `Ende.writeAllSync()`

Use [`writeAllSync()`](https://jsr.io/@ende/io/doc/~/writeAllSync) from the
Standard Library instead.

```diff
+ import { writeAllSync } from "jsr:@ende/io/write-all";

  const data = new TextEncoder().encode("Hello, world!");

- Ende.writeAllSync(Ende.stdout, data);
+ writeAllSync(Ende.stdout, data);
```

See [deno#9795][deno#9795] for details.

- `Ende.writeAll()`

Use [`writeAll()`](https://jsr.io/@ende/io/doc/~/writeAll) from the Standard
Library instead.

```diff
+ import { writeAll } from "jsr:@ende/io/write-all";

  const data = new TextEncoder().encode("Hello, world!");

- await Ende.writeAll(Ende.stdout, data);
+ await writeAll(Ende.stdout, data);
```

See [deno#9795][deno#9795] for details.

- `Ende.Writer`

Use [Writer](https://jsr.io/@ende/io/doc/~/Writer) from the Standard Library
instead.

```diff
+ import type { Writer } from "jsr:@ende/io/types";

- function foo(writer: Ende.Writer) {
+ function foo(writer: Writer) {
  // ...  
}
```

See [deno#9795][deno#9795] for details.

- `Ende.WriterSync`

Use [WriterSync](https://jsr.io/@ende/io/doc/~/WriterSync) from the Standard
Library instead.

```diff
+ import type { WriterSync } from "jsr:@ende/io/types";

- function foo(writer: Ende.WriterSync) {
+ function foo(writer: WriterSync) {
  // ...  
}
```

See [deno#9795][deno#9795] for details.

- `Ende.writeSync()`

Use the `.writeSync()` method on the resource itself.

```diff
  using conn = await Ende.connect({ port: 80 });
  const buffer = new TextEncoder().encode("My message");

- Ende.writeSync(conn.rid, buffer);
+ conn.writeSync(buffer);
```

```diff
  using file = Ende.openSync("/foo/bar.txt", { write: true });
  const buffer = new TextEncoder().encode("My message");

- Ende.writeSync(file.rid, buffer);
+ file.writeSync(buffer);
```

See [deno#9795][deno#9795] for details.

- `Ende.write()`

Use the `.write()` method on the resource itself.

```diff
  using conn = await Ende.connect({ port: 80 });
  const buffer = new TextEncoder().encode("My message");

- await Ende.write(conn.rid, buffer);
+ await conn.write(buffer);
```

```diff
  using file = await Ende.open("/foo/bar.txt", { write: true });
  const buffer = new TextEncoder().encode("My message");

- await Ende.write(file.rid, buffer);
+ await file.write(buffer);
```

See [deno#9795][deno#9795] for details.

- `new Ende.FsFile()`

Use [`Ende.openSync()`](https://docs.ende.sh/api/ende/~/Ende.openSync) or
[`Ende.open()`](https://docs.ende.sh/api/ende/~/Ende.open) instead.

```diff
- const file = new Ende.FsFile(3);
+ using file = await Ende.open("/foo/bar.txt");
```

- `window`

Use `globalThis` instead.

```diff
  const messageBuffer = new TextEncoder().encode("Hello, world!");
  
- const hashBuffer = await window.crypto.subtle.digest("SHA-256", messageBuffer);
+ const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", messageBuffer);
```

See [deno#9795][deno#9795] for details.

[deno#9795]: https://github.com/denoland/deno/issues/9795
[Deno 1.40 blog post]: https://deno.com/blog/v1.40#deprecations-stabilizations-and-removals
