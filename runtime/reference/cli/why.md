---
last_modified: 2026-10-20
title: "ende why"
command: why
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende why"
description: "Explain why a package is installed by showing its dependency chains"
---

The `ende why` command explains why a particular package is in your dependency
tree by printing every path from your project's direct dependencies down to the
queried package. It reads the
[lockfile](/runtime/packages/#lockfile-and-reproducible-installs), so it works
without touching the network.

It pairs with [`ende add`](/runtime/reference/cli/add/) and
[`ende remove`](/runtime/reference/cli/remove/): once you know _why_ a
transitive dependency is in your tree, you can decide whether to remove a direct
dependency that's pulling it in.

## Usage

```sh
ende why <package>
```

`<package>` is a JSR package name, optionally pinned with `@<version>`:

| Form                    | Meaning                                   |
| ----------------------- | ----------------------------------------- |
| `@ende/path`            | every version of `@ende/path` in the tree |
| `@ende/path@2026.10.15` | only the `2026.10.15` version             |
| `jsr:@ende/path`        | the same package by its full specifier    |

## Examples

### Multiple paths to a single package

```sh
$ ende why @ende/path
@ende/path@2026.10.15
  jsr:@ende/fs@^2026.10.15 > @ende/path@2026.10.15
  jsr:@ende/http@^2026.10.15 > @ende/path@2026.10.15
```

When the same package appears at multiple versions, each is shown in its own
block — handy for diagnosing duplicated dependencies.

### Workspace members

In a [workspace](/runtime/fundamentals/workspaces/), each member's direct
dependencies appear as roots in the output, so a transitive dep introduced by
one package is clearly attributable to that package.

## Exit codes

| Exit code | Meaning                                                                                |
| --------- | -------------------------------------------------------------------------------------- |
| `0`       | The package was found in the resolved tree — at least one dependency path was printed. |
| Non-zero  | The package is not in the resolved tree, or the argument is malformed.                 |

The non-zero exit is the easy way to gate CI on a package _not_ being pulled in.
For example, to assert that `@acme/legacy` never enters your tree:

```sh
# fails the build if @acme/legacy is reachable
! ende why @acme/legacy
```

## Common pitfalls

- **"Package not found" but you _know_ it's used at runtime.** `ende why`
  reports what's _in the lockfile_, not what's _imported by your code_. If
  you've added a `jsr:` specifier but haven't run `ende install` (or any
  subcommand that resolves), the package won't appear yet.
- **Resolution depends on workspace mode.** A package only consumed by one
  workspace member may not show up when run from a different member's directory
  if your workspace setup uses per-member lockfiles. Run `ende why` from the
  workspace root for the complete picture.
