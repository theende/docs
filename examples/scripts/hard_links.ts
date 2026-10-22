/**
 * @title Create hard links
 * @difficulty beginner
 * @tags cli
 * @run -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.link} Doc: Ende.link
 * @resource {https://docs.ende.sh/examples/symlinks/} Example: Creating & resolving symlinks
 * @group File System
 *
 * A hard link is a second name for the same file. Unlike a symlink, which
 * is a small file that points to a path and breaks when the target moves,
 * a hard link is equal to the original name in every way. This example
 * creates one and shows that both names really are the same file.
 */

// We work in a temporary directory with one file.
const dir = await Ende.makeTempDir();
const original = `${dir}/original.txt`;
const alias = `${dir}/alias.txt`;
await Ende.writeTextFile(original, "first");

// `Ende.link` creates the hard link. Both names now refer to the same data
// on disk, so this does not copy anything.
await Ende.link(original, alias);

// The `nlink` field counts how many names a file has. It is `null` on
// Windows.
console.log((await Ende.stat(original)).nlink); // 2

// Writing through one name is immediately visible through the other,
// because there is only one file behind them.
await Ende.writeTextFile(alias, "written via alias");
console.log(await Ende.readTextFile(original)); // written via alias

// A hard link must be on the same file system as the original, and it
// cannot point to a directory. Symlinks have neither restriction, which
// is why they are the more common choice for shortcuts.

// Deleting one name only removes that name. The data survives as long as
// at least one name is left.
await Ende.remove(original);
console.log(await Ende.readTextFile(alias)); // written via alias
console.log((await Ende.stat(alias)).nlink); // 1

// Creating links requires the `-W` permission for both paths.
await Ende.remove(dir, { recursive: true });
