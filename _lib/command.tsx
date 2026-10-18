import CLI_REFERENCE from "../runtime/reference/cli/_commands_reference.json" with {
  type: "json",
};
import { markdown } from "./markdown.ts";
import type { TocEntry } from "./types.ts";

interface Arg {
  name: string;
  short: string | null;
  long: string | null;
  required: boolean;
  help: string | null;
  help_heading: string | null;
  usage: string;
}

interface Command {
  name: string;
  about: string | null;
  usage: string;
  args: Arg[];
}

// An ANSI escape sequence, as `ende <command> --help` colors its output.
const ANSI = "\\u001b\\[[0-9;]*m";
const ANSI_RE = new RegExp(ANSI, "g");
const SUBSEQUENT_ANSI_RE = new RegExp(`(?:${ANSI})(?:${ANSI})`, "g");
const ENCAPSULATED_ANSI = `(${ANSI})(.+?)(${ANSI})`;
const ENCAPSULATED_ANSI_RE = new RegExp(ENCAPSULATED_ANSI, "g");
const START_AND_END_ANSI_RE = new RegExp(`^(?:${ANSI}).+?(?:${ANSI})$`);
const SUBSEQUENT_ENCAPSULATED_ANSI_RE = new RegExp(
  `${ENCAPSULATED_ANSI}( ?)${ENCAPSULATED_ANSI}`,
  "g",
);

const FLAGS_RE = /[^`]--\S+/g;

/** The value a flag takes, from its usage: `--config <FILE>` → `FILE`. */
function valueType(usage: string): string | null {
  const match = usage.match(/<([^>]+)>/);
  return match ? match[1].replace(/\.\.\.$/, "").trim() : null;
}

/** Turns colored help text into Markdown: green is a heading, gray/cyan/bold is code. */
function aboutMarkdown(about: string): string {
  let text = about.replaceAll(
    SUBSEQUENT_ENCAPSULATED_ANSI_RE,
    (_, _open1, text1, _close1, space, open2, text2, close2) =>
      `${open2}${text1}${space}${text2}${close2}`,
  ).replaceAll(SUBSEQUENT_ANSI_RE, "");

  let lines = text.split("\n");
  const readMore = lines.findLastIndex((line) =>
    line.toLowerCase().replaceAll(ANSI_RE, "").trim().startsWith("read more:")
  );
  if (readMore !== -1) lines = lines.slice(0, readMore);

  text = lines.join("\n");

  return text.replaceAll(
    ENCAPSULATED_ANSI_RE,
    (_, open: string, inner: string, _close, offset: number, all: string) => {
      if (open === "\u001b[32m") return `### ${inner}`;

      if (
        open === "\u001b[38;5;245m" || open === "\u001b[36m" ||
        open === "\u001b[1m" || open === "\u001b[22m"
      ) {
        const line = all.slice(0, offset).split("\n").length - 1;
        return START_AND_END_ANSI_RE.test(all.split("\n")[line].trim())
          ? "\n```\n" + inner + "\n```\n\n"
          : "`" + inner + "`";
      }

      return inner;
    },
  );
}

function Option({ group, arg }: { group: string; arg: Arg }) {
  const id = `${group}-${arg.long}`;
  const type = valueType(arg.usage);
  const optional = arg.usage.includes("[=<") || arg.usage.includes("[<");
  let help = arg.help ? arg.help.replaceAll(ANSI_RE, "") : "";
  let docs: string | null = null;

  const helpLines = help.split("\n");
  const docsLine = helpLines.findLastIndex((line) =>
    line.toLowerCase().trim().startsWith("docs:")
  );
  if (docsLine !== -1) {
    help = helpLines.slice(0, docsLine).join("\n");
    docs = helpLines[docsLine].trim().slice("docs:".length).trim();
  }

  const flag = arg.short ? `--${arg.long}, -${arg.short}` : `--${arg.long}`;

  return (
    <div id={id}>
      <h3>
        <code>{docs ? <a href={docs}>{flag}</a> : flag}</code>
        {type && <span>{` <${type}>`}{optional && " (optional)"}</span>}
      </h3>
      {help &&
        markdown(
          help.replaceAll(FLAGS_RE, "`$&`") +
            (help.endsWith(".") || help.endsWith("]") ? "" : "."),
        )}
    </div>
  );
}

/** The usage, description and options of `ende <name>`, and their headings for the ToC. */
export function renderCommand(
  name: string,
): { rendered: unknown; toc: TocEntry[] } {
  const command = (CLI_REFERENCE.subcommands as Command[]).find((command) =>
    command.name === name
  );

  if (!command) throw new Error(`No CLI command named ${name}`);

  const toc: TocEntry[] = [];
  const options: Record<string, Arg[]> = {};

  for (const arg of command.args) {
    if (arg.help_heading === "Unstable options" || !arg.long) continue;

    (options[arg.help_heading ?? "Options"] ??= []).push(arg);
  }

  const rendered = (
    <section>
      <p>Command line usage:</p>
      <pre><code>{command.usage.replaceAll(ANSI_RE, "").slice("usage: ".length)}</code></pre>
      {command.about && markdown(aboutMarkdown(command.about))}
      {Object.entries(options).map(([heading, flags]) => {
        const id = heading.toLowerCase().replace(/\s/g, "-");
        toc.push({ depth: 2, text: heading, slug: id });

        return (
          <section>
            <h2 id={id}>{heading}</h2>
            {flags
              .toSorted((a, b) => a.long!.localeCompare(b.long!))
              .map((arg) => <Option group={id} arg={arg} />)}
          </section>
        );
      })}
    </section>
  );

  return { rendered, toc };
}
