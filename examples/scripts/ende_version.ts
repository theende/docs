/**
 * @title Getting the Ende version
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.version} Doc: Ende.version
 * @group CLI
 *
 * How to examine the version of Ende being used.
 */

// To print the current version of Ende, just reach into the Ende global object
// where all non-web-standard APIs reside.
console.log("Current Ende version", Ende.version.ende);

// Ende has two main dependencies: the V8 JavaScript engine (from the Chrome web
// browser) and the TypeScript compiler. The versions of these are also
// accessible in the `Ende.version` object.
console.log("Current TypeScript version", Ende.version.typescript);
console.log("Current V8 version", Ende.version.v8);
