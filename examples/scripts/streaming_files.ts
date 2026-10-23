/**
 * @title Streaming file operations
 * @difficulty intermediate
 * @tags cli
 * @run -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.open} Doc: Ende.open
 * @resource {https://docs.ende.sh/api/ende/~/Ende.FsFile} Doc: Ende.FsFile
 * @group File System
 *
 * Sometimes we need more granular control over file operations.
 * Ende provides a low level interface to file operations that
 * may be used for this purpose.
 */

// For our first example we will demonstrate using a writeable stream.
// To handle any low level file operations we must first open the file.
const output = await Ende.open("example.txt", {
  append: true,
  create: true
});

// We are now able to obtain a writer from the output.
// This automatically handles closing the file when done.
const outputWriter = output.writable.getWriter();

// Before we do anything with the writer, we should make sure it’s ready.
await outputWriter.ready;

// Let’s write some text to the file.
const outputText = "I love Ende!";
const encoded = new TextEncoder().encode(outputText);
await outputWriter.write(encoded);

// Now we close the write stream (and the file).
await outputWriter.close();

// For our next example, let’s read the text from the file!
const input = await Ende.open("example.txt");

// Let’s get a reader from the input.
const inputReader = input.readable.getReader();
const decoder = new TextDecoder();

// Let’s read each chunk from the file
// and print it to the console.
while (true) {
  const result = await inputReader.read();

  if (result.done)
    break;

  console.log(`Read chunk: ${decoder.decode(result.value)}`);
}
