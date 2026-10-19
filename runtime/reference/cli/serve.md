---
last_modified: 2026-06-17
title: "ende serve"
oldUrl: /runtime/manual/tools/serve/
command: serve
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende serve"
description: "A flexible and configurable HTTP server for Ende"
---

`ende serve` runs a file as an HTTP server using
[`Ende.serve()`](/api/ende/~/Ende.serve/). The file must export a default object
with a `fetch` handler. For a full guide on building HTTP servers, see
[Writing an HTTP Server](/runtime/fundamentals/http_server/).

## Basic usage

```typescript title="server.ts"
export default {
  fetch(_req: Request) {
    return new Response("Hello world!");
  }
} satisfies Ende.ServeDefaultExport;
```

```sh
ende serve server.ts
```

By default, the server listens on port **8000**. Override it with `--port`:

```sh
ende serve --port=3000 server.ts
```

## `ende serve` vs `ende run`

Both approaches start an HTTP server, and the difference is who calls
[`Ende.serve()`](/api/ende/~/Ende.serve/):

- With `ende serve`, Ende calls [`Ende.serve()`](/api/ende/~/Ende.serve/) for
  you. Your file just exports a default object with a `fetch` handler. Ende owns
  the listener, which lets it add features such as running multiple instances
  across threads with [`--parallel`](#horizontal-scaling).
- With `ende run`, you call [`Ende.serve()`](/api/ende/~/Ende.serve/) yourself
  inside the program. This gives you full control over the listen options and
  the surrounding code, and is the right choice when the server is one part of a
  larger program.

Use `ende serve` when the program is primarily an HTTP server and you want Ende
to manage it; use `ende run` with [`Ende.serve()`](/api/ende/~/Ende.serve/) when
you need to control how and when the server starts.

## Default export shape

The file must export a default object that satisfies
[`Ende.ServeDefaultExport`](/api/ende/~/Ende.ServeDefaultExport/). The object
has two properties:

```typescript
export interface ServeDefaultExport {
  fetch: ServeHandler;
  onListen?: (localAddr: Ende.Addr) => void;
}
```

### `fetch` (required)

The `fetch` handler receives a standard
[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and a
[`ServeHandlerInfo`](/api/ende/~/Ende.ServeHandlerInfo/) object with connection
metadata:

```typescript
type ServeHandler = (
  request: Request,
  info: ServeHandlerInfo
) => Response | Promise<Response>;

interface ServeHandlerInfo {
  remoteAddr: Ende.Addr; // remote address of the connection
  completed: Promise<void>; // resolves when the request completes
}
```

If the handler throws, the error is isolated to that request — the server
continues serving.

### `onListen` (optional)

Called once when the server starts listening. If omitted, a default message is
logged to the console.

```typescript title="server.ts"
export default {
  fetch(request, info) {
    const { hostname, port } = info.remoteAddr as Ende.NetAddr;
    console.log(`${request.method} ${request.url} from ${hostname}:${port}`);

    return new Response("Hello, World!", {
      headers: { "content-type": "text/plain" }
    });
  },

  onListen({ hostname, port }) {
    console.log(`Server running at http://${hostname}:${port}/`);
  }
} satisfies Ende.ServeDefaultExport;
```

Any other properties on the default export are silently ignored. If `fetch` is
missing, no server starts. If `fetch` or `onListen` exist but are not functions,
a `TypeError` is thrown.

## Routing requests

Use the request URL to route to different handlers:

```typescript title="server.ts"
export default {
  fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok" });
    }

    return new Response("Not found", { status: 404 });
  }
} satisfies Ende.ServeDefaultExport;
```

## Binding to a hostname

By default, `ende serve` listens on `0.0.0.0`. Use `--host` to bind to a
specific interface:

```sh
ende serve --host=127.0.0.1 server.ts
```

## Horizontal scaling

Run multiple server instances across CPU cores for better throughput:

```sh
ende serve --parallel server.ts
```

## Watch mode

Restart the server automatically when files change:

```sh
ende serve --watch server.ts
```

## Permissions

`ende serve` automatically allows the server to listen without requiring
`--allow-net`. Additional permissions (like file reads) must be granted
explicitly:

```sh
ende serve --allow-read server.ts
```
