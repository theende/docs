/**
 * @title Find a free port
 * @difficulty beginner
 * @tags cli
 * @run -N <url>
 * @resource {https://jsr.io/@ende/net/doc/get-available-port} @ende/net: getAvailablePort
 * @resource {https://docs.ende.sh/api/ende/~/Ende.serve} Ende: serve
 * @group Network
 *
 * Test servers and helper processes should not fight over hardcoded ports.
 * The getAvailablePort function from @ende/net asks the operating system for
 * a free port, and Ende.serve with port 0 does the same thing in one step.
 */

import { getAvailablePort } from "jsr:@ende/net";

// getAvailablePort binds port 0, reads the port the OS picked, and closes
// the probe listener. Optionally pass { preferredPort: 8000 } to try a
// fixed port first and fall back to a random one.
const port = getAvailablePort();
console.log(port); // e.g. 61678

const server = Ende.serve(
  { port, onListen: ({ port }) => console.log(`listening on ${port}`) },
  () => new Response("Hello from a random port\n"),
);

// Note there is a small race: between getAvailablePort returning and the
// server starting, another process could grab the port. Asking Ende.serve
// itself for port 0 has no such window, the listener that gets the random
// port is the one you keep. Read the assigned port from server.addr.
// In Node the same trick is server.listen(0) plus server.address().port.
const server2 = Ende.serve(
  { port: 0, onListen: () => {} },
  () => new Response("Hello from port 0\n"),
);
console.log(server2.addr.port); // e.g. 61679

// Both servers answer normally on their assigned ports.
const res = await fetch(`http://localhost:${server2.addr.port}/`);
console.log(await res.text()); // Hello from port 0

await server.shutdown();
await server2.shutdown();
