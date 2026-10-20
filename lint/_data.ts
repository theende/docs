import { basename } from "@ende/path";
import { extract } from "@ende/front-matter/yaml";
import type { Sidebar, SidebarItem } from "../_lib/types.ts";

/** A lint rule page, for the sidebar and the list of rules. */
export interface LintRule extends SidebarItem {
  href: string;
  /** The rule's first paragraph, in Markdown. */
  summary: string;
  tags: string[];
  title: string;
}

async function lintRules(): Promise<LintRule[]> {
  const dir = new URL("./rules/", import.meta.url);
  const rules: LintRule[] = [];

  for await (const entry of Ende.readDir(dir)) {
    if (!entry.isFile || !entry.name.endsWith(".md"))
      continue;

    const name = basename(entry.name, ".md");
    const { attrs, body } = extract<{ tags?: string[] }>(await Ende.readTextFile(new URL(entry.name, dir)));

    rules.push({
      href: `/lint/rules/${name}/`,
      summary: body.trim().split(/\n\s*\n/)[0],
      tags: attrs.tags ?? [],
      title: name
    });
  }

  return rules.sort((a, b) => a.title.localeCompare(b.title));
}

export const lintRulePages = await lintRules();
export const sectionTitle = "Lint rules";
export const sectionHref = "/lint/";

export const sidebar = [
  {
    href: sectionHref,
    items: lintRulePages,
    title: "List of rules"
  }
] satisfies Sidebar;

export default {
  lintRulePages,
  sectionHref,
  sectionTitle,
  sidebar
};
