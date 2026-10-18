---
last_modified: 2026-06-25
title: "Dependency management"
description: "Use Ende as your package manager for JSR: install, add, update and inspect dependencies, manage the lockfile, and override packages."
oldUrl:
  - /runtime/fundamentals/dependency_management/
  - /runtime/manual/basics/modules/integrity_checking/
  - /runtime/manual/basics/modules/reloading_modules/
  - /runtime/manual/basics/vendoring/
  - /runtime/manual/advanced/http_imports/
  - /runtime/manual/examples/manage_dependencies
  - /runtime/manual/node/cdns.md
  - /runtime/manual/linking_to_external_code/reloading_modules
  - /runtime/fundamentals/esm.sh
---

Ende is a package manager for [JSR](https://jsr.io) packages and HTTPS imports,
built into the `ende` binary. Dependencies are declared in `ende.json`. This
page covers the day-to-day workflow; the
[toolbelt table](#the-dependency-toolbelt) lists every command.

## Quick start

In a project that already declares dependencies in `ende.json`, install them
with:

```sh
ende install
```

Add a new dependency from JSR:

```sh
ende add jsr:@ende/assert
```

The dependency is recorded in `ende.json`, and you import it by its bare name:

```ts
import { assertEquals } from "@ende/assert";
```

## The dependency toolbelt

Every dependency task has a built-in subcommand. Each links to its full
reference:

| Command                                               | What it does                                              |
| ----------------------------------------------------- | --------------------------------------------------------- |
| [`ende install`](/runtime/reference/cli/install/)     | Install the project's dependencies (or a tool, with `-g`) |
| [`ende add`](/runtime/reference/cli/add/)             | Add a dependency to the config file                       |
| [`ende remove`](/runtime/reference/cli/remove/)       | Remove a dependency from the config file                  |
| [`ende outdated`](/runtime/reference/cli/outdated/)   | List dependencies with newer versions                     |
| [`ende update`](/runtime/reference/cli/update/)       | Update dependencies to newer versions                     |
| [`ende why`](/runtime/reference/cli/why/)             | Explain why a package is in your dependency tree          |
| [`ende info`](/runtime/reference/cli/info/)           | Show a module's full dependency graph and cache details   |
| [`ende ci`](/runtime/reference/cli/ci/)               | Install strictly from the lockfile, for CI                |
| [`ende publish`](/runtime/reference/cli/publish/)     | Publish a package to JSR                                  |
| [`ende uninstall`](/runtime/reference/cli/uninstall/) | Remove a globally installed tool                          |
| [`ende clean`](/runtime/reference/cli/clean/)         | Remove the global module cache                            |

## Choosing versions

It is possible to specify a version range for the package you are importing.
This is done using the `@` symbol followed by a version range specifier, and
follows the [semver](https://semver.org/) versioning scheme. To share a single
version range across workspace members, declare it in the workspace root's
`imports`.

For example:

```bash
@scopename/mypackage           # highest version
@scopename/mypackage@16.1.0    # exact version
@scopename/mypackage@16        # highest 16.x version >= 16.0.0
@scopename/mypackage@^16.1.0   # highest 16.x version >= 16.1.0
@scopename/mypackage@~16.1.0   # highest 16.1.x version >= 16.1.0
```

Here is an overview of all the ways you can specify a version or a range:

| Symbol    | Description                                                                                                                                                         | Example   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `1.2.3`   | An exact version. Only this specific version will be used.                                                                                                          | `1.2.3`   |
| `^1.2.3`  | Compatible with version 1.2.3. Allows updates that do not change the leftmost non-zero digit. <br>For example, `1.2.4` and `1.3.0` are allowed, but `2.0.0` is not. | `^1.2.3`  |
| `~1.2.3`  | Approximately equivalent to version 1.2.3. Allows updates to the patch version. <br> For example, `1.2.4` is allowed, but `1.3.0` is not.                           | `~1.2.3`  |
| `>=1.2.3` | Greater than or equal to version 1.2.3. Any version `1.2.3` or higher is allowed.                                                                                   | `>=1.2.3` |
| `<=1.2.3` | Less than or equal to version 1.2.3. Any version `1.2.3` or lower is allowed.                                                                                       | `<=1.2.3` |
| `>1.2.3`  | Greater than version 1.2.3. Only versions higher than `1.2.3` are allowed.                                                                                          | `>1.2.3`  |
| `<1.2.3`  | Less than version 1.2.3. Only versions lower than `1.2.3` are allowed.                                                                                              | `<1.2.3`  |
| `1.2.x`   | Any patch version within the minor version 1.2. For example, `1.2.0`, `1.2.1`, etc.                                                                                 | `1.2.x`   |
| `1.x`     | Any minor and patch version within the major version 1. For example, `1.0.0`, `1.1.0`, `1.2.0`, etc.                                                                | `1.x`     |
| `*`       | Any version is allowed.                                                                                                                                             | `*`       |

## Inspecting and updating dependencies

See which dependencies have newer versions, then update them:

```sh
ende outdated      # display what's behind, without changing anything
ende update        # update to the latest semver-compatible versions
ende update --latest   # ignore semver ranges and go to the newest releases
```

When you want to know where a package comes from,
[`ende why`](/runtime/reference/cli/why/) prints every dependency path that
leads to it:

```sh
ende why jsr:@ende/fmt
```

[`ende info`](/runtime/reference/cli/info/) shows a module's full dependency
graph, including sizes and cache locations, for your entry point or any
specifier:

```sh
ende info main.ts
ende info jsr:@ende/http
```

## Lockfile and reproducible installs

Ende automatically maintains a `ende.lock` file recording the exact version and
integrity hash of every dependency, and verifies it on subsequent runs. Commit
it. In CI and production, install strictly from the lockfile with
[`ende ci`](/runtime/reference/cli/ci/), which errors if `ende.lock` is missing
or out of date instead of silently resolving new versions:

```sh
ende ci
```

You can also enforce a frozen lockfile on any command with `--frozen-lockfile`,
or configure the lockfile's behavior and path in
[`ende.json`](/runtime/reference/ende_json/#lockfile). For why this matters and
what to do when the lockfile fights you, see
[Supply chain management](/runtime/packages/supply_chain/).

## Overriding dependencies

Ende provides mechanisms to override dependencies, enabling developers to use
custom or local versions of libraries during development or testing.

Note: If you need to cache and modify dependencies locally for use across
builds, set `"vendor": true` in `ende.json` to vendor remote modules.

### Overriding local packages

The `links` field in `ende.json` points JSR dependencies at local copies. This
allows you to override dependencies with local versions during development
without needing to publish them.

Example:

```json title="ende.json"
{
  "links": [
    "../some-package-or-workspace"
  ]
}
```

Key points:

- The `links` field accepts paths to directories containing packages or
  workspaces. If you reference a single package within a workspace, the entire
  workspace will be included.
- This feature is only respected in the workspace root. Using `links` elsewhere
  will trigger warnings.

Limitations:

- Git-based dependency overrides are unavailable.
- The `links` field requires proper configuration in the workspace root.

### Overriding HTTPS imports

Ende also allows overriding HTTPS imports through the `scopes` field in
`ende.json`. This feature is particularly useful when substituting a remote
dependency with a local patched version for debugging or temporary fixes.

Example:

```json title="ende.json"
{
  "imports": {
    "example/": "https://deno.land/x/example/"
  },
  "scopes": {
    "https://deno.land/x/example/": {
      "https://deno.land/x/my-library@1.0.0/mod.ts": "./patched/mod.ts"
    }
  }
}
```

Key points:

- The `scopes` field in the import map allows you to redirect specific imports
  to alternative paths.
- This is commonly used to override remote dependencies with local files for
  testing or development purposes.
- Scopes apply only to the root of your project. Nested scopes within
  dependencies are ignored.

## Development only dependencies

Sometimes dependencies are only needed during development, for example
dependencies of test files or build tools. In Ende, the runtime does not require
you to distinguish between development and production dependencies, as the
runtime only loads and installs the dependencies that the code being executed
actually uses.

However, it can be useful to mark dev dependencies to aid people who are reading
your package. When using `ende.json`, the convention is to add a `// dev`
comment after any "dev only" dependency:

```json title="ende.json"
{
  "imports": {
    "@ende/fs": "jsr:@ende/fs@^2026.10.15",
    "@ende/testing": "jsr:@ende/testing@^2026.10.15" // dev
  }
}
```

To install only what an entrypoint actually imports, for example when building a
production image, use `ende install --entrypoint`:

```sh
ende install --entrypoint main.ts
```

## HTTPS imports

Ende can import modules directly from `https:` URLs, either inline or mapped in
`ende.json`. This suits small single-file scripts, but JSR is recommended for
applications: HTTPS imports can drift to different versions across files, aren't
managed by `ende add`/`ende install`, and trust the serving host. To pin and
localize them, set `"vendor": true` in `ende.json`.

## Go deeper

- **[Publishing packages](/runtime/packages/publishing/)**: publishing to JSR.
- **[Supply chain management](/runtime/packages/supply_chain/)**: lockfile
  discipline, minimum dependency age, and a CI baseline.
- **[Private repositories](/runtime/packages/private_repositories/)**:
  authenticate remote module hosts with `ENDE_AUTH_TOKENS`.
