// Renders API reference pages: a symbol's declarations, its doc comment and
// its members, as plain semantic HTML.

import { escape } from "@ende/html";
import { raw } from "@ende/satz/jsx-runtime";
import type { TocEntry } from "../types.ts";
import {
  type Declaration,
  type JsDoc,
  LARGE_LITERAL,
  type Lookup,
  type Member,
  type Method,
  type Property,
  type Signature,
  summary,
  type SymbolPage,
  tag
} from "./doc.ts";
import { docHtml, type Rewrite } from "./markdown.ts";
import { paramHtml, paramsHtml, typeHtml, typeParamsHtml } from "./printer.ts";

function Code({ html }: { html: string }) {
  return <pre><code class="language-ts">{raw(html)}</code></pre>;
}

function Doc(
  { text, lookup, rewrite }: {
    text?: string;
    lookup: Lookup;
    rewrite: Rewrite;
  }
) {
  const html = docHtml(text, lookup, rewrite);
  return html ? raw(html) : null;
}

function isExperimental(page: SymbolPage, jsDoc?: JsDoc): boolean {
  return tag(jsDoc, "experimental") !== undefined ||
    /(^|\/)unstable[-_]/.test(page.std?.module.path ?? "");
}

/** Kind, stability, platform and permission notes for a declaration. */
function Badges(
  { page, declaration }: { page: SymbolPage; declaration: Declaration }
) {
  const notes: string[] = [
    declaration.kind === "typeAlias" ? "type alias" : declaration.kind
  ];
  const permissions = tag(declaration.jsDoc, "tags")?.tags?.filter((name) => name.startsWith("allow-")) ?? [];

  if (isExperimental(page, declaration.jsDoc)) notes.push("experimental");
  if (tag(declaration.jsDoc, "deprecated")) notes.push("deprecated");
  if (declaration.desktop) notes.push("desktop apps only");
  if (permissions.length > 0) {
    notes.push(`requires ${permissions.map((name) => `--${name}`).join(", ")}`);
  }

  return <p>{notes.join(" · ")}</p>;
}

function signatureHtml(
  page: SymbolPage,
  declaration: Declaration,
  name: string
): string {
  const link = page.lookup;
  const def = declaration.def ?? {};
  const typeParams = typeParamsHtml(def.typeParams, link);
  const n = escape(name);

  switch (declaration.kind) {
    case "function":
      return `${def.isAsync ? "async " : ""}function${def.isGenerator ? "*" : ""} ${n}${typeParams}${
        paramsHtml(def.params, link)
      }: ${typeHtml(def.returnType, link)}`;
    case "class": {
      const extendsHtml = def.extends
        ? ` extends ${
          link(def.extends)
            ? `<a href="${escape(link(def.extends)!)}">${escape(def.extends)}</a>`
            : escape(def.extends)
        }${
          def.superTypeParams?.length
            ? `&lt;${
              def.superTypeParams.map((type: never) => typeHtml(type, link))
                .join(", ")
            }&gt;`
            : ""
        }`
        : "";
      const implementsHtml = def.implements?.length
        ? ` implements ${def.implements.map((type: never) => typeHtml(type, link)).join(", ")}`
        : "";
      return `${def.isAbstract ? "abstract " : ""}class ${n}${typeParams}${extendsHtml}${implementsHtml}`;
    }
    case "interface":
      return `interface ${n}${typeParams}${
        def.extends?.length
          ? ` extends ${def.extends.map((type: never) => typeHtml(type, link)).join(", ")}`
          : ""
      }`;
    case "typeAlias":
      return `type ${n}${typeParams} = ${typeHtml(def.tsType, link)}`;
    case "variable": {
      const literal = def.tsType?.kind === "typeLiteral";
      const size = def.tsType?.value?.properties?.length ?? 0;
      return `${def.kind ?? "const"} ${n}: ${
        !literal
          ? typeHtml(def.tsType, link)
          : size > LARGE_LITERAL
          ? `{ … } /* an object with ${size} properties */`
          : "{ … }"
      }`;
    }
    case "namespace":
      return `namespace ${n}`;
    case "enum":
      return `enum ${n}`;
    default:
      return n;
  }
}

/** The `@param` docs of a signature, with each parameter's type. */
function Parameters(
  { signature, jsDoc, lookup, rewrite }: {
    signature: Signature;
    jsDoc?: JsDoc;
    lookup: Lookup;
    rewrite: Rewrite;
  }
) {
  const docs = new Map(
    (jsDoc?.tags ?? []).filter((t) => t.kind === "param").map((
      t
    ) => [t.name ?? "", t.doc ?? ""])
  );
  const params = signature.params ?? [];
  if (docs.size === 0 || params.length === 0) return null;

  const nameOf = (param: (typeof params)[number]): string =>
    param.kind === "identifier"
      ? param.name
      : param.kind === "rest"
      ? nameOf(param.arg)
      : param.kind === "assign"
      ? nameOf(param.left)
      : "";

  return (
    <dl>
      {params.map((param) => (
        <>
          <dt>
            <code>{raw(paramHtml(param, lookup))}</code>
          </dt>
          <dd>
            <Doc
              text={docs.get(nameOf(param))}
              lookup={lookup}
              rewrite={rewrite}
            />
          </dd>
        </>
      ))}
    </dl>
  );
}

