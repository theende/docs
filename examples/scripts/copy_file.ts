/**
 * @title Copy a file
 * @difficulty beginner
 * @tags cli
 * @run -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.copyFile} Doc: Ende.copyFile
 * @group File System
 *
 * Copying a file is a single call in Ende. This example copies a file and a
 * file into a directory tree.
 */

// We set up a temporary directory with a small file to copy.
const dir = await Ende.makeTempDir();
await Ende.writeTextFile(`${dir}/source.txt`, "Hello");

// Ende.copyFile copies a file to a destination path, replacing the
// destination if it already exists.
await Ende.copyFile(`${dir}/source.txt`, `${dir}/copy.txt`);
console.log(await Ende.readTextFile(`${dir}/copy.txt`)); // Hello

// The destination directory must exist; copyFile does not create it.
await Ende.mkdir(`${dir}/backup`);
await Ende.copyFile(`${dir}/source.txt`, `${dir}/backup/copy.txt`);

// There is a synchronous variant as well.
Ende.copyFileSync(`${dir}/source.txt`, `${dir}/copy2.txt`);

// Reading and writing files requires the -R and -W permissions.
await Ende.remove(dir, { recursive: true });
