/**
 * @title Moving/Renaming files
 * @difficulty beginner
 * @tags cli
 * @run -R=./ -W=./ <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.rename} Doc: Ende.rename
 * @group File System
 *
 * An example of how to move and rename files and directories in Ende.
 */

// To rename or move a file, you can use the `Ende.rename` function. The first
// argument is the path to the file to rename. The second argument is the new
// path.
await Ende.writeTextFile("./hello.txt", "Hello World!");
await Ende.rename("./hello.txt", "./hello-renamed.txt");
console.log(await Ende.readTextFile("./hello-renamed.txt"));

// If the source file or the destination directory does not exist, the function
// will reject the returned promise with a `Ende.errors.NotFound` error. You can
// catch this error with a `try/catch` block.
try {
  await Ende.rename("./hello.txt", "./does/not/exist");
} catch (err) {
  console.error(err);
}

// A synchronous version of this function is also available.
Ende.renameSync("./hello-renamed.txt", "./hello-again.txt");

// If the destination file already exists, it will be overwritten.
await Ende.writeTextFile("./hello.txt", "Invisible content.");
await Ende.rename("./hello-again.txt", "./hello.txt");
console.log(await Ende.readTextFile("./hello.txt"));

// Read and write permissions are necessary to perform this operation. The
// source file needs to be readable and the destination path needs to be
// writable.
