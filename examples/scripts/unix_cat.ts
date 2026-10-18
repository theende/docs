/**
 * @title Unix cat
 * @difficulty beginner
 * @tags cli
 * @run -R <url> file1 file2
 * @resource {https://docs.ende.sh/api/ende/~/Ende.args} Ende args API docs
 * @resource {https://docs.ende.sh/api/ende/~/Ende.open} Ende open API docs
 * @resource {https://docs.ende.sh/api/ende/~/Ende.stdout} Ende stdout API docs
 * @resource {https://docs.ende.sh/api/ende/~/Ende.FsFile#property_readable} Ende File System API docs
 * @group File System
 *
 * In Unix, the `cat` command is a utility that reads files and writes them to standard output. You can use Ende to mimic the behavior of the `cat` command. <br><br> In this program each command-line argument is assumed to be a filename, the file is opened, and printed to stdout (e.g. the console).
 */

// Create a script that reads the contents of one or more files and writes them to standard output.
for (const filename of Ende.args) {
  const file = await Ende.open(filename);
  await file.readable.pipeTo(Ende.stdout.writable, { preventClose: true });
}
