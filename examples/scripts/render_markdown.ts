/**
 * @title Render markdown to HTML
 * @difficulty intermediate
 * @tags cli
 * @run -W <url>
 * @resource {https://jsr.io/@ende/markdown} @ende/markdown on JSR
 * @resource {/examples/front_matter/} Example: Extract front matter from markdown
 * @group Web frameworks and libraries
 *
 * The @ende/markdown module parses CommonMark and GitHub Flavored Markdown
 * and renders it to HTML: tables, task lists, footnotes and GitHub's alerts.
 * It is the renderer behind this documentation site.
 */
import { parse, render, toc } from "jsr:@ende/markdown@^2026.10.17";

const markdown = `# Release notes

Ende **2026.10.17** is here. Highlights:

- [x] Stable APIs
- [ ] A code block:

\`\`\`ts
const greeting: string = "hello";
\`\`\`

> [!TIP]
> Run \`ende upgrade\` to get it.
`;

// parse turns the source into a syntax tree. The gfm option enables tables,
// task lists, strikethrough, footnotes and alerts.
const ast = parse(markdown, { gfm: true });

// render returns an HTML fragment, not a full document. Headings get ids,
// so they can be linked to.
const body = render(ast);
console.log(body.includes('<h1 id="release-notes">')); // true

// toc lists the headings, for a table of contents.
console.log(toc(ast)); // [ { depth: 1, text: "Release notes", slug: "release-notes" } ]

// To produce a standalone page, wrap the fragment in a document.
const page = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Release notes</title></head>
  <body>${body}</body>
</html>`;

await Ende.writeTextFile("release-notes.html", page);
console.log("wrote release-notes.html");

// Raw HTML in the source renders as written by default. For untrusted
// input, pass { html: "escape" } or { html: "strip" } to render.
