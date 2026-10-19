import { raw } from "@ende/satz/jsx-runtime";
import { endeCategories, webCategories } from "../_lib/reference/categories.ts";
import { type Builtin, categories, loadBuiltin, loadStd, type Section } from "../_lib/reference/doc.ts";
import { docHtml, type Rewrite } from "../_lib/reference/markdown.ts";
import { symbolDescription, SymbolList, symbolToc, SymbolView } from "../_lib/reference/render.tsx";
import type { Sidebar } from "../_lib/types.ts";

const SECTIONS: {
  section: Exclude<Section, "std">;
  title: string;
  intro: string;
  descriptions: Record<string, string>;
}[] = [
  {
    section: "ende",
    title: "Ende namespace",
    intro:
      "The `Ende` global holds the APIs that aren't web standards: files, networking, subprocesses, permissions, testing and more. `Deno` is an alias of `Ende`.",
    descriptions: endeCategories
  },
  {
    section: "web",
    title: "Web platform APIs",
    intro:
      "The web standard globals Ende implements, such as `fetch`, streams, URLs, Web Crypto, WebSockets and WebGPU.",
    descriptions: webCategories
  }
];

function sidebar(builtin: Builtin): Sidebar {
  return [{
    title: "API reference",
    href: "/api/",
    items: [
      ...SECTIONS.map(({ section, title }) => ({
        title,
        href: `/api/${section}/`,
        items: categories(builtin.pages, section).map((category) => ({
          title: category.name,
          href: category.url
        }))
      })),
      { title: "Standard library", href: "/runtime/reference/std/" }
    ]
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
    url: "/api/",
    title: "API reference",
    description: "The APIs built into Ende and its standard library.",
    sidebar: side,
    content: (
      <>
        <p>
          The reference is generated from Ende's own type declarations
          {builtin.ende ? ` (Ende ${builtin.ende})` : ""} and the standard library's published packages on JSR.
        </p>
        <ul>
          {SECTIONS.map(({ section, title, intro }) => (
            <li>
              <a href={`/api/${section}/`}>{title}</a> — {markdown(intro)}
            </li>
          ))}
          <li>
            <a href="/runtime/reference/std/">Standard library</a> — the <code>@ende/*</code> packages on JSR.
          </li>
        </ul>
      </>
    )
  };

  for (const { section, title, intro, descriptions } of SECTIONS) {
    const groups = categories(builtin.pages, section);

    yield {
      url: `/api/${section}/`,
      title,
      description: intro.replaceAll("`", ""),
      sidebar: side,
      toc: groups.map((group) => ({
        depth: 2,
        text: group.name,
        slug: group.slug
      })),
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
      )
    };

    for (const group of groups) {
      yield {
        url: group.url,
        title: `${group.name} — ${title}`,
        description: descriptions[group.name]?.split("\n")[0],
        sidebar: side,
        content: (
          <>
            {descriptions[group.name] && markdown(descriptions[group.name])}
            <SymbolList pages={group.pages}/>
          </>
        )
      };
    }
  }

  for (const page of builtin.all) {
    yield {
      url: page.url,
      title: page.title,
      description: symbolDescription(page),
      sidebar: side,
      toc: symbolToc(page),
      content: <SymbolView page={page} rewrite={rewrite}/>
    };
  }
}
