import { extract } from "@ende/front-matter/yaml";
import { basename } from "@ende/path";
import type { Sidebar, SidebarItem } from "../_lib/types.ts";

/** A lint rule page, for the sidebar and the list of rules. */
export interface LintRule extends SidebarItem {
  title: string;
  href: string;
  tags: string[];
  /** The rule's first paragraph, in Markdown. */
  summary: string;
}

async function lintRules(): Promise<LintRule[]> {
  const dir = new URL("./rules/", import.meta.url);
  const rules: LintRule[] = [];

  for await (const entry of Ende.readDir(dir)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;

    const name = basename(entry.name, ".md");
    const { attrs, body } = extract<{ tags?: string[] }>(
      await Ende.readTextFile(new URL(entry.name, dir))
    );

    rules.push({
      title: name,
      href: `/lint/rules/${name}/`,
      tags: attrs.tags ?? [],
      summary: body.trim().split(/\n\s*\n/)[0]
    });
  }

  return rules.sort((a, b) => a.title.localeCompare(b.title));
}

export const lintRulePages = await lintRules();

export const sectionTitle = "Lint rules";

export const sectionHref = "/lint/";

export const sidebar = [
  {
    title: "List of rules",
    href: sectionHref,
    items: lintRulePages
  }
] satisfies Sidebar;

export default { sidebar, sectionTitle, sectionHref, lintRulePages };
