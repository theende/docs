// Checks the internal links of the built site (`_site`): every `href` and
// `src` that points into the site must name a file that exists, and a
// `#fragment` must name an `id` (or `name`) in the page it lands on, after
// following redirect pages. Redirect pages are checked too: the go links
// (`/go/<name>/`) are printed by the CLI.
//
//   ende task build && ende task check:links

import { walk } from "@ende/fs/walk";
import { join, relative, SEPARATOR } from "@ende/path";

const SITE = new URL("../_site/", import.meta.url);
const root = decodeURIComponent(SITE.pathname);
const ATTRIBUTE = /\s(?:href|src)="([^"]*)"/g;
const ID = /\s(?:id|name)="([^"]*)"/g;
const REDIRECT = /<meta http-equiv="refresh" content="0; url=([^"]*)">/;

const pages = new Map<string, string>();

/** The HTML of the page at `path` (relative to the site), or `undefined`. */
async function read(path: string): Promise<string | undefined> {
  if (pages.has(path)) return pages.get(path);

  let html: string | undefined;

  try {
    html = await Ende.readTextFile(join(root, path));
  } catch (error) {
    if (!(error instanceof Ende.errors.NotFound)) throw error;
  }

  if (html !== undefined) pages.set(path, html);

  return html;
}

/** The file a URL path names: `/a/` and `/a` are `a/index.html` when that exists. */
async function resolveFile(pathname: string): Promise<string | undefined> {
  const path = decodeURIComponent(pathname).replace(/^\//, "");
  const candidates = path === "" || path.endsWith("/")
    ? [`${path}index.html`]
    : [path, `${path}/index.html`];

  for (const candidate of candidates) {
    try {
      if ((await Ende.stat(join(root, candidate))).isFile) return candidate;
    } catch (error) {
      if (!(error instanceof Ende.errors.NotFound)) throw error;
    }
  }

  return undefined;
}

function unescape(text: string): string {
  return text.replaceAll("&quot;", '"').replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}

/** Why `link` (found on the page at `from`) is broken, or `undefined` when it isn't. */
async function check(link: string, from: URL): Promise<string | undefined> {
  let url = new URL(link, from);

  for (let hops = 0; hops < 5; hops++) {
    if (url.origin !== from.origin) return undefined;

    const file = await resolveFile(url.pathname);

    if (file === undefined) return "no such page";

    if (!file.endsWith(".html")) {
      return url.hash ? "a fragment on a file that isn't HTML" : undefined;
    }

    const html = (await read(file))!;
    const redirect = html.match(REDIRECT);

    if (redirect) {
      const target = new URL(unescape(redirect[1]), url);
      if (!target.hash) target.hash = url.hash;
      url = target;
      continue;
    }

    if (!url.hash) return undefined;

    const fragment = decodeURIComponent(url.hash.slice(1));
    const ids = new Set(
      [...html.matchAll(ID)].map((match) => unescape(match[1]))
    );

    return ids.has(fragment) ? undefined : `no #${fragment} on ${url.pathname}`;
  }

  return "too many redirects";
}

const broken: string[] = [];
let links = 0;

for await (const entry of walk(root, { exts: [".html"], includeDirs: false })) {
  const path = relative(root, entry.path).replaceAll(SEPARATOR, "/");
  const html = (await read(path))!;
  const base = new URL(
    "https://site.invalid/" + path.replace(/(^|\/)index\.html$/, "$1")
  );

  for (const [, raw] of html.matchAll(ATTRIBUTE)) {
    const link = unescape(raw);

    if (
      link === "" ||
      /^[a-z][a-z\d+.-]*:/i.test(link) &&
        !link.startsWith("https://site.invalid")
    ) continue;

    links++;
    const problem = await check(link, base);

    if (problem) broken.push(`/${path}: ${link} (${problem})`);
  }
}

if (broken.length > 0) {
  console.error(broken.join("\n"));
  console.error(`\n${broken.length} broken of ${links} internal links`);
  Ende.exit(1);
}

console.log(`All ${links} internal links resolve`);
