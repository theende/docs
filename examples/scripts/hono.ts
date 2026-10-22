/**
 * @title Hono HTTP server
 * @difficulty intermediate
 * @tags cli
 * @run -N <url>
 * @resource {https://jsr.io/@hono/hono} Hono on jsr.io
 * @resource {https://hono.dev/docs} Hono documentation
 * @group Network
 *
 * An example of an HTTP server that uses the Hono framework.
 */

// Import the Hono framework.
import { Hono } from "jsr:@hono/hono";

// Create a new Hono server.
const app = new Hono();

// Define a route that responds with "Hello, World!".
// The first argument is the path, the second is the request handler.
app.get("/", (c) => c.text("Hello, World!"));

// Call `Ende.serve` with the request handler to start the server on the default port (`8000`).
Ende.serve(app.fetch);

// Test the server with: `curl http://localhost:8000`.
// Should output "Hello, World!".
