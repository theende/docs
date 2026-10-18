/**
 * @title HTTP server: TLS
 * @difficulty intermediate
 * @tags cli
 * @run -N -R <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.serve} Doc: Ende.serve
 * @resource {/examples/http_server} Example: HTTP Server: Hello world
 * @group Network
 *
 * Ende.serve speaks HTTPS when given a certificate and private key. This
 * example starts a TLS server with a locally generated certificate.
 */

// For local development, generate a self-signed certificate with openssl:
//
//   openssl req -x509 -newkey rsa:2048 -nodes -days 365
//     -keyout localhost-key.pem -out localhost-cert.pem
//     -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost"
//
// In production, use the certificate files issued by your CA instead.

// Pass the certificate and key as strings; reading them needs the -R
// permission, and serving needs -N.
Ende.serve(
  {
    port: 8443,
    cert: Ende.readTextFileSync("localhost-cert.pem"),
    key: Ende.readTextFileSync("localhost-key.pem"),
  },
  () => new Response("Hello over TLS"),
);

// Test it with curl, telling it to trust the self-signed certificate:
//
//   curl --cacert localhost-cert.pem https://localhost:8443/
//   Hello over TLS

// Browsers will warn about self-signed certificates. A tool like mkcert
// installs a locally trusted authority and removes the warning during
// development.
