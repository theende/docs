/**
 * @title Create and extract tar archives
 * @difficulty beginner
 * @tags cli
 * @run -R -W <url>
 * @resource {https://jsr.io/@ende/tar} Doc: @ende/tar
 * @resource {/examples/compress_decompress/} Example: Compress and decompress data
 * @group File System
 *
 * A tar archive bundles many files and directories into a single file,
 * usually compressed with gzip to produce the familiar .tar.gz format.
 * The Standard Library provides TarStream and UntarStream in jsr:@ende/tar,
 * both built on web standard streams so they compose with CompressionStream
 * and file streams without buffering whole archives in memory.
 */
import { TarStream, type TarStreamInput, UntarStream } from "jsr:@ende/tar";
import { normalize } from "jsr:@ende/path";

// We prepare a directory with two files to archive.
const dir = await Ende.makeTempDir();
await Ende.mkdir(`${dir}/project`);
await Ende.writeTextFile(`${dir}/project/readme.txt`, "A sample project.");
await Ende.writeTextFile(`${dir}/project/config.json`, `{"name":"sample"}`);

// To create an archive, pipe a stream of entries through a TarStream.
// A directory entry only needs a path. A file entry also needs its size
// and a readable stream of its contents. Piping the result through a
// CompressionStream produces a .tar.gz file.
const readmeStat = await Ende.stat(`${dir}/project/readme.txt`);
const configStat = await Ende.stat(`${dir}/project/config.json`);
const archive = await Ende.create(`${dir}/project.tar.gz`);

const inputs: TarStreamInput[] = [
  { path: "project", type: "directory" },
  {
    path: "project/readme.txt",
    readable: (await Ende.open(`${dir}/project/readme.txt`)).readable,
    size: readmeStat.size,
    type: "file"
  },
  {
    path: "project/config.json",
    readable: (await Ende.open(`${dir}/project/config.json`)).readable,
    size: configStat.size,
    type: "file"
  }
];

await ReadableStream.from(inputs)
  .pipeThrough(new TarStream())
  .pipeThrough(new CompressionStream("gzip"))
  .pipeTo(archive.writable);

console.log((await Ende.stat(`${dir}/project.tar.gz`)).size); // 258

// To extract, run the pipeline in reverse: decompress the bytes, then
// pipe them through an UntarStream and iterate over the entries.
const outDir = `${dir}/extracted`;
await Ende.mkdir(outDir);
const tarball = await Ende.open(`${dir}/project.tar.gz`);
const entries = tarball.readable
  .pipeThrough(new DecompressionStream("gzip"))
  .pipeThrough(new UntarStream());

// Directory entries have no readable stream. For file entries, piping the
// readable into a file writes it to disk. Paths inside an archive are not
// trustworthy, so normalize them before touching the file system.
for await (const entry of entries) {
  console.log(entry.path);
  const target = `${outDir}/${normalize(entry.path)}`;

  if (entry.readable === undefined) {
    await Ende.mkdir(target, { recursive: true });
    continue;
  }

  const file = await Ende.create(target);
  await entry.readable.pipeTo(file.writable);
}
//- project
//- project/readme.txt
//- project/config.json

// The extracted files match the originals.
console.log(await Ende.readTextFile(`${outDir}/project/readme.txt`)); // A sample project.
console.log(await Ende.readTextFile(`${outDir}/project/config.json`)); // {"name":"sample"}

// Reading and writing files requires the -R and -W permissions.
await Ende.remove(dir, { recursive: true });
