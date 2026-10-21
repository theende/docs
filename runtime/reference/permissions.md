---
last_modified: 2026-10-20
title: "Permissions"
description: "Reference for Ende's permission system: how the runtime sandbox works and how to grant or deny file system, network, environment, system, subprocess, FFI, and import access with the --allow and --deny flags."
oldUrl:
  - /runtime/manual/basics/permissionsDeno/
  - /manual/basics/permissions
  - /runtime/manual/basics/permissions
  - /runtime/manual/getting_started/permissions
---

Ende runs code in a secure sandbox: a program has no access to sensitive system
I/O unless you grant it. This page is the reference for every permission and the
`--allow-*` / `--deny-*` flags that control it. For the security model behind it
and guidance on running untrusted code, see
[Security](/runtime/fundamentals/security/).

By default, access to most system I/O is denied. There are some I/O operations
that are allowed in a limited capacity, even by default. These are described
below.

To enable these operations, the user must explicitly grant permission to the
Ende runtime. This is done by passing the `--allow-read`, `--allow-write`,
`--allow-net`, `--allow-env`, `--allow-run`, `--allow-sys`, `--allow-ffi`, and
`--allow-import` flags to the `ende` command.

During execution of a script, a user can also explicitly grant permission to
specific files, directories, network addresses, environment variables, and
subprocesses when prompted by the runtime. Prompts are not shown if
stdout/stderr are not a TTY, or when the `--no-prompt` flag is passed to the
`ende` command.

Users can also explicitly disallow access to specific resources by using the
`--deny-read`, `--deny-write`, `--deny-net`, `--deny-env`, `--deny-run`,
`--deny-sys`, `--deny-ffi`, and `--deny-import` flags. These flags take
precedence over the allow flags. For example, if you allow network access but
deny access to a specific domain, the deny flag will take precedence.

Ende also provides a `--allow-all` flag that grants all permissions to the
script. This **disables** the security sandbox entirely, and should be used with
caution: with `--allow-all`, the script has full access to the system.

Definition: `-A, --allow-all`

```sh
ende run -A script.ts
ende run --allow-all script.ts
```

By default, Ende will not generate a stack trace for permission requests as it
comes with a hit to performance. Users can enable stack traces with the
`ENDE_TRACE_PERMISSIONS` environment variable to `1`.

Ende can also generate an audit log of all accessed permissions, regardless of
whether the access was allowed or denied.

Set `ENDE_AUDIT_PERMISSIONS` to a **file path** to write JSONL — each line is an
object with the following keys:

- `v`: the version of the format
- `datetime`: when the permission was accessed, in RFC 3339 format
- `permission`: the name of the permission
- `value`: the value that the permission was accessed with, or `null` if it was
  accessed with no value

