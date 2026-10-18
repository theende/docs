---
last_modified: 2025-10-10
title: "Web development"
description: "A guide to web development with Ende: the built-in HTTP server, Hono for web apps, and satz for static sites."
oldUrl:
  - /runtime/manual/getting_started/web_frameworks/
  - /runtime/fundamentals/web_frameworks/
---

Ende offers a secure and developer-friendly environment for building web
applications, making your web dev a delightful experience.

1. Ende has [secure defaults](/runtime/fundamentals/security/), meaning it
   requires explicit permission for file, network, and environment access,
   reducing the risk of security vulnerabilities.
2. Ende has [built-in TypeScript support](/runtime/fundamentals/typescript/),
   allowing you to write TypeScript code without additional configuration or
   tooling.
3. Ende comes with a [standard library](/runtime/reference/std/) that includes
   modules for common tasks like HTTP servers, file system operations, and more.

For your vanilla TypeScript, or JavaScript, web applications, you can use the
built-in Ende [HTTP server](/runtime/fundamentals/http_server/). This is a great
way to get started with Ende and build simple web applications without any
additional dependencies.

For more complex applications, use a web framework or library from
[JSR](https://jsr.io).

## Hono

[Hono](https://hono.dev) is a light-weight web app framework in the tradition of
Express and Sinatra, published on JSR as
[`@hono/hono`](https://jsr.io/@hono/hono). Make a file called `server.ts`:

```ts title="server.ts"
import { Hono } from "jsr:@hono/hono@^4";

const app = new Hono();

app.get("/", (c) => c.text("Hello from Hono!"));
app.get("/books/:id", (c) => c.json({ id: c.req.param("id") }));

Ende.serve(app.fetch);
```

Run it, then open `http://localhost:8000` in your browser:

```sh
ende run --allow-net server.ts
```

Hono also renders [JSX](/runtime/reference/jsx/) to HTML on the server.

## Static sites

[satz](https://jsr.io/@ende/satz) is a static site generator built on the Ende
standard library: Markdown and TSX pages, layouts, syntax highlighting, a dev
server with live reload, and a search index. This documentation site is built
with it.
