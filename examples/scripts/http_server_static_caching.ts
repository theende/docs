/**
 * @title HTTP server: Caching headers
 * @difficulty intermediate
 * @tags cli
 * @run -N -R <url>
 * @resource {https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching} MDN: HTTP caching
 * @resource {https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag} MDN: ETag
 * @group Network
 *
 * Cache headers let clients skip downloads they already have. This server
 * sends cache-control, etag, and last-modified with a file, and answers a
 * matching if-none-match revalidation with 304 Not Modified and no body.
 */

// Serve this script’s own source file so the example is self-contained.
const filePath = import.meta.filename!;

Ende.serve(async (req) => {
  const stat = await Ende.stat(filePath);

  // A weak etag (W/ prefix) derived from mtime and size is cheap and good
  // enough for cache validation. Hash the content instead if you need a
  // strong validator, for example to support byte-range resumption.
  const mtime = stat.mtime ?? new Date();
  const etag = `W/"${mtime.getTime().toString(16)}-${stat.size.toString(16)}"`;

  const headers = {
    // Clients may reuse the file for 60 seconds, then must revalidate.
    "cache-control": "max-age=60, must-revalidate",
    "content-type": "text/plain; charset=utf-8",
    "etag": etag,
    "last-modified": mtime.toUTCString()
  };

  // The client revalidates by echoing the etag in if-none-match. If it
  // still matches, a bodyless 304 tells it to keep using its copy.
  if (req.headers.get("if-none-match") === etag)
    return new Response(null, { headers, status: 304 });

  const file = await Ende.open(filePath, { read: true });
  return new Response(file.readable, { headers });
});

// The first request downloads the file and the validators:
//
//   curl -i http://localhost:8000/
//
//   HTTP/1.1 200 OK
//   etag: W/"19eb80919f8-8bd"
//   last-modified: Thu, 11 Jun 2026 18:54:24 GMT
//   cache-control: max-age=60, must-revalidate
//   content-type: text/plain; charset=utf-8
//   transfer-encoding: chunked
//   date: Thu, 11 Jun 2026 18:54:53 GMT
//
// Revalidating with that etag transfers no body:
//
//   curl -i http://localhost:8000/ -H 'if-none-match: W/"19eb80919f8-8bd"'
//
//   HTTP/1.1 304 Not Modified
//   etag: W/"19eb80919f8-8bd"
//   last-modified: Thu, 11 Jun 2026 18:54:24 GMT
//   cache-control: max-age=60, must-revalidate
//   content-type: text/plain; charset=utf-8
//   date: Thu, 11 Jun 2026 18:54:53 GMT
