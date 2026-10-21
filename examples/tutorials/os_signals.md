---
last_modified: 2026-10-20
title: "Handle OS signals"
description: "Tutorial on handling operating system signals in Ende. Learn how to capture SIGINT and SIGBREAK events, manage signal listeners, and implement graceful shutdown handlers in your applications."
url: /examples/os_signals_tutorial/
oldUrl:
  - /runtime/manual/examples/os_signals/
  - /runtime/tutorials/os_signals/
---

> ⚠️ Windows supports listening for `SIGINT`, `SIGBREAK`, `SIGTERM`, `SIGQUIT`,
> `SIGHUP`, and `SIGWINCH` (all except `SIGINT`/`SIGBREAK` go through libuv’s
> Windows signal emulation).

## Concepts

- [Ende.addSignalListener()](https://docs.ende.sh/api/ende/~/Ende.addSignalListener)
  can be used to capture and monitor OS signals.
- [Ende.removeSignalListener()](https://docs.ende.sh/api/ende/~/Ende.removeSignalListener)
  can be used to stop watching the signal.

## Set up an OS signal listener

APIs for handling OS signals are modelled after already familiar
[`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
and
[`removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)
APIs.

> ⚠️ Note that listening for OS signals doesn’t prevent event loop from
> finishing, ie. if there are no more pending async operations the process will
> exit.

You can use `Ende.addSignalListener()` function for handling OS signals:

```ts title="add_signal_listener.ts"
console.log("Press Ctrl-C to trigger a SIGINT signal");

Ende.addSignalListener("SIGINT", () => {
  console.log("interrupted!");
  Ende.exit();
});

// Add a timeout to prevent process exiting immediately.
setTimeout(() => {}, 5000);
```

Run with:

```shell
ende run add_signal_listener.ts
```

You can use `Ende.removeSignalListener()` function to unregister previously
added signal handler.

```ts title="signal_listeners.ts"
console.log("Press Ctrl-C to trigger a SIGINT signal");

const sigIntHandler = () => {
  console.log("interrupted!");
  Ende.exit();
};
Ende.addSignalListener("SIGINT", sigIntHandler);

// Add a timeout to prevent process exiting immediately.
setTimeout(() => {}, 5000);

// Stop listening for a signal after 1s.
setTimeout(() => {
  Ende.removeSignalListener("SIGINT", sigIntHandler);
}, 1000);
```

Run with:

```shell
ende run signal_listeners.ts
```

## Windows support

The supported signal set differs between platforms. The Windows-specific
behavior is:

| Use case                         | Supported signals on Windows                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Ende.addSignalListener(sig, …)` | `SIGINT`, `SIGBREAK`, `SIGTERM`, `SIGQUIT`, `SIGHUP`, `SIGWINCH`                                                                   |
| `Ende.kill(pid, sig)`            | `SIGINT`, `SIGBREAK`, `SIGTERM`, `SIGQUIT`, `SIGHUP`, `SIGWINCH`, `SIGKILL`, `SIGABRT`, plus signal `0` for a process-health check |

`SIGKILL` and `SIGABRT` are deliberately **not** registerable via
`addSignalListener` — they’re uncatchable / fatal, matching Unix semantics. On
Windows the catchable signals all forward to libuv’s emulation layer; signals
sent via `Ende.kill` ultimately invoke `TerminateProcess`.
