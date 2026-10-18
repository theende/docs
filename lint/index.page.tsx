import { markdown } from "../_lib/markdown.ts";
import type { LintRule } from "./_data.ts";

export const title = "List of rules";
export const oldUrl = "/lint/rules";

const TAGS = ["recommended", "fresh", "jsx", "react", "jsr", "workspace"];

/** Every lint rule with its first paragraph, filterable by name and tag. */
export default function LintRulesIndex(
  { lintRulePages }: { lintRulePages: LintRule[] },
) {
  return (
    <>
      <p>
        These lint rules are provided by the{" "}
        <a href="/runtime/reference/cli/lint/">
          <code>ende lint</code>
        </a>{" "}
        command. You can enable sets of rules in <code>ende.json(c)</code>{" "}
        by adding their tags (e.g. <code>recommended</code>,{" "}
        <code>react</code>) to the{" "}
        <a href="/runtime/reference/ende_json/#linting">
          <code>lint.rules.tags</code>
        </a>{" "}
        array.
      </p>
      <p>
        If no tag is provided, then the <code>recommended</code>{" "}
        set of rules will be enabled by default.
      </p>
      <p>
        To turn a rule off, add it to{" "}
        <a href="/runtime/reference/cli/lint/#configuring-rules-in-endejson">
          <code>lint.rules.exclude</code>
        </a>{" "}
        in{" "}
        <code>ende.json</code>, or suppress a single diagnostic in your code
        with a{" "}
        <a href="/runtime/reference/cli/lint/#ignore-directives">
          <code>deno-lint-ignore</code>
        </a>{" "}
        comment.
      </p>
      <p>
        <label>
          Search lint rules <input type="search" id="lint-rule-search" />
        </label>
      </p>
      <p>
        Filter by tag: {TAGS.map((tag) => (
          <>
            <button type="button" data-tag-btn={tag} aria-pressed="false">
              {tag}
            </button>
            {" "}
          </>
        ))}
      </p>
      <ul>
        {lintRulePages.map((rule) => (
          <li
            class="lint-rule-box"
            id={rule.title}
            data-tags={rule.tags.join(",")}
          >
            <a href={rule.href}>
              <code>{rule.title}</code>
            </a>
            {rule.tags.length > 0 && ` (${rule.tags.join(", ")})`}
            {markdown(rule.summary)}
          </li>
        ))}
      </ul>
      <script type="module" src="/js/lint_rules.js"></script>
    </>
  );
}
