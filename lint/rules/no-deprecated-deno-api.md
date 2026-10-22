---
title: no-deprecated-ende-api
tags: [recommended]
---

Warns the usage of the deprecated - Ende APIs.

The following APIs will be removed from the `Ende.*` namespace but have newer
APIs to migrate to. See the
[Removed and deprecated APIs](/runtime/reference/migrate_deprecations/) page for
migration instructions.

- `Ende.Buffer`
- `Ende.Closer`
- `Ende.close()`
- `Ende.Conn.rid`
- `Ende.copy()`
- `Ende.customInspect`
- `Ende.File`
- `Ende.fstatSync()`
- `Ende.fstat()`
- `Ende.FsWatcher.rid`
- `Ende.ftruncateSync()`
- `Ende.ftruncate()`
- `Ende.futimeSync()`
- `Ende.futime()`
- `Ende.isatty()`
- `Ende.Listener.rid`
- `Ende.ListenTlsOptions.certFile`
- `Ende.ListenTlsOptions.keyFile`
- `Ende.readAllSync()`
- `Ende.readAll()`
- `Ende.Reader`
- `Ende.ReaderSync`
- `Ende.readSync()`
- `Ende.read()`
- `Ende.run()`
- `Ende.seekSync()`
- `Ende.seek()`
- `Ende.serveHttp()`
- `Ende.Server`
- `Ende.shutdown`
- `Ende.stderr.rid`
- `Ende.stdin.rid`
- `Ende.stdout.rid`
- `Ende.TlsConn.rid`
- `Ende.UnixConn.rid`
- `Ende.writeAllSync()`
- `Ende.writeAll()`
- `Ende.Writer`
- `Ende.WriterSync`
- `Ende.writeSync()`
- `Ende.write()`
- `new Ende.FsFile()`

The following APIs will be removed from the `Ende.*` namespace without
replacement.

- `Ende.resources()`
- `Ende.metrics()`
