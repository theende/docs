import type { NavLink } from "../_lib/types.ts";

/** The site header: home link, top navigation and the search form. */
export default function Header(
  { navigation, url }: { navigation: NavLink[]; url: string },
) {
  return (
    <header>
      <a href="/">Deno Docs</a>
      <nav aria-label="Main">
        <ul>
          {navigation.map((link) => (
            <li>
              <a
                href={link.href}
                aria-current={url === link.href
                  ? "page"
                  : url.startsWith(link.href)
                  ? "location"
                  : undefined}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <form action="/search/" method="get" role="search">
        <input type="search" name="q" aria-label="Search the docs" />
        <button type="submit">Search</button>
      </form>
    </header>
  );
}
