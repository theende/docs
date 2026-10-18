/**
 * @title HTTP server: Serving files
 * @difficulty intermediate
 * @tags cli
 * @run -N -R <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.serve} Doc: Ende.serve
 * @resource {https://jsr.io/@ende/http#file-server} Doc: @ende/http/file-server
 * @resource {/examples/http_server} Example: HTTP Server: Hello World
 * @group Network
 *
 * An example of an HTTP server that serves files.
 */

// Import utility methods for serving files with mime types.
import { serveDir, serveFile } from "jsr:@ende/http/file-server";

// Here we start a simple server
Ende.serve((req: Request) => {
  // Get the path from the url (ie. example.com/whatever -> /whatever)
  const pathname = new URL(req.url).pathname;

  if (pathname === "/simple_file") {
    // In the most basic case we can just call this function with the
    // request object and path to the file
    return serveFile(req, "./path/to/file.txt");
  }

  if (pathname.startsWith("/static")) {
    // We can also serve a whole directory using the serveDir utility
    // method. By default it serves the current directory but this
    // can be changed using the "fsRoot" option. We can use the "urlRoot"
    // option to strip off the start of the url in the case we don't
    // serve the directory at the top level.
    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "static",
    });
  }

  return new Response("404: Not Found", {
    status: 404,
  });
});
