import { extract } from "@ende/front-matter/yaml";
import { slug } from "@ende/markdown/slug";
import { featuredItems, sidebar } from "./_data.ts";
import { loadExamples } from "./_lib/examples.ts";

export const title = "Ende examples and tutorials";

/** The first sentence of a description, skipping a leading "Warning: …" one. */
function firstSentence(text: string | undefined): string | undefined {
  const normalized = text?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;

  const sentences = normalized.match(/[^.!?]+(?:[.!?](?=\s|$)|$)/g) ??
    [normalized];
  return (sentences.find((s) => !/^\s*warning[:\s]/i.test(s)) ?? sentences[0])
    .trim();
}

/** One-sentence descriptions by URL, from the example scripts and the tutorials' front matter. */
async function descriptions(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  for (const example of await loadExamples()) {
    const description = firstSentence(example.parsed.description);
    if (description) result[`/examples/${example.label}/`] = description;
  }

  const tutorials = new URL("./tutorials/", import.meta.url);

  for await (const entry of Ende.readDir(tutorials)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;

    const { attrs } = extract<{ url?: string; description?: string }>(
      await Ende.readTextFile(new URL(entry.name, tutorials)),
    );
    const description = firstSentence(attrs.description);
    if (attrs.url && description) result[attrs.url] = description;
  }

  return result;
}

/** The examples landing page: featured items, then every item by category. */
export default async function ExamplesIndex() {
  const described = await descriptions();

  return (
    <>
      <p>
        A collection of walkthrough tutorials, examples, videos and guides to
        teach you about the Ende runtime and how to use it with your favorite
        tools.
      </p>
      <section>
        <h2 id="featured">Featured</h2>
        <ul>
          {featuredItems.map((item) => (
            <li>
              <a href={item.href}>{item.title}</a> ({item.type}):{" "}
              {item.description}
            </li>
          ))}
        </ul>
      </section>
      <nav aria-label="Example categories">
        <ul>
          {sidebar.map((category) => (
            <li>
              <a href={`#${slug(category.title)}`}>{category.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      {sidebar.map((category) => (
        <section>
          <h2 id={slug(category.title)}>{category.title}</h2>
          <ul>
            {category.items.map((item) => (
              <li data-category={item.type}>
                <a href={item.href}>{item.title}</a> ({item.type})
                {described[item.href] && <>: {described[item.href]}</>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
