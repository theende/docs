import type { Sidebar, SidebarItem } from "../_lib/types.ts";

function Link({ item, url }: { item: SidebarItem; url: string }) {
  const href = item.externalUrl ?? item.href;

  if (href === undefined) return <span>{item.title}</span>;

  return (
    <a href={href} aria-current={href === url ? "page" : undefined}>
      {item.title}
    </a>
  );
}

function Items({ items, url }: { items: SidebarItem[]; url: string }) {
  return (
    <ul>
      {items.map((item) => (
        <li>
          <Link item={item} url={url} />
          {item.items && item.items.length > 0 && (
            <Items items={item.items} url={url} />
          )}
        </li>
      ))}
    </ul>
  );
}

/** A section's sidebar: its groups of links, the current page marked. */
export default function SidebarNav(
  { sidebar, url }: { sidebar: Sidebar; url: string },
) {
  return (
    <nav aria-label="Section">
      {sidebar.map((section) => (
        <section>
          {section.title && (
            <h2>
              {section.href
                ? (
                  <a
                    href={section.href}
                    aria-current={section.href === url ? "page" : undefined}
                  >
                    {section.title}
                  </a>
                )
                : section.title}
            </h2>
          )}
          {section.items && <Items items={section.items} url={url} />}
        </section>
      ))}
    </nav>
  );
}
