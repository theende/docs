export const title = "Search";
export const url = "/search/";
export const sidebar = [];
export const sitemap = false;
export const search = false;

/** The search page; js/search.ts fills in the results. */
export default function Search() {
  return (
    <>
      <form id="search-form" role="search">
        <input
          type="search"
          id="search-query"
          name="q"
          aria-label="Search the docs"
        />
        <button type="submit">Search</button>
      </form>
      <p id="search-status" role="status"></p>
      <ol id="search-results"></ol>
      <script type="module" src="/js/search.js"></script>
    </>
  );
}
