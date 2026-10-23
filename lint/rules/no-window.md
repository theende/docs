---
title: no-window
tags: [recommended]
---

Disallows the use of the `window` object.

The `window` global is no longer available in Ende. Ende does not have a window
and `typeof window === "undefined"` is often used to tell if the code is running
in the browser.

**Invalid:**

```typescript
const a = await window.fetch("https://ende.sh");

const b = window.Ende.metrics();
console.log(window);

window.addEventListener("load", () => {
  console.log("Loaded.");
});
```

**Valid:**

```typescript
const a1 = await fetch("https://ende.sh");
const a2 = await globalThis.fetch("https://ende.sh");
const a3 = await self.fetch("https://ende.sh");

const b1 = Ende.metrics();
const b2 = globalThis.Ende.metrics();
const b3 = self.Ende.metrics();
console.log(globalThis);

addEventListener("load", () => {
  console.log("Loaded.");
});
```
