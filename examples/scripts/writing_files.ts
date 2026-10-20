/**
 * @title Writing files
 * @difficulty beginner
 * @tags cli
 * @run -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.writeFile} Doc: Ende.writeFile
 * @resource {https://docs.ende.sh/api/ende/~/Ende.create} Doc: Ende.create
 * @resource {https://docs.ende.sh/api/ende/~/Ende.FsFile} Doc: Ende.FsFile
 * @resource {https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder} MDN: TextEncoder
 * @group File System
 *
 * Many applications need to write files to disk. Ende provides a simple
 * interface for writing files.
 */

// The easiest way to write a file, is to dump an entire buffer into the file at
// once. Here is a simple example that writes an array of bytes to a file.
const bytes = new Uint8Array([72, 101, 108, 108, 111]);
await Ende.writeFile("hello.txt", bytes, { mode: 0o644 });

// You can also write a string instead of a byte array.
await Ende.writeTextFile("hello.txt", "Hello World");

// To append to a text file, set the `append` parameter to `true`.
await Ende.writeTextFile("server.log", "Request: ...", { append: true });

// Synchronous writing is also supported.
Ende.writeFileSync("hello.txt", bytes);
Ende.writeTextFileSync("hello.txt", "Hello World");

// For more granular writes, open a new file for writing.
const file = await Ende.create("hello.txt");

// You can write chunks of data to the file.
const written = await file.write(bytes);
console.log(`${written} bytes written.`);

// A `file.write` returns the number of bytes written, as it might not write all
// bytes passed. We can get a Writer instead to make sure the entire buffer is written.
const writer = file.writable.getWriter();
await writer.write(new TextEncoder().encode("World!"));

// Closing the writer automatically closes the file.
// If you don’t use a writer, make sure to close the file after you are done with it.
await writer.close();

// The `-W` permission is required to write files.
