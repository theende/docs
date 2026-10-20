/**
 * @title HTTP server: Scaling across CPU cores
 * @difficulty intermediate
 * @tags cli
 * @run ende serve --parallel <url>
 * @resource {https://docs.ende.sh/runtime/reference/cli/serve/} Doc: ende serve
 * @resource {/examples/http_server} Example: HTTP Server: Hello world
 * @group Network
 *
 * A single process handles requests on one core. The ende serve subcommand
 * can run a whole pool of workers behind one port with the --parallel
 * flag. The server exports its handler instead of calling Ende.serve.
 */

// With ende serve, the module’s default export provides the fetch handler.
// The runtime owns the listening socket, which is what lets it share the
// port between workers.
export default {
  fetch(_req: Request): Response {
    return new Response("Hello, World!");
  }
} satisfies Ende.ServeDefaultExport;

// Start one worker per CPU core:
//
//   ende serve --parallel server.ts
//   ende serve: Listening on http://0.0.0.0:8000/ with 8 threads
//
// Incoming connections are distributed across the workers. Set the
// ENDE_JOBS environment variable to control the worker count:
//
//   ENDE_JOBS=4 ende serve --parallel server.ts

// Each worker is a separate isolate: module-level state like counters or
// caches is per worker, not shared. Keep shared state in something
// external, like a database.
