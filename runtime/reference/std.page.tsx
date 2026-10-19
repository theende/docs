import { raw } from "@ende/satz/jsx-runtime";
import { loadStd, type Std, type StdModule, type StdPackage, summary } from "../../_lib/reference/doc.ts";
import { docHtml, type Rewrite } from "../../_lib/reference/markdown.ts";
import { symbolDescription, SymbolList, symbolToc, SymbolView } from "../../_lib/reference/render.tsx";
import type { Sidebar } from "../../_lib/types.ts";

function specifier(pkg: StdPackage, module: StdModule): string {
  return module.path ? `${pkg.name}/${module.path}` : pkg.name;
}

function sidebar(std: Std): Sidebar {
  return [
    {
      title: "Standard library",
      href: "/runtime/reference/std/",
      items: std.packages.map((pkg) => ({
        title: pkg.name,
        href: std.packageUrl(pkg)
      }))
    },
    { title: "API reference", href: "/api/" }
  ];
}

/** A package's or module's page: its doc, its modules (for the package) and what it exports. */
function ModuleView(
  { std, pkg, module, rewrite }: {
    std: Std;
    pkg: StdPackage;
    module: StdModule;
    rewrite: Rewrite;
  }
) {
  const exports = std.exportsOf(pkg, module);
  const lookup = (name: string) =>
    exports.find((entry) => entry.name === name)?.page.url ??
      std.pages.find((page) => page.std?.package === pkg && page.title === name)
        ?.lookup(name);
  const isPackage = module.path === "";
  const others = pkg.modules.filter((candidate) => candidate !== module);

  return (
    <>
      <pre><code>ende add jsr:{pkg.name}</code></pre>
      <p>
        Version {pkg.version} on <a href={`https://jsr.io/${pkg.name}`}>JSR</a>.
      </p>
      {raw(docHtml(module.doc?.doc, lookup, rewrite, true))}
      {isPackage && others.length > 0 && (
        <section>
          <h2 id="modules">Modules</h2>
          <ul>
            {others.map((candidate) => {
              const text = summary(candidate.doc);
              return (
                <li>
                  <a href={std.moduleUrl(pkg, candidate)}>
                    <code>{specifier(pkg, candidate)}</code>
                  </a>
                  {text ? ` — ${text}` : ""}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {exports.length > 0 && (
        <section>
          <h2 id="exports">Exports</h2>
          <SymbolList pages={exports.map((entry) => entry.page)}/>
        </section>
      )}
    </>
  );
}

/** A package without a root module: its modules. */
function PackageView({ std, pkg }: { std: Std; pkg: StdPackage }) {
  return (
    <>
      <pre><code>ende add jsr:{pkg.name}</code></pre>
      <p>
        Version {pkg.version} on <a href={`https://jsr.io/${pkg.name}`}>JSR</a>. Import one of its modules:
      </p>
      <ul>
        {pkg.modules.map((module) => {
          const text = summary(module.doc);
          return (
            <li>
              <a href={std.moduleUrl(pkg, module)}>
                <code>{specifier(pkg, module)}</code>
              </a>
              {text ? ` — ${text}` : ""}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The standard library reference: an index, a page per package and module, and a page per symbol. */
export default async function* () {
  const std = await loadStd();
  const rewrite: Rewrite = (href) => std.fromJsrUrl(href);
  const side = sidebar(std);

  yield {
    url: "/runtime/reference/std/",
    title: "Standard library",
    description: "Ende's standard library: the @ende/* packages on JSR, with their modules and APIs.",
    sidebar: side,
    content: (
      <>
        <p>
          The standard library is a set of packages published on <a href="https://jsr.io/@ende">JSR</a> under{" "}
          <code>@ende</code>. Add one to a project with <code>ende add jsr:@ende/&lt;package&gt;</code>.
        </p>
        <ul>
          {std.packages.map((pkg) => {
            const main = pkg.modules.find((module) => module.path === "") ??
              pkg.modules[0];
            const text = summary(main.doc);
            return (
              <li>
                <a href={std.packageUrl(pkg)}>
                  <code>{pkg.name}</code>
                </a>
                {text ? ` — ${text}` : ""}
              </li>
            );
          })}
        </ul>
      </>
    )
  };

  for (const pkg of std.packages) {
    if (!pkg.modules.some((module) => module.path === "")) {
      yield {
        url: std.packageUrl(pkg),
        title: pkg.name,
        description: summary(pkg.modules[0].doc),
        sidebar: side,
        content: <PackageView std={std} pkg={pkg}/>
      };
    }

    for (const module of pkg.modules) {
      yield {
        url: std.moduleUrl(pkg, module),
        title: specifier(pkg, module),
        description: summary(module.doc),
        sidebar: side,
        content: <ModuleView std={std} pkg={pkg} module={module} rewrite={rewrite}/>
      };
    }
  }

  for (const page of std.pages) {
    yield {
      url: page.url,
      title: page.title,
      description: symbolDescription(page),
      sidebar: side,
      toc: symbolToc(page),
      content: <SymbolView page={page} rewrite={rewrite}/>
    };
  }
}
