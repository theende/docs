import { parseExample } from "./parse_example.ts";
import type { ExampleFromFileSystem } from "./types.ts";

/** Every example script in `examples/scripts/`, parsed, by file name. */
export async function loadExamples(): Promise<ExampleFromFileSystem[]> {
  const dir = new URL("../scripts/", import.meta.url);
  const examples: ExampleFromFileSystem[] = [];

  for await (const entry of Ende.readDir(dir)) {
    if (!entry.isFile || !entry.name.endsWith(".ts"))
      continue;

    const content = await Ende.readTextFile(new URL(entry.name, dir));

    examples.push({
      content,
      label: entry.name.replace(/\.ts$/, ""),
      name: entry.name,
      parsed: parseExample(entry.name, content)
    });
  }

  return examples.sort((a, b) => a.name.localeCompare(b.name));
}
