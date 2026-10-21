---
last_modified: 2026-10-20
title: "ende x"
command: x
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende x"
description: "Run a package from JSR or a URL with Ende."
---

`ende x` runs a package from JSR, or a script from a URL, without installing it
permanently.

## Installing the `dx` alias

For convenience, you can install `ende x` as a standalone `dx` binary that runs
with all permissions by default:

```sh
ende x --install-alias
```

Then use it directly:

```sh
dx jsr:@ende/http/file-server
```

You can customize the alias name:

```sh
ende x --install-alias=endex
```

## Basic usage

Run a JSR package:

```sh
ende x jsr:@ende/http/file-server
```

## How it works

`ende x` downloads the package to the global cache (if not already cached),
resolves the package's binary entry point, and executes it. The package is not
added to your project's [`ende.json`](/runtime/fundamentals/configuration/).

## Authoring a package that runs with `ende x`

JSR packages are run by pointing `ende x` at an export that executes when
imported, for example `ende x jsr:@ende/http/file-server`. To make your own JSR
package runnable, expose the entry point as a module export (guard top-level
side effects with `import.meta.main` so the module can still be imported as a
library), then document the subpath users should run, such as
`ende x jsr:@you/tool/cli`.

If you want the tool available as a permanent command rather than run on demand,
install it with [`ende install`](/runtime/reference/cli/install/) or compile it
to a standalone executable. See [Build CLI apps](/runtime/cli_apps/) for the
full workflow, and [Publishing modules](/runtime/packages/publishing/) for
publishing to JSR.

## Permissions

The executed package runs with the permissions you specify:

```sh
ende x --allow-read --allow-net jsr:@ende/http/file-server .
```

Or grant all permissions:

```sh
ende x -A jsr:@ende/http/file-server
```
