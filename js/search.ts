// The search page: ranks /search.json for ?q= with satz's search client.
import type { SearchEntry, SearchResult } from "@ende/satz/search";

// Served by satz from @ende/satz/search; the type import above checks its use.
const { search } = (await import("/_satz/search.js" as string)) as {
  search: (entries: SearchEntry[], query: string) => SearchResult[];
};

const form = document.querySelector<HTMLFormElement>("#search-form");
const input = document.querySelector<HTMLInputElement>("#search-query");
const list = document.querySelector<HTMLOListElement>("#search-results");
const status = document.querySelector<HTMLParagraphElement>("#search-status");

const entries: SearchEntry[] = await (await fetch("/search.json")).json();

function show(query: string) {
  if (!list || !status) return;

  const results = search(entries, query).slice(0, 50);
  list.replaceChildren(
    ...results.map((result) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = result.url;
      link.textContent = result.heading
        ? `${result.entry.title} › ${result.heading.text}`
        : result.entry.title;
      item.append(link);

      if (result.entry.description) {
        const description = document.createElement("p");
        description.textContent = result.entry.description;
        item.append(description);
      }

      return item;
    }),
  );
  status.textContent = query.trim() === ""
    ? ""
    : `${results.length} result${
      results.length === 1 ? "" : "s"
    } for “${query}”`;
}

const initial = new URLSearchParams(location.search).get("q") ?? "";

if (input) {
  input.value = initial;
  input.addEventListener("input", () => show(input.value));
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input?.value ?? "";
  history.replaceState(null, "", `?q=${encodeURIComponent(query)}`);
  show(query);
});

show(initial);
