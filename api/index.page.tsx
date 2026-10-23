import { raw } from "@ende/satz/jsx-runtime";
import { endeCategories, webCategories } from "../_lib/reference/categories.ts";
import { type Builtin, categories, loadBuiltin, loadStd, type Section } from "../_lib/reference/doc.ts";
import { docHtml, type Rewrite } from "../_lib/reference/markdown.ts";
import { symbolDescription, SymbolList, symbolToc, SymbolView } from "../_lib/reference/render.tsx";
import type { Sidebar } from "../_lib/types.ts";

const SECTIONS: {
  descriptions: Record<string, string>;
  intro: string;
  section: Exclude<Section, "std">;
  title: string;
}[] = [
  {
    descriptions: endeCategories,
    intro:
      "The `Ende` global holds the APIs that aren’t web standards: files, networking, subprocesses, permissions, testing and more. `Deno` is an alias of `Ende`.",
    section: "ende",
    title: "Ende namespace"
  },
  {
    descriptions: webCategories,
    intro:
      "The web standard globals Ende implements, such as `fetch`, streams, URLs, Web Crypto, WebSockets and WebGPU.",
    section: "web",
    title: "Web platform APIs"
  }
];

function sidebar(builtin: Builtin): Sidebar {
  return [{
    href: "/api/",
    items: [
      ...SECTIONS.map(({ section, title }) => ({
        href: `/api/${section}/`,
        items: categories(builtin.pages, section).map((category) => ({
          href: category.url,
          title: category.name
        })),
        title
      })),
      { href: "/runtime/reference/std/", title: "Standard Library" }
    ],
    title: "API reference"
  }];
}

/** The API reference for the built-ins: indexes, categories and one page per symbol. */
export default async function* () {
  const builtin = await loadBuiltin();
  const std = await loadStd();
  const rewrite: Rewrite = (href) => std.fromJsrUrl(href);
  const side = sidebar(builtin);
  const markdown = (text: string) => raw(docHtml(text, builtin.lookup, rewrite));

  yield {
    content: (
      <>
        <p>
          The reference is generated from Ende’s own type declarations
          {builtin.ende ? ` (Ende ${builtin.ende})` : ""} and the Standard Library’s published packages on JSR.
        </p>
        <ul>
          {SECTIONS.map(({ section, title, intro }) => (
            <li>
              <a href={`/api/${section}/`}>{title}</a> — {markdown(intro)}
            </li>
          ))}
          <li>
            <a href="/runtime/reference/std/">Standard Library</a> — the <code>@ende/*</code> packages on JSR.
          </li>
        </ul>
      </>
    ),
    description: "The APIs built into Ende and its Standard Library.",
    sidebar: side,
    title: "API reference",
    url: "/api/"
  };

  for (const { descriptions, intro, section, title } of SECTIONS) {
    const groups = categories(builtin.pages, section);

    yield {
      content: (
        <>
          {markdown(intro)}
          {groups.map((group) => (
            <section>
              <h2 id={group.slug}>
                <a href={group.url}>{group.name}</a>
              </h2>
              <SymbolList pages={group.pages}/>
            </section>
          ))}
        </>
      ),
      description: intro.replaceAll("`", ""),
      sidebar: side,
      toc: groups.map((group) => ({
        depth: 2,
        slug: group.slug,
        text: group.name
      })),
      title,
      url: `/api/${section}/`
    };

    for (const group of groups) {
      yield {
        content: (
          <>
            {descriptions[group.name] && markdown(descriptions[group.name])}
            <SymbolList pages={group.pages}/>
          </>
        ),
        description: descriptions[group.name]?.split("\n")[0],
        sidebar: side,
        title: `${group.name} — ${title}`,
        url: group.url
      };
    }
  }

  for (const page of builtin.all) {
    yield {
      content: <SymbolView page={page} rewrite={rewrite}/>,
      description: symbolDescription(page),
      sidebar: side,
      title: page.title,
      toc: symbolToc(page),
      url: page.url
    };
  }
}
