---
last_modified: 2026-10-20
title: "Add and remove dependencies"
description: "Manage project dependencies with ende add and ende remove: JSR packages, version pinning, and aliasing packages in your import map."
url: /examples/add_remove_dependencies_tutorial/
---

Ende manages dependencies through your project’s `ende.json` import map. The
`ende add` and `ende remove` commands edit it for you, and `ende install` with a
package argument does the same.

## Adding packages

Use the `jsr:` prefix for [JSR](https://jsr.io) packages:

```sh
$ ende add jsr:@ende/path jsr:@ende/fmt
Add jsr:@ende/path@^2026.10.15
Add jsr:@ende/fmt@^2026.10.15
```

`ende install jsr:@ende/path` is equivalent: it records the dependency the same
way and installs everything in one step.

Both end up in the `imports` map of `ende.json`, with a caret range:

```json title="ende.json"
{
  "imports": {
    "@ende/fmt": "jsr:@ende/fmt@^2026.10.15",
    "@ende/path": "jsr:@ende/path@^2026.10.15"
  }
}
```

Import them by their bare name anywhere in the project:

```ts
import { join } from "@ende/path";
import { green } from "@ende/fmt/colors";
```

To pin an exact version instead of a caret range, pass `--save-exact`. To
request a specific version, spell it out:

```sh
ende add --save-exact jsr:@ende/path@2026.10.15
```

## Aliasing a package

The import map maps any name you like to any specifier. Aliases are also the way
to use two versions of one package side by side:

```json title="ende.json"
{
  "imports": {
    "@ende/path": "jsr:@ende/path@^2026.10.15",
    "path-old": "jsr:@ende/path@2026.10.14"
  }
}
```

For overriding a dependency with a local copy, or remapping your own imports,
see [Overriding dependencies](/runtime/packages/#overriding-dependencies) and
[Re-map import paths](/examples/import_maps_tutorial/).

## Removing packages

`ende remove` deletes the entry by its import-map name (not the package name, if
they differ):

```sh
$ ende remove @ende/fmt
Removed @ende/fmt
```

The lockfile keeps records of removed packages until you run `ende install`
again; see
[the lockfile documentation](/runtime/packages/#lockfile-and-reproducible-installs)
for how `ende.lock` tracks all of this.
