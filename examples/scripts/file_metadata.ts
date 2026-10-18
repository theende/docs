/**
 * @title Read and change file metadata
 * @difficulty beginner
 * @tags cli
 * @run -R -W <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.stat} Doc: Ende.stat
 * @resource {https://docs.ende.sh/api/ende/~/Ende.FileInfo} Doc: Ende.FileInfo
 * @group File System
 *
 * Every file carries metadata besides its contents: size, timestamps, type
 * and permissions. This example reads that metadata with Ende.stat, changes
 * permissions with Ende.chmod, and sets timestamps with Ende.utime.
 */

// We set up a temporary directory with a small file to inspect.
const dir = await Ende.makeTempDir();
const path = `${dir}/data.txt`;
await Ende.writeTextFile(path, "twelve bytes");

// Ende.stat returns a FileInfo object with the size in bytes, the type and
// the timestamps. The timestamps are Date objects (or null on platforms
// that do not record them).
const info = await Ende.stat(path);
console.log(info.size); // 12
console.log(info.isFile); // true
console.log(info.mtime instanceof Date); // true
console.log(info.birthtime instanceof Date); // true

// On a symlink, stat follows the link and describes the target, while
// lstat describes the link itself.
await Ende.symlink(path, `${dir}/link.txt`);
console.log((await Ende.stat(`${dir}/link.txt`)).isFile); // true
console.log((await Ende.lstat(`${dir}/link.txt`)).isSymlink); // true

// The mode field holds the raw Unix permission bits. Masking with 0o777
// keeps just the permission part, in the familiar octal form.
console.log((info.mode! & 0o777).toString(8)); // 644

// Ende.chmod changes those permission bits. Here we drop access for group
// and others. On Windows only the write permission can be changed, and
// stat reports mode as null there.
await Ende.chmod(path, 0o600);
const after = await Ende.stat(path);
console.log((after.mode! & 0o777).toString(8)); // 600

// Ende.utime sets the access and modification times to any date you like,
// which is handy for tools like build systems that compare timestamps.
const date = new Date("2020-01-02T03:04:05Z");
await Ende.utime(path, date, date);
console.log((await Ende.stat(path)).mtime?.toISOString()); // 2020-01-02T03:04:05.000Z

// Reading metadata requires the -R permission; chmod and utime require -W.
await Ende.remove(dir, { recursive: true });
