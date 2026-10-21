---
last_modified: 2026-10-20
title: "Architecture Overview"
description: "Deep dive into Ende's internal architecture, explaining core components like the runtime, compiler, and security sandbox. Learn how Ende processes requests and executes JavaScript/TypeScript code."
oldUrl: /runtime/manual/references/contributing/architecture/
---

## Ende and Linux analogy

|                       **Linux** | **Ende**                          |
| ------------------------------: | :-------------------------------- |
|                       Processes | Web Workers                       |
|                        Syscalls | Ops                               |
|           File descriptors (fd) | [Resource ids (rid)](#resources)  |
|                       Scheduler | Tokio                             |
| Userland: libc++ / glib / boost | https://jsr.io/@std               |
|                 /proc/\$\$/stat | [Ende.metrics()](#metrics)        |
|                       man pages | ende types / https://docs.ende.sh |

### Resources

Resources (AKA `rid`) are Ende's version of file descriptors. They are integer
values used to refer to open files, sockets, and other concepts. For testing it
would be good to be able to query the system for how many open resources there
are.

```ts
console.log(Ende.resources());
// { 0: "stdin", 1: "stdout", 2: "stderr" }
Ende.close(0);
console.log(Ende.resources());
// { 1: "stdout", 2: "stderr" }
```

### Metrics

Metrics is Ende's internal counter for various statistics.

```shell
> console.table(Ende.metrics())
┌─────────────────────────┬───────────┐
│          (idx)          │  Values   │
├─────────────────────────┼───────────┤
│      opsDispatched      │    9      │
│    opsDispatchedSync    │    0      │
│   opsDispatchedAsync    │    0      │
│ opsDispatchedAsyncUnref │    0      │
│      opsCompleted       │    9      │
│    opsCompletedSync     │    0      │
│    opsCompletedAsync    │    0      │
│ opsCompletedAsyncUnref  │    0      │
│    bytesSentControl     │   504     │
│      bytesSentData      │    0      │
│      bytesReceived      │   856     │
└─────────────────────────┴───────────┘
```

## Conference

- Ryan Dahl. (May 27, 2020).
  [An interesting case with Ende](https://www.youtube.com/watch?v=1b7FoBwxc7E).
  Ende Israel.
- Bartek Iwańczuk. (Oct 6, 2020).
  [Ende internals - how modern JS/TS runtime is built](https://www.youtube.com/watch?v=AOvg_GbnsbA&t=35m13s). Paris Ende.
