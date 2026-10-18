/**
 * @title Fetch over a Unix socket
 * @difficulty intermediate
 * @tags cli
 * @run -N -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.createHttpClient} Doc: Ende.createHttpClient
 * @resource {https://docs.ende.sh/api/ende/~/Ende.serve} Doc: Ende.serve
 * @group Network
 *
 * Local services like the Docker daemon expose HTTP over a Unix domain
 * socket instead of a TCP port. This example serves HTTP on a socket file
 * and fetches from it.
 */

// Ende.serve listens on a Unix socket when given a path instead of a port.
const server = Ende.serve(
  { path: "/tmp/example.sock" },
  () => new Response("Hello over a Unix socket"),
);

// On the client side, create an HTTP client that connects through the
// socket, and pass it to fetch. The URL's hostname is ignored; only the
// path and headers matter to the server.
const client = Ende.createHttpClient({
  proxy: { transport: "unix", path: "/tmp/example.sock" },
});

const response = await fetch("http://localhost/", { client });
console.log(await response.text()); // Hello over a Unix socket

client.close();
await server.shutdown();

// The same client works for talking to existing services. For example,
// with -R -W -N permissions and Docker running, this lists containers:
//
//   const docker = Ende.createHttpClient({
//     proxy: { transport: "unix", path: "/var/run/docker.sock" },
//   });
//   await fetch("http://localhost/containers/json", { client: docker });
