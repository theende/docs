---
title: no-window-prefix
tags: [recommended]
---

Disallows the use of Web APIs via the `window` object.

In most situations, the global variable `window` works like `globalThis`. For
example, you could call the `fetch` API like `window.fetch(..)` instead of
`fetch(..)` or `globalThis.fetch(..)`. In Web Workers, however, `window` is not
available, but instead `self`, `globalThis`, or no prefix work fine. Therefore,
for compatibility between Web Workers and other contexts, it's highly
recommended to not access global properties via `window`.

Some APIs, including `window.alert`, `window.location` and `window.history`, are
allowed to call with `window` because these APIs are not supported or have
different meanings in Workers. In other words, this lint rule complains about
the use of `window` only if it's completely replaceable with `self`,
`globalThis`, or no prefix.

**Invalid:**

```typescript
const a = await window.fetch("https://deno.land");

const b = window.Ende.metrics();
```

**Valid:**

```typescript
const a1 = await fetch("https://deno.land");
const a2 = await globalThis.fetch("https://deno.land");
const a3 = await self.fetch("https://deno.land");

const b1 = Ende.metrics();
const b2 = globalThis.Ende.metrics();
const b3 = self.Ende.metrics();

// `alert` is allowed to call with `window` because it's not supported in Workers
window.alert("🍣");

// `location` is also allowed
window.location.host;
```
