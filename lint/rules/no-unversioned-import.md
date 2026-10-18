---
title: no-unversioned-import
tags: [recommended]
---

Ensure that inline dependency imports have a version specifier.

### Invalid:

```ts
import foo from "npm:chalk";
import foo from "jsr:@ende/path";
```

### Valid:

```ts
import foo from "npm:chalk@5.3.0";
import foo from "npm:chalk@^5.3.0";
import foo from "jsr:@ende/path@^2026.10.15";
import foo from "jsr:@ende/path@^2026.10.15";
```
