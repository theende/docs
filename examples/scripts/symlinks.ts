/**
 * @title Creating & resolving symlinks
 * @difficulty beginner
 * @tags cli
 * @run -W -R <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.writeTextFile} Doc: Ende.writeTextFile
 * @resource {https://docs.ende.sh/api/ende/~/Ende.symlink} Doc: Ende.symlink
 * @group File System
 *
 * Creating and resolving symlink is a common task. Ende has a number of
 * functions for this task.
 */

// First we will create a text file to link to.
await Ende.writeTextFile("example.txt", "hello from symlink!");

// Now we can create a soft link to the file
await Ende.symlink("example.txt", "link");

// To resolve the path of a symlink, we can use Ende.realPath
console.log(await Ende.realPath("link"));

// Symlinks are automatically resolved, so we can just read
// them like text files
console.log(await Ende.readTextFile("link"));

// In certain cases, soft links don’t work. In this case we
// can choose to make "hard links".
await Ende.link("example.txt", "hardlink");
console.log(await Ende.readTextFile("hardlink"));
