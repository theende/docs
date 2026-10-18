---
title: no-import-prefix
tags: [workspace]
---

Ensure that all dependencies are declared in either `ende.json` or
`package.json`.

This promotes better dependency management and makes it easier to track and
update dependencies. It also helps Ende purge the lockfile when removing a
dependency.

### Invalid:

```ts
import foo from "https://deno.land/std/path/mod.ts";
import foo from "jsr:@ende/path@^2026.10.15";
import foo from "npm:preact@10";
```

### Valid:

```ts
import foo from "@ende/path";
```

With a corresponding entry in the `ende.json` or `package.json` file:

```jsonc title="ende.json"
{
  "imports": {
    "@ende/path": "jsr:@ende/path@^2026.10.15"
  }
}
```
