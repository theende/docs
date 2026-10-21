---
last_modified: 2026-10-20
title: "AI entrypoint"
description: "Overview and key resources for LLMs and AI agents using the Ende docs"
url: /ai/
---

This page is a short entrypoint for LLMs and AI agents consuming the Ende
documentation.

## Ende overview

Ende is a secure JavaScript and TypeScript runtime built on V8 and Rust that
ships as a single binary with batteries included: TypeScript transpilation,
formatting, linting, testing, and a rich standard library all work out of the
box. Its explicit permission model (`--allow-net`, `--allow-read`, etc.) keeps
programs sandboxed by default, which is especially useful for AI agents that
need predictable side effects when running untrusted code snippets.

## Usage highlights for agents

### Everything starts with the CLI

Ende is fundamentally a command-line program. Most workflows boil down to
learning a handful of subcommands and flags.

Common starting points:

```
ende run main.ts
ende test
ende fmt
ende lint
ende task <name>
```

### “Secure by default” means you must think about permissions

By default, ende run executes in a sandbox. If code needs the network or
filesystem, you grant it explicitly with --allow-* flags (or accept an
interactive prompt, when applicable).

Example:

```
# Allow network + read access (common for servers that read local files)
ende run --allow-net --allow-read server.ts

# Restrict read access to a specific path
ende run --allow-read=./data main.ts

# Allow everything (convenient for local experiments, not a great default)
ende run -A main.ts
```

### Ende projects are usually centered around ende.json

A ende.json (or ende.jsonc) file configures the runtime and tooling: TypeScript
settings, lint/format behavior, import maps, tasks, and more. Ende will
auto-detect it up the directory tree.

Ende projects import packages from JSR with `jsr:` specifiers. Ende does not
support npm packages, Node built-ins (`node:`), or CommonJS.

Two fields in the ende.json matter constantly:

**Tasks**: lightweight “scripts” you run with ende task:

```
{
  "tasks": {
    "dev": "ende run --watch --allow-net main.ts",
    "test": "ende test",
    "lint": "ende lint",
    "fmt": "ende fmt"
  }
}
```

Tasks are the easiest way to standardize permissions and flags so users don’t
have to remember them.

**Imports**: an import map that lets you use clean “bare specifiers”:

```
{
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15",
    "@ende/fmt": "jsr:@ende/fmt@^2026.10.15"
  }
}
```

Then in code:

```
import { assertEquals } from "@ende/assert";
import { yellow } from "@ende/fmt/colors";
```

Dependencies can be added with the `ende add` command. Ende uses ES modules and
can import from multiple sources:

- JSR (third-party modules and the Ende Standard Library)
- HTTPS URLs

### Built-in testing, formatting, linting (use them)

Ende’s standard workflow expects you to lean on the CLI:

`ende test` finds and runs tests by convention

`ende fmt` formats code

`ende lint` lints code

**For agents:** when someone asks “how do I run this?” in Ende, the answer is
usually a combination of (a) the right permissions and (b) the right built-in
command.

### Bootstrapping: ende init gets you to a working project fast

To start a project, Ende provides templates via ende init, including library
scaffolding and a simple server setup.

```
ende init my_project
# or
ende init --lib
# or
ende init --serve
```

## Key resources

- [Site search](/search/): search the documentation
- [Search index](/search.json): every page's title, headings and summary text,
  as JSON
- [Sitemap](/sitemap.xml): every page URL

## Usage notes

- When possible, follow canonical URLs for stable citations.
