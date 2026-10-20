/**
 * @title Parsing JSONC
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @resource {https://jsr.io/@ende/jsonc} Doc: @ende/jsonc
 * @resource {https://docs.ende.sh/runtime/fundamentals/configuration/} Doc: ende.json configuration
 * @group Encoding
 *
 * JSONC is JSON extended with comments and trailing commas, which makes it
 * a friendlier format for configuration files that humans edit. Ende reads
 * its own ende.jsonc config file in this format. The Standard Library
 * provides a parser for it in jsr:@ende/jsonc.
 */
import { parse } from "jsr:@ende/jsonc";

// This config uses line comments, a block comment and trailing commas.
// All three are valid JSONC.
const text = `{
  // The name appears in log output.
  "name": "my-app",
  /* Ports below 1024 need extra privileges. */
  "port": 8080,
  "features": [
    "http",
    "websockets",
  ],
}`;

// To parse, pass the text to the parse function. Comments and trailing
// commas are dropped and a plain JavaScript value comes back.
const config = parse(text);
console.log(config); // { name: "my-app", port: 8080, features: [ "http", "websockets" ] }

// The return type is JsonValue, so cast it to the shape you expect before
// accessing properties.
const { name, port } = config as { name: string; port: number; };
console.log(name, port); // my-app 8080

// The built-in JSON.parse rejects the same text, because comments and
// trailing commas are not valid JSON. It throws on the first comment.
try {
  JSON.parse(text);
} catch (error) {
  console.log((error as Error).name); // SyntaxError
}