A schema for this can be found in
[permission-audit.v1.json](https://github.com/theende/ende/blob/primary/cli/schemas/permission-audit.v1.json).

In addition, this env var can be combined with the above-mentioned
`ENDE_TRACE_PERMISSIONS`, which then adds a new `stack` field to the entries
which is an array containing all the stack trace frames.

You can also set `ENDE_AUDIT_PERMISSIONS=otel` to emit each access as an
OpenTelemetry **log record** instead of writing to a file. The records are sent
to whichever exporter you have configured via
[`OTEL_ENDE`](/runtime/fundamentals/open_telemetry/) and carry these attributes:

- `ende.permission.type`
- `ende.permission.value`
- `ende.permission.stack` (if `ENDE_TRACE_PERMISSIONS` is also set)

This is the recommended setup if you already collect OpenTelemetry data — the
permission audit lands next to your traces and metrics so you can correlate it
with request handling.

```sh
OTEL_ENDE=true ENDE_AUDIT_PERMISSIONS=otel ende run -A main.ts
```

## Configuration file

Ende supports storing permissions in the ende.json/ende.jsonc file. Read more
under [configuration](/runtime/reference/ende_json/#permissions).

## File system access

By default, executing code can not read or write arbitrary files on the file
system. This includes listing the contents of directories, checking for the
existence of a given file, and opening or connecting to Unix sockets.

Access to read files is granted using the `--allow-read` (or `-R`) flag, and
access to write files is granted using the `--allow-write` (or `-W`) flag. These
flags can be specified with a list of paths to allow access to specific files or
directories and any subdirectories in them.

Definition: `--allow-read[=<PATH>...]` or `-R[=<PATH>...]`

PATHs may be separated by comma (`,`) characters. To include a comma character
in the PATH, it must be doubled. (Example: `this file,, contains a comma.txt`)

```sh
# Allow all reads from file system
ende run -R script.ts
# or 
ende run --allow-read script.ts

# Allow reads from file foo.txt and bar.txt only
ende run --allow-read=foo.txt,bar.txt script.ts

# Allow reads from any file in any subdirectory of ./data
ende run --allow-read=data script.ts
```

Definition: `--deny-read[=<PATH>...]`

```sh
# Allow reading files in /etc but disallow reading /etc/hosts
ende run --allow-read=/etc --deny-read=/etc/hosts script.ts

# Deny all read access to disk, disabling permission prompts for reads.
ende run --deny-read script.ts
```

Definition: `--allow-write[=<PATH>...]` or `-W[=<PATH>...]`

```sh
# Allow all writes to file system
ende run -W script.ts
# or 
ende run --allow-write script.ts

# Allow writes to file foo.txt and bar.txt only
ende run --allow-write=foo.txt,bar.txt script.ts
```

Definition: `--deny-write[=<PATH>...]`

```sh
# Allow reading files in current working directory 
# but disallow writing to ./secrets directory.
ende run --allow-write=./ --deny-write=./secrets script.ts

# Deny all write access to disk, disabling permission prompts.
ende run --deny-write script.ts
```

Some APIs in Ende are implemented using file system operations under the hood,
even though they do not provide direct read/write access to specific files.
These APIs read and write to disk but do not require any explicit read/write
permissions. Some examples of these APIs are:

- `localStorage`
- `caches`
- `Blob`

Because these APIs are implemented using file system operations, users can use
them to consume file system resources like storage space, even if they do not
have direct access to the file system.

During module loading, Ende can load files from disk. This sometimes requires
explicit permissions, and sometimes is allowed by default:

- All files that are imported from the entrypoint module in a way that they can
  be statically analyzed are allowed to be read by default. This includes static
  `import` statements and dynamic `import()` calls where the argument is a
  string literal that points to a specific file or a directory of files. The
  full list of files that are in this list can be printed using
  `ende info <entrypoint>`.
- Files that are dynamically imported in a way that can not be statically
  analyzed require runtime read permissions.
- A Web Worker's script is loaded as if it were a dynamic import, so a worker
  whose script is a local file, such as
  `new Worker(new URL("./worker.ts", import.meta.url).href, { type: "module" })`,
  requires `--allow-read`. This applies to the worker's entry script and its
  entire static import graph, and the read access is checked against the
  permissions of the thread that created the worker. A worker loaded from an
  `https:` URL instead requires [`--allow-import`](#importing-from-the-web);
  `data:` and `blob:` URLs need no permission.

When fetching modules from the network, or when transpiling code from TypeScript
to JavaScript, Ende uses the file system as a cache. This means that file system
resources like storage space can be consumed by Ende even if the user has not
explicitly granted read/write permissions.

### Symbolic links

When reading or writing through a symbolic link, Ende checks permissions based
on the symlink's location, not the target it points to. This means if you have
`--allow-read=/app`, you can read through a symlink at `/app/link` even if it
points to a file outside `/app`.

However, Ende prevents privilege escalation through symlinks. If a symlink
resolves to a sensitive system path, additional permissions are required:

- **`/proc`, `/dev`, `/sys` (Linux)**: Reading or writing through symlinks that
  resolve to these paths requires `--allow-all`, as these paths can expose
  sensitive system information.
- **`/proc/**/environ`**: Requires `--allow-env` since it exposes environment
  variables.
- **`/dev/null`, `/dev/zero`, `/dev/random`, `/dev/urandom`**: These safe device
  files are always accessible without additional permissions.

Creating symlinks with [`Ende.symlink()`](/api/ende/~/Ende.symlink/) requires
both `--allow-read` and `--allow-write` with full access (not path-specific),
because symlinks can point to arbitrary locations.

> **Note**: Symlinks that already exist on the filesystem can be read through
> using the permissions for the symlink's location. The full read/write
> permission requirement only applies to _creating_ new symlinks with
> [`Ende.symlink()`](/api/ende/~/Ende.symlink/).

## Network access

By default, executing code can not make network requests, open network listeners
or perform DNS resolution. This includes making HTTP requests, opening TCP/UDP
sockets, and listening for incoming connections on TCP or UDP.

Network access is granted using the `--allow-net` flag. This flag can be
specified with a list of hosts to allow access to specific network addresses. A
host can be a hostname or IP address, optionally with a port.

Hostnames do not allow subdomains, unless explicitly listed. To allow any
subdomain for a hostname, `*` can be used as wildcard for any subdomain.

Definition: `--allow-net[=<HOST>...]` or `-N[=<HOST>...]`

```sh
# Allow network access
ende run -N script.ts
# or
ende run --allow-net script.ts

# Allow network access to github.com and jsr.io
ende run --allow-net=github.com,jsr.io script.ts

# Allow all subdomains for example.com
ende run --allow-net="*.example.com" script.ts

# A hostname at port 80:
ende run --allow-net=example.com:80 script.ts

# An IPv4 address on port 443
ende run --allow-net=1.1.1.1:443 script.ts

# An IPv6 address, all ports allowed
ende run --allow-net=[2606:4700:4700::1111] script.ts
```

Definition: `--deny-net[=<HOST>...]`

```sh
# Allow access to network, but deny access 
# to github.com and jsr.io
ende run --allow-net --deny-net=github.com,jsr.io script.ts

# Deny all network access, disabling permission prompts.
ende run --deny-net script.ts
```

During module loading, Ende can load modules from the network. By default Ende
allows loading modules from the following locations using both static and
dynamic imports, without requiring explicit network access:

- `https://deno.land/`
- `https://jsr.io/`
- `https://esm.sh/`
- `https://raw.esm.sh/`
- `https://cdn.jsdelivr.net/`
- `https://raw.githubusercontent.com/`
- `https://gist.githubusercontent.com/`

These locations are trusted "public good" registries that are not expected to
enable data exfiltration through URL paths. You can add more trusted registries
using the `--allow-import` flag.

Ende also sends requests to `https://dl.ende.sh/` at most once a day to check
for updates to the Ende CLI. This can be disabled using `ENDE_NO_UPDATE_CHECK=1`
environment var.

## Environment variables

By default, executing code can not read or write environment variables. This
includes reading environment variables, and setting new values.

Access to environment variables is granted using the `--allow-env` flag. This
flag can be specified with a list of environment variables to allow access to
specific environment variables. You can now specify suffix wildcards to allow
“scoped” access to environmental variables.

Definition: `--allow-env[=<VARIABLE_NAME>...]` or `-E[=<VARIABLE_NAME>...]`

```sh
# Allow access to all environment variables
ende run -E script.ts
# or
ende run --allow-env script.ts

# Allow HOME and FOO environment variables
ende run --allow-env=HOME,FOO script.ts

# Allow access to all environment variables starting with AWS_
ende run --allow-env="AWS_*" script.ts
```

Definition: `--deny-env[=<VARIABLE_NAME>...]`

```sh
# Allow all environment variables except 
# AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.
ende run \
  --allow-env \
  --deny-env=AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY \
  script.ts

# Deny all access to env variables, disabling permission prompts.
ende run --deny-env script.ts
```

The `--ignore-env` flag is similar to `--deny-env`, but instead of denying
access outright, it silently returns `undefined` for any env variable reads.
This is useful when you want code to run without failing on missing permissions,
treating restricted variables as simply unset.

Definition: `--ignore-env[=<VARIABLE_NAME>...]`

```sh
# Ignore all environment variable reads (returns undefined).
ende run --ignore-env script.ts

# Ignore specific environment variables.
ende run --ignore-env=PORT,HOME script.ts
```

> Note for Windows users: environment variables are case insensitive on Windows,
> so Ende also matches them case insensitively (on Windows only).

Ende reads certain environment variables on startup, such as `ENDE_DIR` and
`NO_COLOR` ([see the full list](/runtime/reference/env_variables/)).

The value of the `NO_COLOR` environment variable is visible to all code running
in the Ende runtime, regardless of whether the code has been granted permission
to read environment variables.

## System Information

By default, executing code can not access system information, such as the
operating system release, system uptime, load average, network interfaces, and
system memory information.

Access to system information is granted using the `--allow-sys` flag. This flag
can be specified with a list of allowed interfaces from the list defined in
[Ende.SysPermissionDescriptor](/api/ende/~/Ende.SysPermissionDescriptor/). These
strings map to functions in the `Ende` namespace that provide OS info, like
[Ende.systemMemoryInfo](https://docs.ende.sh/api/ende/~/Ende.SystemMemoryInfo).

Definition: `--allow-sys[=<API_NAME>...]` or `-S[=<API_NAME>...]`

```sh
# Allow all system information APIs
ende run -S script.ts
# or
ende run --allow-sys script.ts

# Allow systemMemoryInfo and osRelease APIs
ende run --allow-sys="systemMemoryInfo,osRelease" script.ts
```

Definition: `--deny-sys[=<API_NAME>...]`

```sh
# Allow accessing all system information but "networkInterfaces"
ende run --allow-sys --deny-sys="networkInterfaces" script.ts

# Deny all access to system information, disabling permission prompts.
ende run --deny-sys script.ts
```

The interface names accepted by `--allow-sys` correspond to the functions in the
`Ende` namespace that expose host information, such as `hostname`, `osRelease`,
`osUptime`, `loadavg`, `networkInterfaces`, `systemMemoryInfo`, `uid`, `gid`,
`username`, `cpus`, and `homedir`. See
[Ende.SysPermissionDescriptor](/api/ende/~/Ende.SysPermissionDescriptor/) for
the full set of recognized names.

## Subprocesses

Code executing inside of an Ende runtime can not spawn subprocesses by default,
as this would constitute a violation of the principle that code can not escalate
its privileges without user consent.

Ende provides a mechanism for executing subprocesses, but this requires explicit
permission from the user. This is done using the `--allow-run` flag.

Any subprocesses you spawn from your program run independently from the
permissions granted to the parent process. This means the child processes can
access system resources regardless of the permissions you granted to the Ende
process that spawned it. This is often referred to as privilege escalation.

Because of this, make sure you carefully consider if you want to grant a program
`--allow-run` access: it essentially invalidates the Ende security sandbox. If
you really need to spawn a specific executable, you can reduce the risk by
limiting which programs an Ende process can start by passing specific executable
names to the `--allow-run` flag.

Definition: `--allow-run[=<PROGRAM_NAME>...]`

```sh
# Allow running all subprocesses
ende run --allow-run script.ts

# Allow running "curl" and "whoami" subprocesses
ende run --allow-run="curl,whoami" script.ts
```

Sending a signal to your own process does not require `--allow-run`, since it is
equivalent to terminating yourself (like [`Ende.exit`](/api/ende/~/Ende.exit/)).
`Ende.kill(Ende.pid, ...)` and `process.kill(process.pid, ...)` work without the
flag, so tools that re-raise a signal on their own PID (such as `signal-exit`,
used by Vite) no longer force you to grant blanket run access.

> [!CAUTION]
> You probably don't ever want to use `--allow-run=ende` unless the parent
> process has `--allow-all`, as being able to spawn a `ende` process means the
> script can spawn another `ende` process with full permissions.

### Subprocesses with `LD_*` and `DYLD_*` environment variables

Spawning a subprocess with an environment variable whose name starts with `LD_`
(such as `LD_LIBRARY_PATH` or `LD_PRELOAD`) or `DYLD_` (such as
`DYLD_LIBRARY_PATH` or `DYLD_INSERT_LIBRARIES`) requires the unscoped
`--allow-run` flag. A scoped allow list like `--allow-run=curl` is _not_
sufficient, even when the value matches the one Ende was started with:

```ts
// Fails under `--allow-run=echo`, succeeds under `--allow-run` or `--allow-all`.
new Ende.Command("echo", {
  args: ["hello"],
  env: { LD_PRELOAD: "/path/to/lib.so" }
}).outputSync();
```

```console
NotCapable: Requires --allow-run permissions to spawn subprocess with LD_PRELOAD
environment variable. Alternatively, spawn with the environment variable unset.
```

These variables instruct the dynamic linker to load arbitrary shared libraries
into the child process, so they can run code in the subprocess regardless of
which executable you allowed. Restricting them to the unscoped `--allow-run`
keeps a scoped allow list from being silently bypassed. If you don't need them,
the simplest fix is to spawn the subprocess with the variable unset.

Definition: `--deny-run[=<PROGRAM_NAME>...]`

```sh
# Allow running running all programs, but "whoami" and "ps".
ende run --allow-run --deny-run="whoami,ps" script.ts

# Deny all access for spawning subprocessing, disabling
# permission prompts.
ende run --deny-run script.ts
```

## FFI (Foreign Function Interface)

Ende provides an
[FFI mechanism for executing code written in other languages](/runtime/fundamentals/ffi/),
such as Rust, C, or C++, from within an Ende runtime. This is done using the
[`Ende.dlopen`](/api/ende/~/Ende.dlopen/) API, which can load shared libraries
and call functions from them.

By default, executing code can not use the
[`Ende.dlopen`](/api/ende/~/Ende.dlopen/) API, as this would constitute a
violation of the principle that code can not escalate its privileges without
user consent.

[`Ende.dlopen`](/api/ende/~/Ende.dlopen/) requires explicit permission using the
`--allow-ffi` flag. This flag can be specified with a list of files or
directories to allow access to specific dynamic libraries.

_Like subprocesses, dynamic libraries are not run in a sandbox and therefore do
not have the same security restrictions as the Ende process they are being
loaded into. Therefore, use with extreme caution._

Definition: `--allow-ffi[=<PATH>...]`

```sh
# Allow loading dynamic all libraries
ende run --allow-ffi script.ts

# Allow loading dynamic libraries from a specific path
ende run --allow-ffi=./libfoo.so script.ts
```

Definition: `--deny-ffi[=<PATH>...]`

```sh
# Allow loading all dynamic libraries, but ./libfoo.so
ende run --allow-ffi --deny-ffi=./libfoo.so script.ts

# Deny loading all dynamic libraries, disabling permission prompts.
ende run --deny-ffi script.ts
```

## Importing from the Web

Allow importing code from the Web. By default Ende limits hosts you can import
code from. This is true for both static and dynamic imports.

If you want to dynamically import code, either using the `import()` or the
`new Worker()` APIs, additional permissions need to be granted. Loading such
code from the local file system [requires `--allow-read`](#file-system-access).
Ende also allows importing from `http:` and `https:` URLs, but in that case you
will need to specify an explicit `--allow-import` flag:

```sh
# allow importing code from `https://example.com`
$ ende run --allow-import=example.com main.ts
```

By default Ende allows importing sources from following hosts:

- `deno.land`
- `jsr.io`
- `esm.sh`
- `raw.esm.sh`
- `cdn.jsdelivr.net`
- `raw.githubusercontent.com`
- `gist.githubusercontent.com`

Imports are only allowed using HTTPS.

This allow list is applied by default for static imports, and by default to
dynamic imports if the `--allow-import` flag is specified.

```sh
# allow dynamically importing code from `https://deno.land`
$ ende run --allow-import main.ts
```

Note that specifying an allow list for `--allow-import` will override the list
of default hosts.

Use `--deny-import` to block importing from specific hosts, even when they would
otherwise be allowed. Deny flags take precedence over allow flags:

```sh
# allow the default import hosts, except esm.sh
$ ende run --deny-import=esm.sh main.ts
```
