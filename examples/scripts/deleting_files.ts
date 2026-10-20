/**
 * @title Deleting files
 * @difficulty beginner
 * @tags cli
 * @resource {https://docs.ende.sh/api/ende/~/Ende.remove} Doc: Ende.remove
 * @run -W <url>
 * @group File System
 *
 * Removing files and directories is a common task. Ende has a number of
 * functions for this task.
 */

// In the case that we want to remove a simple file,
// we can simply call Ende.remove with the filename as
// a parameter
await Ende.remove("example.txt");

// There is also a sync version of the api available
await Ende.writeTextFile("toBeRemoved.txt", "noop");
Ende.removeSync("toBeRemoved.txt");

// If we want to remove a directory, we could do exactly
// what we did above. If the directory has contents, the
// call would error out. If we want to recursively delete
// the contents of a directory, we should set recursive to
// true
await Ende.remove("./dir", { recursive: true });

// A common pattern is to remove a file or directory only
// if it already exists. The correct way of doing this is
// by just doing it and trying to catch any NotFound errors.
try {
  await Ende.remove("example.txt");
} catch (err) {
  if (!(err instanceof Ende.errors.NotFound))
    throw err;
}
