---
title: no-sync-fn-in-async-fn
tags: []
---

Disallow sync function inside async function.

Using sync functions like `Ende.readTextFileSync` blocks the ende event loop so
it's not recommended to use it inside of an async function, because it stops
progress of all other async tasks.

**Invalid:**

```javascript
async function foo() {
  Ende.readTextFileSync("");
}

const fooFn = async function foo() {
  Ende.readTextFileSync("");
};

const fooFn = async () => {
  Ende.readTextFileSync("");
};
```

**Valid:**

```javascript
async function foo() {
  await Ende.readTextFile("");
}

function foo() {
  Ende.readTextFileSync("");
}

const fooFn = function foo() {
  Ende.readTextFileSync("");
};

const fooFn = () => {
  Ende.readTextFileSync("");
};
```
