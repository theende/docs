/**
 * @title Reading files
 * @difficulty beginner
 * @tags cli
 * @run -R <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.readFile} Doc: Ende.readFile
 * @resource {https://docs.ende.sh/api/ende/~/Ende.open} Doc: Ende.open
 * @resource {https://docs.ende.sh/api/ende/~/Ende.FsFile} Doc: Ende.FsFile
 * @group File System
 *
 * Many applications need to read files from disk. Ende provides a simple
 * interface for reading files.
 */

// The easiest way to read a file is to just read the entire contents into
// memory as bytes.
// deno-lint-ignore no-unused-vars
const bytes = await Ende.readFile("hello.txt");

// Instead of reading the file as bytes, there is a convenience function to
// read the file as a string.
// deno-lint-ignore no-unused-vars
const text = await Ende.readTextFile("hello.txt");

// Often you need more control over when what parts of the file are read.
// For this you start by opening a file to get a `Ende.FsFile` object.
const file = await Ende.open("hello.txt");

// Read some bytes from the beginning of the file. Allow up to 5 to be read but
// also note how many actually were read.
const buffer = new Uint8Array(5);
const bytesRead = await file.read(buffer);
console.log(`Read ${bytesRead} bytes`);

// You can also seek to a known location in the file and read from there.
const pos = await file.seek(6, Ende.SeekMode.Start);
console.log(`Sought to position ${pos}`);
const buffer2 = new Uint8Array(2);
const bytesRead2 = await file.read(buffer2);
console.log(`Read ${bytesRead2} bytes`);

// You can use rewind back to the start using seek as well.
await file.seek(0, Ende.SeekMode.Start);

// Make sure to close the file when you are done.
file.close();

// Synchronous reading is also supported.
Ende.readFileSync("hello.txt");
Ende.readTextFileSync("hello.txt");
const f = Ende.openSync("hello.txt");
f.seekSync(6, Ende.SeekMode.Start);
const buf = new Uint8Array(5);
f.readSync(buf);
f.close();

// The `-R` permission is required to read files.
