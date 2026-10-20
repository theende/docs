import { extractYaml } from "@ende/front-matter";

interface EndeLintRuleDesc {
  code: string;
  tags: string[];
}

interface EndeLintRulesOutput {
  rules: EndeLintRuleDesc[];
  version: string;
}

async function getCurrentLintRules(): Promise<EndeLintRulesOutput> {
  const output = await new Ende.Command(Ende.execPath(), {
    args: ["lint", "--rules", "--json"]
  }).outputSync();

  if (!output.success)
    throw new Error("Failed to run `ende lint --rules --json`");

  const data = new TextDecoder().decode(output.stdout);
  return JSON.parse(data) satisfies EndeLintRulesOutput;
}

const missingDocs: string[] = [];

async function checkIfDocsExistAndUpdate(lintRulesData: EndeLintRulesOutput) {
  for (const lintRule of lintRulesData.rules) {
    const name = lintRule.code;
    let content = "";

    try {
      content = await Ende.readTextFile(`./lint/rules/${name}.md`);
    } catch {
      missingDocs.push(name);
      continue;
    }

    let fmData: { attrs: { tags?: string[] }; body: string; } = {
      attrs: {},
      body: ""
    };

    try {
      fmData = extractYaml<{ tags?: string[] }>(content);
    } catch {
      fmData.body = content;
    }

    fmData.attrs.tags = lintRule.tags;

    const newContent = `---
title: ${name}
tags: [${fmData.attrs.tags.join(", ")}]
---

${fmData.body}`;
    await Ende.writeTextFile(`./lint/rules/${name}.md`, newContent);
  }
}

const lintRulesData = await getCurrentLintRules();
await checkIfDocsExistAndUpdate(lintRulesData);

if (missingDocs.length !== 0) {
  throw new Error(
    `Some rules are missing docs:\n${
      missingDocs.join("\n")
    }\n\nAdd Markdown files to lint/rules/ directory and write the docs.`
  );
}
