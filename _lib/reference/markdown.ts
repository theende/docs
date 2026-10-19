// Renders the Markdown of doc comments: `{@link}` tags become links to the
// reference, code blocks are highlighted, and links to `@ende` packages' docs
// on jsr.io point at the matching page here.

import { parse, render } from "@ende/markdown";
import { slug } from "@ende/markdown/slug";
import { highlight } from "@ende/satz/highlight";
import type { Lookup } from "./doc.ts";

const LINK_TAG = /\{@link(code|plain)?\s+([^}\s|]+)(?:\s*\|\s*|\s+)?([^}]*)\}/g;

/** A URL for `href`: a jsr.io `@ende` doc link becomes the page here, if there's one. */
export type Rewrite = (href: string) => string | undefined;

function code(text: string): string {
  const fence = text.includes("`") ? "``" : "`";
  return `${fence}${text}${fence}`;
}

/** Turns `{@link Target text}` tags into Markdown links. */
export function resolveLinkTags(
  text: string,
  lookup: Lookup,
  rewrite: Rewrite
): string {
  return text.replace(LINK_TAG, (_, style, target: string, label: string) => {
    const shown = label.trim() || target;
    const isUrl = /^[a-z]+:\/\//i.test(target);
    const url = isUrl ? rewrite(target) ?? target : lookup(target);
    const inner = style === "code" ? code(shown) : shown;

    return url ? `[${inner}](${url})` : inner;
  });
}

/**
 * A doc comment's Markdown as HTML. With `headingIds` (for a module's doc,
 * which links to its own headings), headings get ids and `#Heading` links are
 * slugged to match.
 */
export function docHtml(
  text: string | undefined,
  lookup: Lookup,
  rewrite: Rewrite,
  headingIds = false
): string {
  if (!text?.trim()) return "";

  return render(parse(resolveLinkTags(text, lookup, rewrite), { gfm: true }), {
    headingIds,
    highlight: (source, lang) => lang ? highlight(source, lang) : undefined,
    rewriteLink: (href) =>
      headingIds && href.startsWith("#")
        ? `#${slug(decodeURIComponent(href.slice(1)))}`
        : rewrite(href) ?? href
  });
}
