---
last_modified: 2026-06-17
title: "ende unlink"
command: unlink
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende unlink"
description: "Unlink a local JSR package from the current project"
---

The `ende unlink` command removes a local package link created with
[`ende link`](/runtime/reference/cli/link/), so imports resolve to the published
registry version again. It edits the
[`links`](/runtime/reference/ende_json/#overriding-packages) array in the
nearest `ende.json` for you.

## Removing a link

You can remove an entry by its path or by the linked package's JSR name:

```sh
# By the path you linked
ende unlink ../my-local-pkg

# By the package's JSR name
ende unlink @scope/name
```

Path arguments resolve relative to the current working directory, the same way
[`ende link`](/runtime/reference/cli/link/) resolves them, so
`ende unlink
../pkg` matches an entry created by `ende link ../pkg` from the
same directory. When the `links` array becomes empty it is removed entirely.

If no argument matches a linked entry, `ende unlink` exits with a non-zero
status rather than reporting success, so a mistyped path or name is detectable
in scripts and CI. It never creates a `ende.json`: if there is none, there are
no linked packages to remove.
