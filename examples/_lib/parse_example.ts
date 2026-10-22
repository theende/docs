import { DIFFICULTIES, Example, ExampleFile, TAGS } from "./types.ts";

export function parseExample(id: string, file: string): Example {
  // Extract the multi line JS doc comment at the top of the file
  const [, jsdoc, rest] = file.match(/^\s*\/\*\*(.*?)\*\/\s*(.*)/s) || [];
  // Extract the @key value pairs from the JS doc comment
  let description = "";
  const kvs: Record<string, string> = {};
  const resources = [];

  for (let line of jsdoc.split("\n")) {
    line = line.trim().replace(/^\*/, "").trim();
    const [, key, value] = line.match(/^\s*@(\w+)\s+(.*)/) || [];

    if (key) {
      if (key === "resource")
        resources.push(value);
      else
        kvs[key] = value.trim();
    } else {
      description += " " + line;
    }
  }

  description = description.trim();

  // Separate the code into snippets.
  const files: ExampleFile[] = [
    {
      name: "",
      snippets: []
    }
  ];

  let code = "";
  let currentFile = files[0];
  let parseMode = "code";
  let text = "";

  for (const line of rest.split("\n")) {
    const trimmedLine = line.trim();

    if (parseMode == "code") {
      if (line.startsWith("// File:")) {
        if (text || code.trimEnd()) {
          code = code.trimEnd();
          currentFile.snippets.push({ code, text });
          text = "";
          code = "";
        }

        const name = line.slice(8).trim();

        if (currentFile.snippets.length == 0) {
          currentFile.name = name;
        } else {
          currentFile = {
            name,
            snippets: []
          };

          files.push(currentFile);
        }
      } else if (line.startsWith("/* File:")) {
        if (text || code.trimEnd()) {
          code = code.trimEnd();
          currentFile.snippets.push({ text, code });
          text = "";
          code = "";
        }

        const name = line.slice(8).trim();

        if (currentFile.snippets.length == 0) {
          currentFile.name = name;
        } else {
          currentFile = {
            name,
            snippets: []
          };

          files.push(currentFile);
        }

        parseMode = "file";
      } else if (
        trimmedLine.startsWith("// ende-lint-ignore") ||
        trimmedLine.startsWith("//ende-lint-ignore") ||
        trimmedLine.startsWith("// ende-fmt-ignore") ||
        trimmedLine.startsWith("//ende-fmt-ignore")
      ) {
        // skip ende directives
      } else if (trimmedLine.startsWith("//-")) {
        code += line.replace("//-", "//") + "\n";
      } else if (trimmedLine.startsWith("//")) {
        if (text || code.trimEnd()) {
          code = code.trimEnd();
          currentFile.snippets.push({ text, code });
        }

        text = commentLine(trimmedLine);
        code = "";
        parseMode = "comment";
      } else {
        code += line + "\n";
      }
    } else if (parseMode == "comment") {
      if (
        trimmedLine.startsWith("// ende-lint-ignore") ||
        trimmedLine.startsWith("//ende-lint-ignore") ||
        trimmedLine.startsWith("// ende-fmt-ignore") ||
        trimmedLine.startsWith("//ende-fmt-ignore")
      ) {
        // skip ende directives
      } else if (trimmedLine.startsWith("//")) {
        text += "\n" + commentLine(trimmedLine);
      } else {
        code += line + "\n";
        parseMode = "code";
      }
    } else if (parseMode == "file") {
      if (line == "*/")
        parseMode = "code";
      else
        code += line + "\n";
    }
  }

  if (text || code.trimEnd()) {
    code = code.trimEnd();
    currentFile.snippets.push({ text, code });
  }

  for (const file of files) {
    for (const snippet of file.snippets)
      snippet.text = commentToMarkdown(snippet.text);
  }

  if (!kvs.title)
    throw new Error("Missing title in JS doc comment.");

  const tags = kvs.tags.split(",").map((s) => s.trim() as keyof typeof TAGS);

  for (const tag of tags) {
    if (!TAGS[tag])
      throw new Error(`Unknown tag "${tag}"`);
  }

  const difficulty = kvs.difficulty as keyof typeof DIFFICULTIES;

  if (!DIFFICULTIES[difficulty])
    throw new Error(`Unknown difficulty "${difficulty}"`);

  const additionalResources: [string, string][] = [];

  for (const resource of resources) {
    // @resource {https://jsr.io/@ende/http/server/~/} std/http/server
    const [_, url, title] = resource.match(/^\{(.*?)\}\s(.*)/) || [];

    if (!url || !title)
      throw new Error(`Invalid resource: ${resource}`);

    additionalResources.push([url, title]);
  }

  return {
    additionalResources,
    description,
    difficulty,
    files,
    group: kvs.group || "Misc",
    id,
    run: kvs.run,
    sortOrder: kvs.sortOrder || 999999,
    tags,
    title: kvs.title
  };
}

/** Strips the `//` marker and one following space, keeping any further indentation. */
function commentLine(trimmedLine: string): string {
  return trimmedLine.slice(2).replace(/^ /, "");
}

const INDENTED = /^\s{2,}\S/;

/** Turns comment text into Markdown, fencing runs of indented lines as code blocks. */
export function commentToMarkdown(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!INDENTED.test(lines[i])) {
      out.push(lines[i]);
      continue;
    }

    // A blank line between two indented lines stays inside the block.
    const block: string[] = [];

    while (
      i < lines.length &&
      (INDENTED.test(lines[i]) || (lines[i] === "" && INDENTED.test(lines[i + 1] ?? "")))
    ) {
      block.push(lines[i]);
      i++;
    }

    i--;

    const indent = Math.min(...block.filter((l) => l).map((l) => l.search(/\S/)));
    out.push("```", ...block.map((l) => l.slice(indent)), "```");
  }

  return out.join("\n");
}
