---
last_modified: 2026-06-17
title: "Security and permissions"
description: "A guide to Ende's security model: secure-by-default execution, the permission sandbox, evaluating and executing untrusted code, and the permission broker. See the Permissions reference for the flags."
---

Ende is secure by default. Unless you specifically enable it, a program run with
Ende has no access to sensitive APIs, such as file system access, network
connectivity, or environment access. You must explicitly grant access to these
resources with command line flags or with a runtime permission prompt. This is a
major difference from Node, where dependencies are automatically granted full
access to all system I/O, potentially introducing hidden vulnerabilities into
your project.

Before using Ende to run completely untrusted code, read the
[section on executing untrusted code](#executing-untrusted-code) below.

## Key principles

Before diving into the specifics of permissions, it's important to understand
the key principles of Ende's security model:

- **No access to I/O by default**: Code executing in an Ende runtime has no
  access to read or write arbitrary files on the file system, to make network
  requests or open network listeners, to access environment variables, or to
  spawn subprocesses.
- **No limits on the execution of code at the same privilege level**: Ende
  allows the execution of any code (JS/TS/Wasm) via multiple means, including
  `eval`, `new Function`, dynamic imports and web workers at the same privilege
  level with little restriction as to where the code originates (network, JSR,
  etc).
- **Multiple invocations of the same application can share data**: Ende provides
  a mechanism for multiple invocations of the same application to share data,
  through built in caching and storage APIs. Different applications can not see
  each other's data.
- **All code executing on the same thread shares the same privilege level**: All
  code executing on the same thread shares the same privilege level. It is not
  possible for different modules to have different privilege levels within the
  same thread.
- **Code can not escalate its privileges without user consent**: Code executing
  in an Ende runtime can not escalate its privileges without the user agreeing
  explicitly to an escalation via interactive prompt or a invocation time flag.
- **The initial static module graph can import modules without restrictions**:
  All modules that are imported in the initial static module graph (local files,
  jsr packages, and remote URLs) are loaded by the runtime without consulting
  the permission system. No `--allow-read` is required to load local files, and
  no `--allow-net` is required to fetch remote modules. The static graph
  includes static `import` statements and `import()` calls whose specifier is a
  string literal: anything that can be resolved without running code. This
  exemption applies only to loading. Once code runs, anything it does still goes
  through the permission system, and `import()` calls with non-literal
  specifiers (e.g. `import(someVariable)`) are checked against `--allow-read` /
  `--allow-import` at runtime.

These key principles are designed to provide an environment where a user can
execute code with minimal risk of harm to the host machine or network. The
security model is designed to be simple to understand and to provide a clear
separation of concerns between the runtime and the code executing within it. The
security model is enforced by the Ende runtime, and is not dependent on the
underlying operating system.

## Permissions

Ende is sandboxed by default: code cannot touch the file system, network,
environment, or run subprocesses unless you allow it. Permissions are not all or
nothing. You grant them with `--allow-*` flags, and most can be scoped to
specific resources, so a program gets exactly the access it needs and no more.

Run a program with no flags and a sensitive operation is refused:

```sh
ende run main.ts
# error: Requires net access to "example.com", run again with the --allow-net flag
```

Grant access scoped to just the host the program should reach:

```sh
ende run --allow-net=example.com main.ts
```

The same scoping works for the other permissions: `--allow-read=./data` limits
reads to one directory, `--allow-env=API_KEY` to a single variable, and so on. A
bare `--allow-net` with no value grants the whole category, which is broader
than most programs need.

When an operation is refused (because the permission was not granted or was
explicitly denied), Ende throws a `NotCapable` error. You can catch it like any
other error if you want to handle missing permissions gracefully:

```ts
try {
  await Ende.readTextFile("/etc/hosts");
} catch (err) {
  if (err instanceof Ende.errors.NotCapable) {
    console.error("Missing read permission, run again with --allow-read");
  }
}
```

When stdout is a terminal and you have not passed a flag, Ende pauses and asks
instead of failing, so you can grant access interactively as it is requested:

```console
⚠️  Ende requests net access to "example.com". Run again with --allow-net to bypass this prompt.
   Allow? [y/n/A] (y = yes, allow; n = no, deny; A = allow all net permissions) >
```

`--deny-*` flags override their `--allow-*` counterparts, so you can grant a
broad category and carve out the sensitive parts:
`--allow-read --deny-read=/etc` reads anything except `/etc`. At the other
extreme, `-A` (`--allow-all`) grants everything and turns the sandbox off
entirely, giving the same access as running code in Node, so reach for it
sparingly.

See the [Permissions reference](/runtime/reference/permissions/) for every
permission and its flags, and
[`permissions` in ende.json](/runtime/reference/ende_json/#permissions) for
declaring them in your configuration file.

### Permissions that bypass the sandbox

A few permissions grant access to things Ende cannot sandbox, so granting them
is effectively granting full access:

- `--allow-run` lets the program spawn subprocesses. A subprocess runs as a
  separate program with its own permissions, not the restricted set you granted
  the Ende process, so whatever it does happens outside the sandbox. This is why
  `--allow-run=ende` is especially dangerous: a script that can start a new
  `ende` process can start it with `--allow-all`, inheriting none of the
  parent's limits and escaping the sandbox entirely. Grant `--allow-run` only
  for specific, trusted executables where you can (`--allow-run=git`), and avoid
  giving a sandboxed program the ability to launch `ende` or a shell.
- `--allow-ffi` loads native libraries through [FFI](/runtime/fundamentals/ffi/)
  or Node-API addons. Ende enforces permissions in the JavaScript layer, but a
  native library runs as compiled machine code in the same process and can issue
  system calls directly. Once loaded, it can read files, open sockets, or do
  anything the operating system lets the process do, regardless of which
  `--allow-*` flags you passed.

Be careful when combining `--allow-write` with `--allow-run`. Write access to a
directory that contains an allowed executable (or to the executable itself) lets
a program overwrite that binary, so the next subprocess it spawns runs
attacker-controlled code with the host's privileges. Avoid granting write access
to directories that hold binaries you allow with `--allow-run`.

Treat both as equivalent to `--allow-all` when deciding whether to trust the
code you are running.

### Adjusting permissions at runtime

A program can inspect and tighten its own permissions through the
[`Ende.permissions`](/api/ende/#permissions) API.
[`Ende.permissions.query`](/api/ende/~/Ende.Permissions/#prototype.query)
reports whether a permission is granted,
[`Ende.permissions.request`](/api/ende/~/Ende.Permissions/#prototype.request)
prompts for one on demand, and
[`Ende.permissions.revoke`](/api/ende/~/Ende.Permissions/#prototype.revoke)
downgrades a granted permission back to the prompt state:

```ts
// Read a config file at startup, then give up read access.
const config = JSON.parse(await Ende.readTextFile("./config.json"));
await Ende.permissions.revoke({ name: "read" });

// Later reads now have to prompt again, and fail outright under --no-prompt.
```

Dropping permissions you no longer need after startup is a simple way to shrink
the attack surface available to the rest of your code, including your
dependencies.

## Evaluation of code

Ende sets no limits on the execution of code at the same privilege level. This
means that code executing in an Ende runtime can use `eval`, `new Function`, or
even dynamic import or web workers to execute **arbitrary** code with the same
privilege level as the code that called `eval`, `new Function`, or the dynamic
import or web worker.

This code can be hosted on the network, be in a local file (if read permissions
are granted), or be stored as plain text in a string inside of the code that
called `eval`, `new Function`, or the dynamic import or web worker.

## Executing untrusted code

While Ende provides security features that are designed to protect the host
machine and network from harm, untrusted code is still scary. When executing
untrusted code, it is important to have more than one layer of defense. Some
suggestions for executing untrusted code are outlined below, and we recommend
using all of these when executing arbitrary untrusted code:

- Run `ende` with limited permissions and determine upfront what code actually
  needs to run (and prevent more code being loaded using `--frozen` lockfile and
  `--cached-only`).
- Isolate the untrusted part in a
  [Web Worker with a reduced permission set](/runtime/reference/web_platform_apis/#specifying-worker-permissions),
  so it cannot inherit everything the main program was granted.
- Use OS provided sandboxing mechanisms like `chroot`, `cgroups`, `seccomp`,
  etc.
- Use a sandboxed environment like a VM or MicroVM (gVisor, Firecracker, etc).

## Keeping dependencies safe

The permission sandbox controls what code can do at runtime, but it does not
tell you whether your dependencies are trustworthy. See
[supply chain management](/runtime/packages/supply_chain/) for keeping
dependencies safe over time.

## Permission broker

> [!CAUTION] Advanced use only
>
> Using a permission broker changes Ende's decision authority: CLI flags and
> prompts no longer apply. Ensure your broker process is resilient, audited, and
> available before enabling `ENDE_PERMISSION_BROKER_PATH`.

For centralized and policy-driven permission decisions, Ende can delegate all
permission checks to an external broker process. Enable this by setting the
`ENDE_PERMISSION_BROKER_PATH` environment variable to a path that Ende will use
to connect to the broker:

- On Unix-like systems: a Unix domain socket path (for example,
  `/tmp/ende-perm.sock`).
- On Windows: a named pipe (for example, `\\.\pipe\ende-permission-broker`).

When a permission broker is active:

- All `--allow-*` and `--deny-*` flags are ignored.
- Interactive permission prompts are not shown (equivalent to non-interactive
  mode).
- Every permission check is sent to the broker; the broker must reply with a
  decision for each request.

If anything goes wrong during brokering (for example: Ende cannot connect to the
socket/pipe, messages are malformed, arrive out of order, IDs do not match, or
the connection closes unexpectedly), Ende immediately terminates the process to
preserve integrity and prevent permission escalation.

The request/response message shapes are versioned and defined by JSON Schemas:

- Request schema:
  [permission-broker-request.v1.json](https://github.com/theende/ende/blob/primary/cli/schemas/permission-broker-request.v1.json)
- Response schema:
  [permission-broker-response.v1.json](https://github.com/theende/ende/blob/primary/cli/schemas/permission-broker-response.v1.json)

Each request contains a version (`v`), the Ende process ID (`pid`), a unique
monotonic request `id`, a timestamp (`datetime`, RFC 3339), the `permission`
name, and an optional `value` depending on permission type. The response must
echo the `id` and include a `result` of either `"allow"` or `"deny"`. When
denied, a human-readable `reason` may be included.

Example message flow:

```text
-> req {"v":1,"pid":10234,"id":1,"datetime":"2025-01-01T00:00:00.000Z","permission":"read","value":"./run/permission_broker/scratch.txt"}
<- res {"id":1,"result":"allow"}
-> req {"v":1,"pid":10234,"id":2,"datetime":"2025-01-01T00:00:01.000Z","permission":"read","value":"./run/permission_broker/scratch.txt"}
<- res {"id":2,"result":"allow"}
-> req {"v":1,"pid":10234,"id":3,"datetime":"2025-01-01T00:00:02.000Z","permission":"read","value":"./run/permission_broker/log.txt"}
<- res {"id":3,"result":"allow"}
-> req {"v":1,"pid":10234,"id":4,"datetime":"2025-01-01T00:00:03.000Z","permission":"write","value":"./run/permission_broker/log.txt"}
<- res {"id":4,"result":"allow"}
-> req {"v":1,"pid":10234,"id":5,"datetime":"2025-01-01T00:00:04.000Z","permission":"env","value":null}
<- res {"id":5,"result":"deny","reason":"Environment access is denied."}
```
