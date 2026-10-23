---
title: no-unversioned-import
tags: [recommended]
---

Ensure that inline dependency imports have a version specifier.

### Invalid:

```ts
import foo from "jsr:@ende/path";
```

### Valid:

```ts
import foo from "jsr:@ende/path@^2026.10.15";
import foo from "jsr:@ende/path@^2026.10.15";
```
