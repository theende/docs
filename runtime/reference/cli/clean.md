---
last_modified: 2025-03-10
title: "ende clean"
command: clean
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende clean"
description: "Remove cached dependencies for a clean start"
---

`ende clean` removes Ende's global module cache directory. See
[Modules](/runtime/fundamentals/modules/) for more information about how Ende
caches dependencies.

## Basic usage

```sh
ende clean
```

## Dry run

Preview what would be deleted without actually removing anything:

```sh
ende clean --dry-run
```

## Keeping what a project still needs

Use `--except` with one or more entry points to remove everything from the cache
except the data those files need:

```sh
ende clean --except main.ts
```

## When to use this

Use `ende clean` when you need to:

- Resolve issues caused by corrupted or stale cached modules
- Free disk space used by cached dependencies
