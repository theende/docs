---
last_modified: 2026-10-20
title: "ende uninstall"
oldUrl: /runtime/manual/tools/uninstall/
command: uninstall
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende uninstall"
description: "Remove a dependency from your project or from your global cache"
---

## `ende uninstall [PACKAGES]`

Remove dependencies specified in
[`ende.json`](/runtime/fundamentals/configuration/):

```sh
ende add jsr:@ende/path
Add jsr:@ende/path@^2026.10.15

cat ende.json
{
  "imports": {
    "@ende/path": "jsr:@ende/path@^2026.10.15"
  }
}
```

```sh
ende uninstall @ende/path
Removed @ende/path

cat ende.json
{
  "imports": {}
}
```

> [!TIP]
> You can also use `ende remove` which is an alias to
> `ende uninstall [PACKAGES]`

You can remove multiple dependencies at once:

```sh
ende remove @ende/path @ende/http
Removed @ende/path
Removed @ende/http
```

> [!NOTE]
> While dependencies are removed from `ende.json` they still persist in the
> global cache for future use.

## `ende uninstall --global [SCRIPT_NAME]`

Uninstall `serve`

```sh
ende uninstall --global serve
```

Uninstall `serve` from a specific installation root

```sh
ende uninstall -g --root /usr/local/bin serve
```
