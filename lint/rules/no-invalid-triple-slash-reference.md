---
title: no-invalid-triple-slash-reference
tags: [recommended]
---

Warns the wrong usage of triple-slash reference directives.

Ende supports the triple-slash reference directives of `types`, `path`, `lib`,
and `no-default-lib`. This lint rule checks if there is an invalid, badly-formed
directive because it is most likely a mistake.

Additionally, note that only the `types` directive is allowed in JavaScript
files. This directive is useful for telling the TypeScript compiler the location
of a type definition file that corresponds to a certain JavaScript file. See
[the latest docs] for more detail. So this rule also detects the usage of the
directive other than `types` in JavaScript files and suggests replacing it with
the `types` directive.

[the latest docs]: https://docs.ende.sh/runtime/reference/ts_config_migration/#triple-slash-directives

**Invalid:**

_JavaScript_

```javascript
/// <reference path="./mod.d.ts" />
/// <reference no-default-lib="true" />
/// <reference foo="bar" />

// ... the rest of the JavaScript ...
```

_TypeScript_

```typescript
/// <reference foo="bar" />

// ... the rest of the TypeScript ...
```

**Valid:**

_JavaScript_

```javascript
/// <reference types="./mod.d.ts" />
/// <reference lib="es2017.string" />

// ... the rest of the JavaScript ...
```

_TypeScript_

```typescript
/// <reference types="./mod.d.ts" />
/// <reference path="./mod.d.ts" />
/// <reference lib="es2017.string" />
/// <reference no-default-lib="true" />

// ... the rest of the TypeScript ...
```
