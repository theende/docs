---
last_modified: 2026-10-20
title: "ende install"
oldUrl:
  - /runtime/manual/tools/script_installer/
  - /runtime/reference/cli/script_installer/
  - /runtime/manual/tools/cache/
  - /runtime/reference/cli/cache/
command: install
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende install"
description: "Install and cache dependencies for your project"
---

`ende install` installs dependencies and caches them for your project. For more
on how Ende handles modules, see
[Modules and dependencies](/runtime/fundamentals/modules/).

## Examples

### ende install

Use this command to install all dependencies defined in
[`ende.json`](/runtime/fundamentals/configuration/). They are installed in the
global cache.

### ende install [PACKAGES]

Use this command to install particular packages and add them to `ende.json`.

```sh
ende install jsr:@ende/testing jsr:@ende/path
```

> [!TIP]
> You can also use `ende add` which is an alias to `ende install [PACKAGES]`

### ende install --entrypoint [FILES]

Use this command to install all dependencies that are used in the provided files
and their dependencies.

This is particularly useful if you use `jsr:`, `http:` or `https:` specifiers in
your code and want to cache all the dependencies before deploying your project.

```js title="main.js"
import * as colors from "jsr:@ende/fmt/colors";
import { join } from "jsr:@ende/path";
```

```sh
ende install -e main.js
Download jsr:@ende/fmt
Download jsr:@ende/path
```

### ende install --global [PACKAGE_OR_URL]

Use this command to install the provided package or script as a globally
available binary on your system.

This command creates a thin, executable shell script which invokes `ende` using
the specified CLI flags and main module. It is placed in the installation root.

Example:

```sh
ende install --global --allow-net --allow-read jsr:@ende/http/file-server
Download jsr:@ende/http/file-server...

✅ Successfully installed file-server.
/Users/ende/.ende/bin/file-server
```

To change the executable name, use `-n`/`--name`:

```sh
ende install -g -N -R -n serve jsr:@ende/http/file-server
```

The executable name is inferred by default:

- Attempt to take the file stem of the URL path. The above example would become
  'file-server'.
- If the file stem is something generic like 'main', 'mod', 'index' or 'cli',
  and the path has no parent, take the file name of the parent path. Otherwise
  settle with the generic name.
- If the resulting name has an '@...' suffix, strip it.

To change the installation root, use `--root`:

```sh
ende install -g -N -R --root /usr/local/bin jsr:@ende/http/file-server
```

The installation root is determined, in order of precedence:

- `--root` option
- `ENDE_INSTALL_ROOT` environment variable
- `$HOME/.ende`

Executables are placed in the `bin` subdirectory of the installation root,
unless the root path already ends with `bin`, in which case it is used directly.
The resulting directory must be added to the path manually if required.

```sh
echo 'export PATH="$HOME/.ende/bin:$PATH"' >> ~/.bashrc
```

You must specify permissions that will be used to run the script at installation
time.

```sh
ende install -g -N -R jsr:@ende/http/file-server -- -p 8080
```

The above command creates an executable called `file_server` that runs with
network and read permissions and binds to port 8080.

For good practice, use the
[`import.meta.main`](/runtime/tutorials/module_metadata/) idiom to specify the
entry point in an executable script.

Example:

```ts
// https://example.com/awesome/cli.ts
async function myAwesomeCli(): Promise<void> {
  // -- snip --
}

if (import.meta.main) {
  myAwesomeCli();
}
```

When you create an executable script make sure to let users know by adding an
example installation command to your repository:

```sh
# Install using ende install

ende install -n awesome_cli https://example.com/awesome/cli.ts
```

### ende install --global --compile [PACKAGE_OR_URL]

Use this command to compile a package or script into a standalone,
self-contained binary. The resulting executable can be distributed and run
without requiring Ende to be installed on the target system.

```sh
ende install --global --compile -A -n satz jsr:@ende/satz/cli
```

This combines the behavior of [`ende compile`](/runtime/reference/cli/compile/)
with global installation — producing a native binary placed in the installation
root (same as `--global` without `--compile`).

## --quiet flag

The `--quiet` flag suppresses diagnostic output when installing dependencies.
When used with `ende install`, it will hide progress indicators, download
information, and success messages.

```sh
ende install --quiet jsr:@ende/http/file-server
```

This is useful for scripting environments or when you want cleaner output in CI
pipelines.

## Uninstall

You can uninstall dependencies or binary script with `ende uninstall` command:

```sh
ende uninstall express
Removed express
```

```sh
ende uninstall -g file-server
deleted /Users/ende/.ende/bin/file-server
✅ Successfully uninstalled file-server
```

See [`ende uninstall` page for more details](/runtime/reference/cli/uninstall/).
