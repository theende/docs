/**
 * @title Temporary files & directories
 * @difficulty beginner
 * @tags cli
 * @run -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.makeTempFile} Doc: Ende.makeTempFile
 * @resource {https://docs.ende.sh/api/ende/~/Ende.makeTempDir} Doc: Ende.makeTempDir
 * @group File System
 *
 * Temporary files and directories are used to store data that is not intended
 * to be permanent. For example, as a local cache of downloaded data.
 */

// The `Ende.makeTempFile()` function creates a temporary file in the default
// temporary directory and returns the path to the file.
const tempFilePath = await Ende.makeTempFile();
console.log("Temp file path:", tempFilePath);
await Ende.writeTextFile(tempFilePath, "Hello world!");
const data = await Ende.readTextFile(tempFilePath);
console.log("Temp file data:", data);

// A custom prefix and suffix for the temporary file can be specified.
const tempFilePath2 = await Ende.makeTempFile({
  prefix: "logs_",
  suffix: ".txt"
});

console.log("Temp file path 2:", tempFilePath2);

// The directory that temporary files are created in can be customized too.
// Here we use a relative ./tmp directory.
await Ende.mkdir("./tmp", { recursive: true });

const tempFilePath3 = await Ende.makeTempFile({
  dir: "./tmp"
});

console.log("Temp file path 3:", tempFilePath3);

// A temporary directory can also be created.
const tempDirPath = await Ende.makeTempDir();
console.log("Temp dir path:", tempDirPath);

// It has the same prefix, suffix, and directory options as `makeTempFile()`.
const tempDirPath2 = await Ende.makeTempDir({
  dir: "./tmp",
  prefix: "logs_",
  suffix: "_folder"
});

console.log("Temp dir path 2:", tempDirPath2);

// Synchronous versions of the above functions are also available.
const tempFilePath4 = Ende.makeTempFileSync();
const tempDirPath3 = Ende.makeTempDirSync();
console.log("Temp file path 4:", tempFilePath4);
console.log("Temp dir path 3:", tempDirPath3);
