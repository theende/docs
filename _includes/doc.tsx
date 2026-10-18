import type { LayoutProps } from "@ende/satz";
import SidebarNav from "../_components/Sidebar.tsx";
import Toc from "../_components/Toc.tsx";
import { renderCommand } from "../_lib/command.tsx";
import type { Sidebar, SidebarItem, TocEntry } from "../_lib/types.ts";

export const layout = "layout.tsx";

/** The section's sidebar in reading order, for the previous and next links. */
function readingOrder(sidebar: Sidebar): { title: string; href: string }[] {
  const order: { title: string; href: string }[] = [];
  const seen = new Set<string>();
  const add = (title: string, href: string | undefined) => {
    if (!href?.startsWith("/") || seen.has(href)) return;

    seen.add(href);
    order.push({ title, href });
  };
  const visit = (items: SidebarItem[] = []) => {
    for (const item of items) {
      if (!item.externalUrl) add(item.title, item.href);
      visit(item.items);
    }
  };

  for (const section of sidebar) {
    if (section.title) add(section.title, section.href);
    visit(section.items);
  }

  return order;
}

function lastModified(value: unknown): Date | undefined {
  const date = value instanceof Date
    ? value
    : typeof value === "string"
    ? new Date(value)
    : undefined;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

/** A documentation page: sidebar, the page itself, and its table of contents. */
export default function Doc(props: LayoutProps) {
  const sidebar = (props.sidebar as Sidebar | undefined) ?? [];
  const title = props.title as string | undefined;
  const command = props.command as string | undefined;
  const { rendered, toc: commandToc } = command
    ? renderCommand(command)
    : { rendered: null, toc: [] };
  const toc = [...((props.toc as TocEntry[] | undefined) ?? []), ...commandToc];
  const order = readingOrder(sidebar);
  const index = order.findIndex((item) => item.href === props.url);
  const previous = index > 0 ? order[index - 1] : undefined;
  const next = index !== -1 ? order[index + 1] : undefined;
  const updated = lastModified(props.last_modified);
  const source = props.page.src.endsWith(".md") ? props.page.src : undefined;

  return (
    <div>
      {sidebar.length > 0 && <SidebarNav sidebar={sidebar} url={props.url} />}
      <main id="content" tabIndex={-1}>
        <article>
          {title && <h1>{title}</h1>}
          {props.content}
          {rendered}
        </article>
        <footer>
          {updated && (
            <p>
              Last updated on{" "}
              <time datetime={updated.toISOString().slice(0, 10)}>
                {updated.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            </p>
          )}
          {source && (
            <p>
              <a
                href={`https://github.com/theende/docs/edit/primary/${source}`}
              >
                Edit this page
              </a>
            </p>
          )}
          {(previous || next) && (
            <nav aria-label="Previous and next page">
              {previous && (
                <a href={previous.href} rel="prev">← {previous.title}</a>
              )} {next && <a href={next.href} rel="next">{next.title} →</a>}
            </nav>
          )}
        </footer>
      </main>
      {toc.length > 0 && <Toc toc={toc} />}
    </div>
  );
}