/** Returns, examples, see-also and deprecation notes from a doc comment. */
function Tags(
  { jsDoc, lookup, rewrite }: {
    jsDoc?: JsDoc;
    lookup: Lookup;
    rewrite: Rewrite;
  }
) {
  const tags = jsDoc?.tags ?? [];
  const deprecated = tag(jsDoc, "deprecated");
  const returns = tags.find((t) => t.kind === "return");
  const examples = tags.filter((t) => t.kind === "example");
  const see = tags.filter((t) => t.kind === "see");
  const defaults = tag(jsDoc, "default");

  return (
    <>
      {deprecated && (
        <blockquote>
          <p>
            <strong>Deprecated.</strong>
          </p>
          <Doc text={deprecated.doc} lookup={lookup} rewrite={rewrite}/>
        </blockquote>
      )}
      {defaults && (defaults.value ?? defaults.doc) && (
        <p>
          Default: <code>{defaults.value ?? defaults.doc}</code>
        </p>
      )}
      {returns?.doc && (
        <>
          <p>
            <strong>Returns</strong>
          </p>
          <Doc text={returns.doc} lookup={lookup} rewrite={rewrite}/>
        </>
      )}
      {examples.map((example) => {
        const text = example.doc ?? "";
        const [first, ...rest] = text.split("\n");
        const titled = first !== undefined && !first.startsWith("```");
        const title = titled && first.trim()
          ? docHtml(first.trim(), lookup, rewrite).replace(
            /^<p>|<\/p>\n?$/g,
            ""
          )
          : "";
        return (
          <section>
            <p>
              <strong>Example{title ? raw(`: ${title}`) : ""}</strong>
            </p>
            <Doc
              text={titled ? rest.join("\n") : text}
              lookup={lookup}
              rewrite={rewrite}
            />
          </section>
        );
      })}
      {see.length > 0 && (
        <>
          <p>
            <strong>See also</strong>
          </p>
          <ul>
            {see.map((t) => (
              <li>
                <Doc text={t.doc} lookup={lookup} rewrite={rewrite}/>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function memberSignature(
  member: Member,
  entry: Property | Method | Signature,
  page: SymbolPage
): string {
  const link = page.lookup;

  switch (member.kind) {
    case "property": {
      const property = entry as Property;
      return `${property.isStatic ? "static " : ""}${property.readonly ? "readonly " : ""}${escape(property.name)}${
        property.optional ? "?" : ""
      }: ${typeHtml(property.tsType, link)}`;
    }
    case "method": {
      const method = entry as Method;
      const signature = method.functionDef ?? method;
      const prefix = method.kind === "getter"
        ? "get "
        : method.kind === "setter"
        ? "set "
        : "";
      return `${method.isStatic ? "static " : ""}${prefix}${escape(method.name)}${method.optional ? "?" : ""}${
        typeParamsHtml(signature.typeParams, link)
      }${paramsHtml(signature.params, link)}${
        method.kind === "setter"
          ? ""
          : `: ${typeHtml(signature.returnType, link)}`
      }`;
    }
    case "constructor": {
      const signature = entry as Signature;
      return `new ${escape(page.title.split(".").at(-1)!)}${typeParamsHtml(signature.typeParams, link)}${
        paramsHtml(signature.params, link)
      }${signature.returnType ? `: ${typeHtml(signature.returnType, link)}` : ""}`;
    }
    case "call": {
      const signature = entry as Signature;
      return `${typeParamsHtml(signature.typeParams, link)}${paramsHtml(signature.params, link)}: ${
        typeHtml(signature.tsType ?? signature.returnType, link)
      }`;
    }
    case "index": {
      const signature = entry as Signature & { params: never[] };
      return `${signature.readonly ? "readonly " : ""}[${
        (signature.params ?? []).map((param) => paramHtml(param, link)).join(
          ", "
        )
      }]: ${typeHtml(signature.tsType, link)}`;
    }
    case "enum": {
      const value = entry as { name: string; init?: never };
      return `${escape(value.name)}${value.init ? ` = ${typeHtml(value.init, link)}` : ""}`;
    }
  }
}

function MemberView(
  { member, page, rewrite }: {
    member: Member;
    page: SymbolPage;
    rewrite: Rewrite;
  }
) {
  return (
    <section>
      <h3 id={member.anchor}>
        <code>{member.name}</code>
      </h3>
      {member.entries.map((entry) => {
        const jsDoc = (entry as { jsDoc?: JsDoc }).jsDoc;
        const signature = (entry as Method).functionDef ?? (entry as Signature);
        return (
          <>
            <Code html={memberSignature(member, entry, page)}/>
            {tag(jsDoc, "experimental") && <p>experimental</p>}
            <Doc text={jsDoc?.doc} lookup={page.lookup} rewrite={rewrite}/>
            <Parameters
              signature={signature}
              jsDoc={jsDoc}
              lookup={page.lookup}
              rewrite={rewrite}
            />
            <Tags jsDoc={jsDoc} lookup={page.lookup} rewrite={rewrite}/>
          </>
        );
      })}
    </section>
  );
}

function groupSlug(page: SymbolPage, group: string): string {
  return `${page.prefix}${group.toLowerCase().replace(/\s+/g, "-")}`;
}

/** A list of symbol pages with their one-line summaries. */
export function SymbolList({ pages }: { pages: SymbolPage[] }) {
  return (
    <ul>
      {pages.map((page) => {
        const text = summary(page.symbol.declarations[0]?.jsDoc);
        return (
          <li>
            <a href={page.url}>
              <code>{page.title}</code>
            </a>
            {text ? ` — ${text}` : ""}
          </li>
        );
      })}
    </ul>
  );
}

/** A symbol's page: its declarations, doc comment and members, then the symbols it shares the page with. */
export function SymbolView(
  { page, rewrite }: { page: SymbolPage; rewrite: Rewrite }
) {
  return (
    <>
      <SymbolBody page={page} rewrite={rewrite}/>
      {page.others.map((other) => (
        <section>
          <h2 id={other.prefix.slice(0, -1)}>
            <code>{other.title}</code>
          </h2>
          <SymbolBody page={other} rewrite={rewrite}/>
        </section>
      ))}
    </>
  );
}

function SymbolBody(
  { page, rewrite }: { page: SymbolPage; rewrite: Rewrite }
) {
  const { symbol, std, members } = page;
  const groups = [...new Set(members.map((member) => member.group))];
  const specifier = std
    ? `jsr:${std.package.name}${std.module.path ? `/${std.module.path}` : ""}`
    : undefined;
  const location = symbol.declarations.find((declaration) => declaration.location)
    ?.location;

  return (
    <>
      {specifier && (
        <Code
          html={`import { ${escape(symbol.name)} } from ${escape(JSON.stringify(specifier))};`}
        />
      )}
      {symbol.declarations.map((declaration) => (
        <section>
          <Badges page={page} declaration={declaration}/>
          <Code html={signatureHtml(page, declaration, page.title)}/>
          <Doc
            text={declaration.jsDoc?.doc}
            lookup={page.lookup}
            rewrite={rewrite}
          />
          {declaration.kind === "function" && (
            <Parameters
              signature={declaration.def}
              jsDoc={declaration.jsDoc}
              lookup={page.lookup}
              rewrite={rewrite}
            />
          )}
          <Tags
            jsDoc={declaration.jsDoc}
            lookup={page.lookup}
            rewrite={rewrite}
          />
        </section>
      ))}
      {page.children.length > 0 && (
        <section>
          <h2 id={`${page.prefix}members`}>Members</h2>
          <SymbolList pages={page.children}/>
        </section>
      )}
      {groups.map((group) => (
        <section>
          <h2 id={groupSlug(page, group)}>{group}</h2>
          {members.filter((member) => member.group === group).map((member) => (
            <MemberView member={member} page={page} rewrite={rewrite}/>
          ))}
        </section>
      ))}
      {std && location && (
        <p>
          <a
            href={`https://jsr.io/${location.file}#L${location.line}`}
          >
            Source
          </a>
        </p>
      )}
    </>
  );
}

/** The page's table of contents: member groups and their members. */
export function symbolToc(page: SymbolPage): TocEntry[] {
  const toc: TocEntry[] = [];
  if (page.children.length > 0) {
    toc.push({ depth: 2, text: "Members", slug: "members" });
  }

  let group: string | undefined;
  for (const member of page.members) {
    if (member.group !== group) {
      group = member.group;
      toc.push({ depth: 2, text: group, slug: groupSlug(page, group) });
    }
    toc.push({ depth: 3, text: member.name, slug: member.anchor });
  }

  for (const other of page.others) {
    toc.push({ depth: 2, text: other.title, slug: other.prefix.slice(0, -1) });
  }

  return toc;
}

/** A one-line description for the page's `<meta>` and the search index. */
export function symbolDescription(page: SymbolPage): string | undefined {
  const text = summary(page.symbol.declarations[0]?.jsDoc);
  if (!page.std) return text;

  const { package: pkg, module } = page.std;
  const specifier = module.path ? `${pkg.name}/${module.path}` : pkg.name;
  return text ? `${specifier}: ${text}` : specifier;
}
