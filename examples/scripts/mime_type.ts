/**
 * @title Get the MIME type of a file
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @resource {https://jsr.io/@ende/media-types} Doc: @ende/media-types
 * @resource {https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types} MDN: MIME types
 * @group File System
 *
 * Serving a file over HTTP needs a content type header. The standard
 * library maps file extensions to MIME types. This example looks up the
 * type for a few file names.
 */
import { contentType } from "jsr:@ende/media-types";
import { extname } from "jsr:@ende/path@^2026.10.15";

// Look up the MIME type for a file name by its extension.
console.log(contentType(extname("photo.png"))); // image/png
console.log(contentType(extname("data.json"))); // application/json

// Text types include their charset, ready to use in a header.
console.log(contentType(extname("index.html"))); // text/html; charset=UTF-8

// Unknown extensions return undefined, so provide a fallback. The standard
// fallback for arbitrary binary data is application/octet-stream.
const type = contentType(extname("archive.xyz")) ??
  "application/octet-stream";
console.log(type); // application/octet-stream

// A typical use: serving content with the right header.
const path = "data.json";
const body = new Blob(['{ "hello": "world" }']).stream();
const response = new Response(body, {
  headers: {
    "content-type": contentType(extname(path)) ?? "application/octet-stream",
  },
});
console.log(response.headers.get("content-type")); // application/json

// Note that the lookup trusts the file name. To identify a file by its
// actual contents, inspect its magic bytes instead.
