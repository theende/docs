import { highlight } from "@ende/satz/highlight";
import { raw } from "@ende/satz/jsx-runtime";
import { markdown } from "../_lib/markdown.ts";
import { loadExamples } from "./_lib/examples.ts";
import type { ExampleFromFileSystem } from "./_lib/types.ts";

function ExamplePage({ example }: { example: ExampleFromFileSystem }) {
  const source =
    `https://github.com/theende/docs/blob/primary/examples/scripts/${example.name}`;
  const rawUrl = `https://docs.deno.com/examples/scripts/${example.name}`;
  const run = example.parsed.run;

  return (
    <>
      {example.parsed.description && markdown(example.parsed.description)}
      <p>
        <a href={source}>Edit on GitHub</a>
      </p>
      {example.parsed.files.map((file) => (
        <section>
          {file.name && <h2>{file.name}</h2>}
          {file.snippets.map((snippet) => (
            <>
              {snippet.text && <p>{snippet.text}</p>}
              {snippet.code && (
                <pre><code class="language-ts">{raw(highlight(snippet.code, "ts")!)}</code></pre>
              )}
            </>
          ))}
        </section>
      ))}
      {run && (
        <section>
          <p>
            Run <a href={source}>this example</a> locally using the Deno CLI:
          </p>
          <pre><code>{run.startsWith("deno test")
            ? `# deno test runs local files, so download the example first:\ncurl -O ${rawUrl}\n${run.replace("<url>", example.name)}`
            : run.startsWith("deno")
            ? run.replace("<url>", rawUrl)
            : `deno run ${run.replace("<url>", rawUrl)}`}</code></pre>
        </section>
      )}
      {example.parsed.additionalResources.length > 0 && (
        <section>
          <h2>Additional resources</h2>
          <ul>
            {example.parsed.additionalResources.map(([link, title]) => (
              <li>
                <a href={link}>{title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** One page per example script, at `/examples/<name>/`. */
export default async function* () {
  for (const example of await loadExamples()) {
    yield {
      url: `/examples/${example.label}/`,
      title: example.parsed.title,
      content: <ExamplePage example={example} />,
    };
  }
}
