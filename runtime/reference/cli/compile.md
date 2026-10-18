---
last_modified: 2026-08-06
title: "ende compile"
oldUrl:
  - /runtime/manual/tools/compile/
  - /runtime/manual/tools/compiler/
  - /runtime/reference/cli/compiler/
command: compile
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende compile"
description: "Compile your code into a standalone executable"
---

## Flags

As with [`ende install`](/runtime/reference/cli/install/), the runtime flags
used to execute the script must be specified at compilation time. This includes
permission flags.

```sh
ende compile --allow-read --allow-net jsr:@ende/http/file-server
```

[Script arguments](/runtime/run/#passing-script-arguments) can be partially
embedded.

```sh
ende compile --allow-read --allow-net jsr:@ende/http/file-server -p 8080

./file_server --help
```

## Watch mode

Pass `--watch` to rebuild the executable whenever a file in the compile graph
changes:

```sh
ende compile --watch main.ts
```

Use `--watch-exclude` to keep specific paths from triggering a rebuild, and
`--no-clear-screen` to preserve the terminal output between rebuilds:

```sh
ende compile --watch --watch-exclude=./dist --no-clear-screen main.ts
```

## Cross Compilation

You can cross-compile binaries for other platforms by using the `--target` flag.

```
# Cross compile for Apple Silicon
ende compile --target aarch64-apple-darwin main.ts

# Cross compile for Windows with an icon
ende compile --target x86_64-pc-windows-msvc --icon ./icon.ico main.ts
```

### Supported Targets

Ende supports cross compiling to all targets regardless of the host platform.

| OS      | Architecture | Target                      |
| ------- | ------------ | --------------------------- |
| Windows | x86_64       | `x86_64-pc-windows-msvc`    |
| Windows | ARM64        | `aarch64-pc-windows-msvc`   |
| macOS   | x86_64       | `x86_64-apple-darwin`       |
| macOS   | ARM64        | `aarch64-apple-darwin`      |
| Linux   | x86_64       | `x86_64-unknown-linux-gnu`  |
| Linux   | ARM64        | `aarch64-unknown-linux-gnu` |

`aarch64-pc-windows-msvc` (Windows on ARM) is supported .

## The endert binary

`ende compile` embeds your program into `endert` ("Ende runtime"): a stripped
build of Ende that contains only what's needed to run a compiled program, with
none of the tooling subcommands. Using `endert` as the base instead of the full
`ende` binary is what keeps compiled executables smaller.

The first time you compile for a given Ende version and target, Ende downloads
the matching `endert-<target>.zip` from `dl.ende.sh` and caches it in
`ENDE_DIR`. This is also how cross-compilation works: compiling with `--target`
fetches that platform's `endert`. Subsequent compiles reuse the cached binary
and work offline.

To use a custom or locally built runtime as the base, set the `ENDERT_BIN`
environment variable to its path. Ende also picks up a `endert` binary placed
next to the `ende` executable.

## Choosing a JavaScript engine

> [!CAUTION]
> `--engine quickjs` is experimental and subject to change.

Compiled binaries run on V8 by default. The `--engine` flag lets you build
against QuickJS instead, which produces a smaller executable:

```sh
# Default, same as omitting the flag
ende compile --engine v8 main.ts

# Build a binary that runs on QuickJS
ende compile --engine quickjs main.ts
```

The same flag is available on [`ende desktop`](/runtime/desktop/distribution/),
where it selects the engine embedded in the app's runtime library.

Trade-offs to weigh before shipping a QuickJS binary:

- **Security updates.** The QuickJS backend does not receive the same security
  updates as V8. Don't use it for programs that run untrusted input.
- **Performance.** QuickJS is an interpreter with no JIT, so compute-heavy code
  runs slower than on V8. Startup and memory use are lower.
- **Maturity.** The backend is experimental; behavior differences from V8 are
  possible, so test your program with the engine you intend to ship.

Each engine has its own prebuilt runtime: with `--engine quickjs`, Ende
downloads `endert-quickjs-<target>.zip` (or `libendert-quickjs-<target>.zip` for
`ende desktop`) instead of the default `endert-<target>.zip`. Both variants are
published for every [supported target](#supported-targets), so cross-compilation
works the same way. If you override the base runtime with `ENDERT_BIN` (or a
`endert` binary next to `ende`), that binary is used as-is: `--engine` is then
ignored and Ende prints a warning.

## Icons

It is possible to add an icon to the executable by using the `--icon` flag when
targeting Windows. The icon must be in the `.ico` format.

```
ende compile --icon icon.ico main.ts

# Cross compilation with icon
ende compile --target x86_64-pc-windows-msvc --icon ./icon.ico main.ts
```

## Dynamic Imports

By default, statically analyzable dynamic imports (imports that have the string
literal within the `import("...")` call expression) will be included in the
output.

```ts
// calculator.ts and its dependencies will be included in the binary
const calculator = await import("./calculator.ts");
```

But non-statically analyzable dynamic imports won't:

```ts
const specifier = condition ? "./calc.ts" : "./better_calc.ts";
const calculator = await import(specifier);
```

To include non-statically analyzable dynamic imports, specify an
`--include <path>` flag.

```sh
ende compile --include calc.ts --include better_calc.ts main.ts
```

## Including Data Files or Directories

You can include files or directories in the executable by specifying them via
the `--include <path>` flag.

```sh
ende compile --include names.csv --include data main.ts
```

Then read the file relative to the directory path of the current module via
`import.meta.dirname`:

```ts
// main.ts
const names = Ende.readTextFileSync(import.meta.dirname + "/names.csv");
const dataFiles = Ende.readDirSync(import.meta.dirname + "/data");

// use names and dataFiles here
```

Note this currently only works for files on the file system and not remote
files.

`--include` treats embedded `.js` and `.ts` files as module-graph roots, so it
resolves and transpiles them. To embed files exactly as they are, without any
module resolution, use `--include-as-is` instead. This is the right choice for
pre-built frontend bundles (for example Vite or webpack output) that are already
processed and would fail to resolve as Ende modules:

```sh
ende compile --include-as-is ./dist main.ts
```

### Configuring `include` / `exclude` in `ende.json`

The `--include` and `--exclude` paths can be set declaratively in `ende.json` so
you don't have to repeat them on every `ende compile` invocation:

```jsonc title="ende.json"
{
  "compile": {
    "include": ["names.csv", "data", "worker.ts"],
    "exclude": ["data/secrets", "**/*.test.ts"]
  }
}
```

CLI flags are merged with the config: `--include` and `--exclude` add to the
lists in `ende.json` rather than replacing them. See the
[Compile config](/runtime/reference/ende_json/#compile-config) section in the
configuration guide for more details, including how to declare `permissions` on
the same block.

## Workers

Similarly to non-statically analyzable dynamic imports, code for
[workers](../web_platform_apis/#web-workers) is not included in the compiled
executable by default. There are two ways to include workers:

1. Use the `--include <path>` flag to include the worker code.

```sh
ende compile --include worker.ts main.ts
```

2. Import worker module using a statically analyzable import.

```ts
// main.ts
import "./worker.ts";
```

```sh
ende compile main.ts
```

## Self-Extracting Executables

By default, compiled executables serve embedded files from an in-memory virtual
file system. The `--self-extracting` flag changes this behavior so that the
binary extracts all embedded files to disk on first run and uses real file
system operations at runtime.

```sh
ende compile --self-extracting main.ts
```

This is useful for scenarios where code needs real files on disk, such as native
addons or native code that reads relative files.

The extraction directory is chosen in order of preference:

1. `<exe_dir>/.<exe_name>/<hash>/` (next to the compiled binary)
2. Platform data directory fallback:
   - Linux: `$XDG_DATA_HOME/<exe_name>/<hash>` or
     `~/.local/share/<exe_name>/<hash>`
   - macOS: `~/Library/Application Support/<exe_name>/<hash>`
   - Windows: `%LOCALAPPDATA%\<exe_name>\<hash>`

Files are only extracted once — subsequent runs reuse the extracted directory if
it already exists and the hash matches.

### Trade-offs

Self-extracting mode enables broader compatibility, but comes with some
trade-offs:

- **Initial startup cost**: The first run takes longer due to file extraction.
- **Disk usage**: Extracted files take up additional space on disk.
- **Memory usage**: Higher memory usage since embedded content can no longer be
  referenced as static data.
- **Tamper risk**: Users or other code can modify the extracted files on disk.

## Code Signing

### macOS

By default, on macOS, the compiled executable will be signed using an ad-hoc
signature which is the equivalent of running `codesign -s -`:

```sh
ende compile -o main main.ts
codesign --verify -vv ./main

./main: valid on disk
./main: satisfies its Designated Requirement
```

You can specify a signing identity when code signing the executable just like
you would do with any other macOS executable:

```sh
codesign -s "Developer ID Application: Your Name" ./main
```

Refer to the
[official documentation](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
for more information on codesigning and notarization on macOS.

### Windows

On Windows, the compiled executable can be signed using the `SignTool.exe`
utility.

```sh
ende compile -o main.exe main.ts
signtool sign /fd SHA256 main.exe
```

## Persistent storage in executables

A compiled binary is treated as a standalone application, so origin-bound
storage persists across runs in the platform's application data directory
(`%LOCALAPPDATA%` on Windows, `~/Library/Application Support` on macOS,
`$XDG_DATA_HOME` on Linux):

[`localStorage`](/runtime/reference/web_platform_apis/#web-storage) and the
[Web Cache API](/api/web/~/Cache/) read and write to that directory.

Each compiled app gets its own location derived from its identity, so separate
apps do not share storage. That identity comes from the `--app-name` flag, which
is baked in at compile time and falls back to the output file name when omitted:

```sh
ende compile --app-name my-app main.ts
```

Because the name (not the module path) drives the directory, the store stays
stable across runs even if you rename the binary, two binaries built with the
same `--app-name` share a store, and differently named apps stay isolated.
Recompiling with a different `--app-name` starts a fresh store.
