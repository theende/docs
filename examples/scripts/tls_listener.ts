/**
 * @title TCP/TLS listener: Ping
 * @difficulty intermediate
 * @tags cli
 * @run -N -R <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.listenTls} Doc: Ende.listenTls
 * @group Network
 *
 * An example of a TCP listener using TLS on localhost that will log the message if written to and close the connection if connected to.
 */

// Instantiate an instance of a TCP listener on localhost port 443.
const listener = Ende.listenTls({
  cert: Ende.readTextFileSync("./server.crt"),
  hostname: "127.0.0.1",
  key: Ende.readTextFileSync("./server.key"),
  port: 443,
  transport: "tcp"
});

// Await asynchronous connections that are established to our TCP listener.
for await (const conn of listener) {
  // Pipe the contents of the TCP stream into stdout
  await conn.readable.pipeTo(Ende.stdout.writable);

  // We close the connection that was established.
  conn.close();
}
