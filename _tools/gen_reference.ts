// Generates the API reference data under `_reference/` from released
// artifacts only, at the versions pinned in `_reference/sources.json`:
//
// - `builtin.json`: the runtime's declarations (`ende doc --builtin`), with the
//   `Ende` members only desktop apps have (`cli/tsc/dts/lib.ende.desktop.d.ts`
//   at the pinned release's tag) merged into the `Ende` namespace. The `ende`
//   running this script must be the pinned release.
// - `std/<package>.json`: each pinned `@ende/*` std package, documented from
//   its published version on JSR.
//
// The data is committed so a docs build needs neither the network nor a
// particular Ende. `--check` regenerates in memory and fails if the committed
// data is out of date.
//
//   ende task gen:reference            # writes _reference/ from the pins
//   ende task gen:reference --update   # pins the latest releases, then writes
//   ende task check:reference          # fails on drift

// The script imports nothing and runs `ende` outside the docs directory, so it
// doesn't depend on the docs' ende.json (whose `links` need sibling checkouts).

const args = {
  check: Ende.args.includes("--check"),
  update: Ende.args.includes("--update"),
};
const out = new URL("../_reference/", import.meta.url);
const sourcesFile = new URL("sources.json", out);

// Not documented: implementation details of the other packages.
const SKIPPED_PACKAGES = new Set(["internal"]);

