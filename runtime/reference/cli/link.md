---
last_modified: 2026-06-25
title: "ende link"
command: link
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende link"
description: "Link a local JSR package into the current project for development"
---

The `ende link` command points your project at a local copy of a JSR package so
you can develop against it in place of the published version. It is the
command-line equivalent of editing the
[`links`](/runtime/reference/ende_json/#overriding-packages) array in
`ende.json` by hand.

## Linking a package

Pass the path to a local package directory:

```sh
ende link ../my-local-pkg
```

The target must be a directory containing an `ende.json` with a `name` field, so
Ende knows which package it stands in for. Ende appends the relative path to the
`links` array in the nearest `ende.json` (creating the array if it does not
exist) and then installs dependencies. The linked package is importable by its
bare name, just like a workspace member, so no `imports` entry is added.

Linking the same path again has no additional effect. You can link several
packages in one command:

```sh
ende link ../pkg-a ../pkg-b
```

## Removing a link

Use [`ende unlink`](/runtime/reference/cli/unlink/) to stop using the local
copy:

```sh
ende unlink ../my-local-pkg
```
