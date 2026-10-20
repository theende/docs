import type { TocEntry } from "../_lib/types.ts";

/** The page's table of contents: its `##` headings with their `###` ones. */
export default function Toc({ toc }: { toc: TocEntry[] }) {
  const groups: { entry: TocEntry; children: TocEntry[] }[] = [];

  for (const entry of toc) {
    if (entry.depth === 2)
      groups.push({ children: [], entry });
    else if (entry.depth === 3)
      groups.at(-1)?.children.push(entry);
  }

  if (groups.length === 0) return null;

  return (
    <nav aria-labelledby="on-this-page">
      <h2 id="on-this-page">On this page</h2>
      <ul>
        {groups.map(({ entry, children }) => (
          <li>
            <a href={`#${entry.slug}`}>{entry.text}</a>
            {children.length > 0 && (
              <ul>
                {children.map((child) => (
                  <li>
                    <a href={`#${child.slug}`}>{child.text}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