/** The releases the reference documents. */
interface Sources {
  /** The Ende release, e.g. `2026.10.17`. */
  ende: string;
  /** Each std package's version, by name without the `@ende/` scope. */
  std: Record<string, string>;
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

async function run(
  cwd: string,
  args: string[],
  env: Record<string, string> = {},
): Promise<string> {
  const output = await new Ende.Command(Ende.execPath(), {
    args,
    cwd,
    env,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const decoder = new TextDecoder();

  if (!output.success) {
    throw new Error(
      `ende ${args.join(" ")} (in ${cwd}) failed:\n${
        decoder.decode(output.stderr)
      }`,
    );
  }

  return decoder.decode(output.stdout);
}

/** Drops what the reference doesn't use: positions, and `repr` (the printer builds types from their parts). */
function slim(
  value: Json,
  keepLine: (filename: string) => string | undefined,
): Json {
  if (Array.isArray(value)) return value.map((item) => slim(item, keepLine));
  if (value === null || typeof value !== "object") return value;

  const result: JsonObject = {};

  for (const [key, child] of Object.entries(value)) {
    if (key === "repr") continue;

    if (key === "location") {
      const location = child as JsonObject;
      const file = keepLine(location.filename as string);
      if (file !== undefined) result.location = { file, line: location.line };
      continue;
    }

    if (key === "target" && child !== null && typeof child === "object") {
      const target = child as JsonObject;
      const file = keepLine(target.filename as string);
      result.target = {
        file: file ?? (target.filename as string),
        line: target.line,
      };
      continue;
    }

    result[key] = slim(child, keepLine);
  }

  return result;
}

interface DocOutput {
  version: number;
  nodes: Record<string, { module_doc?: Json; symbols: JsonObject[] }>;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }

  return await response.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  return JSON.parse(await fetchText(url)) as T;
}

/** The latest Ende release and std package versions. */
async function latestSources(): Promise<Sources> {
  const ende = (await fetchText("https://dl.ende.sh/release-latest.txt"))
    .trim()
    .replace(/^v/, "");
  const { items } = await fetchJson<{
    items: {
      name: string;
      githubRepository: { owner: string; name: string } | null;
    }[];
  }>("https://api.jsr.io/scopes/ende/packages?limit=100");
  const std: Record<string, string> = {};
  const names = items
    .filter((item) =>
      item.githubRepository?.owner === "theende" &&
      item.githubRepository.name === "std" &&
      !SKIPPED_PACKAGES.has(item.name)
    )
    .map((item) => item.name)
    .sort();

  for (const name of names) {
    const meta = await fetchJson<{ latest: string }>(
      `https://jsr.io/@ende/${name}/meta.json`,
    );
    std[name] = meta.latest;
  }

  return { ende, std };
}

async function builtin(sources: Sources): Promise<string> {
  const dir = await Ende.makeTempDir();
  const version = (await run(dir, ["--version"])).match(/^ende (\S+)/)?.[1];

  if (version !== sources.ende) {
    throw new Error(
      `The reference is pinned to Ende ${sources.ende}, but this is Ende ${version}. ` +
        `Install that release and run this again: curl -fsSL https://ende.sh/install.sh | sh -s v${sources.ende}`,
    );
  }

  const runtime = JSON.parse(
    await run(dir, ["doc", "--json", "--no-config", "--builtin"]),
  ) as DocOutput;
  // `ende doc --builtin` leaves out the desktop-only declarations, and the
  // binary has no other way to print them, so they come from the release tag.
  const desktopFile = `${dir}/lib.ende.desktop.d.ts`;
  await Ende.writeTextFile(
    desktopFile,
    await fetchText(
      `https://raw.githubusercontent.com/theende/ende/v${sources.ende}/cli/tsc/dts/lib.ende.desktop.d.ts`,
    ),
  );
  const desktop = JSON.parse(
    await run(dir, ["doc", "--json", "--no-config", desktopFile]),
  ) as DocOutput;
  await Ende.remove(dir, { recursive: true });

  if (runtime.version !== 2 || desktop.version !== 2) {
    throw new Error(
      `Unexpected ende doc JSON version ${runtime.version}/${desktop.version}`,
    );
  }

  const symbols = Object.values(runtime.nodes).flatMap((node) => node.symbols);
  const endeNamespace = (list: JsonObject[]) =>
    ((list.find((symbol) => symbol.name === "Ende")!
      .declarations as JsonObject[])[0]
      .def as JsonObject).elements as JsonObject[];
  const elements = endeNamespace(symbols);
  const known = new Set(elements.map((element) => element.name));

  for (
    const element of endeNamespace(Object.values(desktop.nodes)[0].symbols)
  ) {
    if (known.has(element.name)) continue;

    for (const declaration of element.declarations as JsonObject[]) {
      declaration.desktop = true;
    }

    elements.push(element);
  }

  const data = {
    ende: sources.ende,
    symbols: slim(symbols, () => undefined),
  };
  return JSON.stringify(data) + "\n";
}

/** A file of a published JSR package as `@ende/<package>/<version>/<path>`, the path of its page on jsr.io. */
function fromJsr(filename: string): string | undefined {
  return filename.startsWith("https://jsr.io/@ende/")
    ? filename.slice("https://jsr.io/".length)
    : undefined;
}

async function stdPackage(name: string, version: string): Promise<string> {
  const meta = await fetchJson<{ exports: Record<string, string> }>(
    `https://jsr.io/@ende/${name}/${version}_meta.json`,
  );
  const base = `jsr:@ende/${name}@${version}`;
  const specifier = (path: string) =>
    path === "." ? base : `${base}/${path.replace(/^\.\//, "")}`;
  const dir = await Ende.makeTempDir();
  // Documenting doesn't run any code, so the minimum dependency age (which
  // holds back versions published in the last day) is turned off. It's set
  // through the environment because `ende doc` ignores the
  // `--minimum-dependency-age` flag. --no-config keeps the docs' own ende.json
  // out of it.
  const output = JSON.parse(
    await run(dir, [
      "doc",
      "--json",
      "--no-config",
      ...Object.keys(meta.exports).map(specifier),
    ], { ENDE_MINIMUM_DEPENDENCY_AGE: "0" }),
  ) as DocOutput;
  await Ende.remove(dir, { recursive: true });

  const modules = Object.entries(meta.exports).map(([path, file]) => {
    const node = output.nodes[specifier(path)];
    if (node === undefined) {
      throw new Error(`ende doc returned nothing for @ende/${name} ${path}`);
    }

    return {
      path: path.replace(/^\.\/?/, ""),
      file: `@ende/${name}/${version}/${file.replace(/^\.\//, "")}`,
      doc: slim(node.module_doc ?? null, fromJsr),
      // Declarations that aren't exported are only the targets of type
      // references; the reference shows those by name.
      symbols: slim(
        node.symbols.filter((symbol) =>
          (symbol.declarations as JsonObject[]).some((declaration) =>
            declaration.declarationKind !== "private"
          )
        ),
        fromJsr,
      ),
    };
  });

  return JSON.stringify({ name: `@ende/${name}`, version, modules }) + "\n";
}

async function generate(sources: Sources): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  files.set("sources.json", JSON.stringify(sources, null, 2) + "\n");
  files.set("builtin.json", await builtin(sources));

  for (const [name, version] of Object.entries(sources.std)) {
    files.set(`std/${name}.json`, await stdPackage(name, version));
  }

  return files;
}

async function existing(): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  for (const dir of ["./", "std/"]) {
    try {
      for await (const entry of Ende.readDir(new URL(dir, out))) {
        if (entry.isFile && entry.name.endsWith(".json")) {
          const path = dir === "./" ? entry.name : `${dir}${entry.name}`;
          files.set(path, await Ende.readTextFile(new URL(path, out)));
        }
      }
    } catch (error) {
      if (!(error instanceof Ende.errors.NotFound)) throw error;
    }
  }

  return files;
}

const sources: Sources = args.update
  ? await latestSources()
  : JSON.parse(await Ende.readTextFile(sourcesFile));
const generated = await generate(sources);

if (args.check) {
  const committed = await existing();
  const stale = [...new Set([...generated.keys(), ...committed.keys()])]
    .filter((path) => generated.get(path) !== committed.get(path))
    .sort();

  if (stale.length > 0) {
    console.error(
      `_reference/ is out of date (${
        stale.join(", ")
      }). Run: ende task gen:reference`,
    );
    Ende.exit(1);
  }

  console.log(`_reference/ is up to date (${generated.size} files)`);
} else {
  await Ende.remove(out, { recursive: true }).catch((error) => {
    if (!(error instanceof Ende.errors.NotFound)) throw error;
  });
  await Ende.mkdir(new URL("std/", out), { recursive: true });

  for (const [path, text] of generated) {
    await Ende.writeTextFile(new URL(path, out), text);
  }

  const bytes = [...generated.values()].reduce(
    (sum, text) => sum + text.length,
    0,
  );
  console.log(
    `Wrote ${generated.size} files to _reference/ (${
      (bytes / 1e6).toFixed(1)
    } MB)`,
  );
}
