import type { LayoutProps } from "@ende/satz";

export const layout = "doc.tsx";

function tagsConfig(tags: string[]): string {
  const rest = tags.slice(1).map((tag) => `"${tag}"`).join(", ");
  return `{
  "lint": {
    "rules": {
      "tags": ["${tags[0]}"]${rest ? ` // ...or ${rest}` : ""}
    }
  }
}`;
}

function RuleSets({ tags, rule }: { tags: string[]; rule: string }) {
  if (tags.length === 0) return null;

  return (
    <aside>
      <p>
        <strong>Note:</strong> {tags.length === 1
          ? (
            <>
              this rule is part of the <code>{tags[0]}</code> rule set.
            </>
          )
          : (
            <>
              this rule is included in the following rule sets:{" "}
              {tags.map((tag, i) => (
                <>
                  {i > 0 && ", "}
                  <code>{tag}</code>
                </>
              ))}.
            </>
          )}
      </p>
      <p>
        Enable the full set in <code>deno.json</code>:
      </p>
      <pre><code>{tagsConfig(tags)}</code></pre>
      <p>Enable the full set using the Deno CLI:</p>
      <pre><code>{tags.map((tag) => `deno lint --rules-tags=${tag}`).join("\n# or ...\n")}</code></pre>
      <p>
        This rule can be explicitly included in or excluded from the rules
        present in the current tag by adding it to the <code>include</code> or
        {" "}
        <code>exclude</code> array in <code>deno.json</code>:
      </p>
      <pre><code>{`{
  "lint": {
    "rules": {
      "include": ["${rule}"],
      "exclude": ["${rule}"]
    }
  }
}`}</code></pre>
    </aside>
  );
}

/** A lint rule's page: the rule sets it belongs to, then its docs. */
export default function LintRule(props: LayoutProps) {
  return (
    <>
      <RuleSets
        tags={(props.tags as string[] | undefined) ?? []}
        rule={props.title as string}
      />
      {props.content}
    </>
  );
}
