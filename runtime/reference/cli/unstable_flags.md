---
last_modified: 2026-10-20
title: "Unstable feature flags"
oldUrl:
  - /runtime/tools/unstable_flags/
  - /runtime/manual/tools/unstable_flags/
---

New Ende runtime features are often released behind feature flags, so that users
can try out new APIs and features before they are finalized. Current unstable
feature flags are listed on this page, and can also be found in the CLI help
text by running:

```sh
ende --help
```

## Using flags at the command line

You can enable a feature flag when you run an Ende program from the command line
by passing in the flag as an option to the CLI. Here's an example of running a
program with the `--unstable-node-globals` flag enabled:

```sh
ende run --unstable-node-globals main.ts
```

## Configuring flags in `ende.json`

You can specify which unstable features you'd like to enable for your project
using a
[configuration option in `ende.json`](/runtime/fundamentals/configuration/).

```json title="ende.json"
{
  "unstable": ["sloppy-imports", "webgpu"]
}
```

The possible values in the `unstable` array are the flag names with the
`--unstable-` prefix removed.

## Configuration via environment variables

Some flags can be enabled by setting a value (any value) for an environment
variable of a given name, rather than being passed as a flag or
[`ende.json`](/runtime/fundamentals/configuration/) configuration option. Flags
that are settable via environment variables will be noted below.

Here's an example of setting the `--unstable-sloppy-imports` flag via
environment variable:

```sh
export ENDE_UNSTABLE_SLOPPY_IMPORTS=true
```

## `--unstable-sloppy-imports`

**Environment variable:** `ENDE_UNSTABLE_SLOPPY_IMPORTS`

This flag enables behavior which will infer file extensions from imports that do
not include them. Normally, the import statement below would produce an error:

```ts title="foo.ts"
import { Example } from "./bar";
console.log(Example);
```

```ts title="bar.ts"
export const Example = "Example";
```

Executing the script with sloppy imports enabled will remove the error, but
provide guidance that a more performant syntax should be used.

Sloppy imports will allow (but print warnings for) the following:

- Omit file extensions from imports
- Use incorrect file extensions (e.g. importing with a `.js` extension when the
  actual file is `.ts`)
- Import a directory path, and automatically use `index.js` or `index.ts` as the
  import for that directory

[`ende compile`](/runtime/reference/cli/compile/) does not support sloppy
imports.

## `--unstable-unsafe-proto`

Ende made a conscious decision to not support `Object.prototype.__proto__` for
security reasons. However some libraries still rely on this property to work
correctly.

This flag enables this property. Note that it is not recommended to use this,
but if you really need to use a package that relies on it, the escape hatch is
now available to you.

`--unsafe-proto` is a stable shorthand for the same behavior. It is spelled as
an ordinary flag rather than an unstable one, so
`ende run --unsafe-proto main.ts` and `ende run --unstable-unsafe-proto main.ts`
are equivalent.

## `--unstable-webgpu`

Enable the
[`WebGPU` API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) in
the global scope, as in the browser. Below is a simple example to get basic
information about the GPU using this API:

```ts
// Try to get an adapter from the user agent.
const adapter = await navigator.gpu.requestAdapter();
if (adapter) {
  // Print out some basic details about the adapter.
  const adapterInfo = await adapter.requestAdapterInfo();

  // On some systems this will be blank...
  console.log(`Found adapter: ${adapterInfo.device}`);

  // Print GPU feature list
  const features = [...adapter.features.values()];
  console.log(`Supported features: ${features.join(", ")}`);
} else {
  console.error("No adapter found");
}
```

Check out [this repository](https://github.com/denoland/webgpu-examples) for
more examples using WebGPU.

## `--unstable-broadcast-channel`

Enabling this flag makes the
[`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
web API available for use in the global scope, as in the browser.

## `--unstable-worker-options`

Enable unstable
[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
API options. Specifically, it enables you to specify permissions available to
workers:

```ts
new Worker(`data:application/javascript;base64,${btoa(`postMessage("ok");`)}`, {
  type: "module",
  ende: {
    permissions: {
      read: true
    }
  }
}).onmessage = ({ data }) => {
  console.log(data);
};
```

## `--unstable-cron`

Enabling this flag makes the [`Ende.cron`](/runtime/fundamentals/cron/) API
available on the `Ende` namespace.

## `--unstable-net`

Enable unstable net APIs. These APIs include:

- [`WebSocketStream`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocketStream)
- [`Ende.DatagramConn`](https://docs.ende.sh/api/ende/~/Ende.DatagramConn)

## `--unstable-otel`

Enable the
[OpenTelemetry integration for Ende](/runtime/fundamentals/open_telemetry). This
feature is now stable, so this flag is unnecessary.

## `--unstable-lazy-dynamic-imports`

Lazily loads statically analyzable dynamic imports when not running with type
checking, rather than loading them up front. Note that this may change the order
in which semver specifiers are resolved.

## `--unstable-no-legacy-abort`

Use the abort signal in [`Ende.serve`](/api/ende/~/Ende.serve/) without the
legacy behavior. With this flag `request.signal` aborts only when the client
actually disconnects, rather than on every successful response.

See
[Ende.serve request abort behavior](/runtime/reference/ende_serve_legacy_abort/)
for why this is changing and how to detect when a request has been fully
delivered.

## `--unstable`

> [!CAUTION]
> **`--unstable` is deprecated - use granular flags instead.**
>
> The `--unstable` flag is no longer being used for new features, and will be
> removed in a future release. All unstable features that were available using
> this flag are now available as granular unstable flags, notably:
>
> - `--unstable-kv`
> - `--unstable-cron`
>
> Please use these feature flags instead moving forward.

## `--unstable-temporal`

> [!NOTE]
> The Temporal API is **stable** and available by default. The
> `--unstable-temporal` flag is no longer required.

The [Temporal API](https://tc39.es/proposal-temporal/docs/) is a modern date and
time API available in the global scope. It provides better support for time
zones, calendars, and more precise date/time calculations than the legacy `Date`
object.

```ts title="example.ts"
// Get the current date and time
const now = Temporal.Now.plainDateTimeISO();
console.log(`Current date and time: ${now}`);

const date = Temporal.PlainDate.from("2025-07-10");
const nextWeek = date.add({ days: 7 });
console.log(`Next week: ${nextWeek}`);

// Working with time zones
const zonedDateTime = Temporal.Now.zonedDateTimeISO("America/New_York");
console.log(`Time in New York: ${zonedDateTime}`);
```

## `--unstable-tsgo`

Type-checks with TypeScript's native compiler (written in Go), which is often
around 10 times faster than the default JavaScript `tsc`. Ende integrates the
native compiler with its own module resolution and types, so Ende code
type-checks normally.

```sh
ende check --unstable-tsgo main.ts
```

It can also be enabled with the `ENDE_UNSTABLE_TSGO=1` environment variable or
`"unstable": ["tsgo"]` in `ende.json`. This is a preview feature and is not yet
feature-complete. See
[TypeScript](/runtime/fundamentals/typescript/#faster-type-checking-with-the-native-compiler-tsgo)
for details.
