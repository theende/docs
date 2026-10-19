// The API reference model: the `ende doc --json` data in `_reference/`, the
// page each symbol gets, the anchors of their members, and the lookup that
// turns a name (`Ende.FsFile.prototype.lock`, `ReadableStream`) into a URL.

import { categorySlug } from "./categories.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

export interface JsDocTag {
  kind: string;
  doc?: string;
  name?: string;
  tags?: string[];
  value?: string;
}

export interface JsDoc {
  doc?: string;
  tags?: JsDocTag[];
}

export interface TsType {
  kind: string;
  value?: Any;
}

export interface TypeParam {
  name: string;
  constraint?: TsType;
  default?: TsType;
}

export type Param =
  | { kind: "identifier"; name: string; optional?: boolean; tsType?: TsType }
  | { kind: "rest"; arg: Param; tsType?: TsType }
  | { kind: "assign"; left: Param; right: string; tsType?: TsType }
  | {
    kind: "array";
    elements?: (Param | null)[];
    optional?: boolean;
    tsType?: TsType;
  }
  | {
    kind: "object";
    props?: { key?: string; name?: string }[];
    optional?: boolean;
    tsType?: TsType;
  };

export interface Signature {
  params?: Param[];
  returnType?: TsType;
  tsType?: TsType;
  typeParams?: TypeParam[];
  jsDoc?: JsDoc;
  readonly?: boolean;
}

export interface TsTypeLiteral {
  constructors?: Signature[];
  callSignatures?: Signature[];
  indexSignatures?: (Signature & { params: Param[] })[];
  properties?: Property[];
  methods?: Method[];
}

export interface Property {
  name: string;
  tsType?: TsType;
  readonly?: boolean;
  optional?: boolean;
  isStatic?: boolean;
  jsDoc?: JsDoc;
}

export interface Method extends Signature {
  name: string;
  kind?: "method" | "getter" | "setter";
  optional?: boolean;
  isStatic?: boolean;
  functionDef?: Signature;
}

export interface Location {
  file: string;
  line: number;
}

export interface Declaration {
  kind:
    | "function"
    | "class"
    | "interface"
    | "typeAlias"
    | "variable"
    | "namespace"
    | "enum"
    | "reference";
  declarationKind?: string;
  jsDoc?: JsDoc;
  def: Any;
  location?: Location;
  /** Only in apps built with `ende desktop`. */
  desktop?: boolean;
}

export interface DocSymbol {
  name: string;
  declarations: Declaration[];
}

export interface StdModule {
  /** The export path: `""` for the package root, `posix/basename` for `./posix/basename`. */
  path: string;
  file: string;
  doc: JsDoc | null;
  symbols: DocSymbol[];
}

export interface StdPackage {
  name: string;
  version: string;
  modules: StdModule[];
}

/** The URL and display name of a member's anchor on its symbol's page. */
export interface Member {
  anchor: string;
  name: string;
  group: string;
  /** The member's entries: overloads share one anchor. */
  entries: (Property | Method | Signature)[];
  kind: "property" | "method" | "constructor" | "call" | "index" | "enum";
}

export type Section = "ende" | "web" | "std";

export interface SymbolPage {
  /** The page's URL, with `#name` for a symbol shown on another's page. */
  url: string;
  /** The URL of the page the symbol is shown on. */
  base: string;
  /**
   * For a symbol shown on another's page: `name.`, the prefix of its anchors.
   * Symbols whose names differ only in case (`Navigator`, `navigator`) share a
   * page, since their URLs would be the same file on a case-insensitive file
   * system.
   */
  prefix: string;
  /** The symbols shown on this page after its own. */
  others: SymbolPage[];
  /** The members, with their anchors (prefixed for a symbol on another's page). */
  members: Member[];
  /** The name the page is titled with: `Ende.serve`, `URL`, `assertEquals`. */
  title: string;
  symbol: DocSymbol;
  section: Section;
  category: string;
  /** Resolves names for this page's types and links. */
  lookup: Lookup;
  /** For std: the package and module the symbol is documented in. */
  std?: { package: StdPackage; module: StdModule };
  /** The namespace pages' elements (`Ende.errors`). */
  children: SymbolPage[];
}

/** Finds the URL (with an anchor for members) for a name, or `undefined`. */
export type Lookup = (name: string) => string | undefined;

const root = new URL("../../_reference/", import.meta.url);

export function tag(
  jsDoc: JsDoc | undefined,
  kind: string
): JsDocTag | undefined {
  return jsDoc?.tags?.find((tag) => tag.kind === kind);
}

/** The text before the first blank line, without Markdown links and `{@link}` tags. */
export function summary(jsDoc: JsDoc | null | undefined): string | undefined {
  const text = jsDoc?.doc?.trim();
  if (!text) return undefined;

  const paragraph = text.split(/\n\s*\n/)[0].replace(/\s+/g, " ");
  if (paragraph.startsWith("```")) return undefined;

  return paragraph
    .replace(
      /\{@link(?:code|plain)?\s+([^}|\s]+)(?:\s*\|\s*|\s+)?([^}]*)\}/g,
      (_, target, text) => text.trim() || target
    )
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

export function categoryOf(symbol: DocSymbol, fallback: string): string {
  for (const declaration of symbol.declarations) {
    if (declaration.desktop) return "Desktop";
    const category = tag(declaration.jsDoc, "category")?.doc?.trim();
    if (category) return category;
  }

  return fallback;
}

/** Type literals with more properties than this aren't listed member by member. */
export const LARGE_LITERAL = 200;

/** The members a symbol's page lists, each with its anchor. */
export function membersOf(symbol: DocSymbol): Member[] {
  const members = new Map<string, Member>();
  const add = (
    anchor: string,
    name: string,
    group: string,
    kind: Member["kind"],
    entry: Property | Method | Signature
  ) => {
    const existing = members.get(anchor);
    if (existing) existing.entries.push(entry);
    else members.set(anchor, { anchor, name, group, kind, entries: [entry] });
  };
  const addLiteral = (literal: TsTypeLiteral, prefix: string) => {
    for (const signature of literal.constructors ?? []) {
      add(
        "constructor",
        "constructor",
        "Constructors",
        "constructor",
        signature
      );
    }
    for (const signature of literal.callSignatures ?? []) {
      add(
        "call-signature",
        "Call signature",
        "Call signatures",
        "call",
        signature
      );
    }
    for (const signature of literal.indexSignatures ?? []) {
      add(
        "index-signature",
        "Index signature",
        "Index signatures",
        "index",
        signature
      );
    }
    for (const property of literal.properties ?? []) {
      add(
        `${prefix}${property.name}`,
        property.name,
        "Properties",
        "property",
        property
      );
    }
    for (const method of literal.methods ?? []) {
      add(`${prefix}${method.name}`, method.name, "Methods", "method", method);
    }
  };

  for (const declaration of symbol.declarations) {
    const def = declaration.def ?? {};

    switch (declaration.kind) {
      case "class":
        for (const constructor of def.constructors ?? []) {
          add(
            "constructor",
            "constructor",
            "Constructors",
            "constructor",
            constructor
          );
        }
        for (const property of def.properties ?? []) {
          const isStatic = property.isStatic === true;
          add(
            `${isStatic ? "" : "prototype."}${property.name}`,
            property.name,
            isStatic ? "Static properties" : "Properties",
            "property",
            property
          );
        }
        for (const method of def.methods ?? []) {
          const isStatic = method.isStatic === true;
          add(
            `${isStatic ? "" : "prototype."}${method.name}`,
            method.name,
            isStatic ? "Static methods" : "Methods",
            "method",
            method
          );
        }
        break;
      case "interface":
        addLiteral(def, "");
        break;
      case "variable":
        // A data module's object (`named-entity-list.json`) isn't an API.
        if (
          def.tsType?.kind === "typeLiteral" &&
          (def.tsType.value.properties?.length ?? 0) <= LARGE_LITERAL
        ) {
          addLiteral(def.tsType.value, "");
        }
        break;
      case "enum":
        for (const member of def.members ?? []) {
          add(member.name, member.name, "Members", "enum", member);
        }
        break;
    }
  }

  const order = [
    "Constructors",
    "Call signatures",
    "Index signatures",
    "Static properties",
    "Static methods",
    "Properties",
    "Methods",
    "Members"
  ];
  return [...members.values()].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}

/** Splits `Ende.FsFile.prototype.lock` into the longest prefix `find` knows and the rest. */
function memberLookup(
  name: string,
  find: (head: string) => SymbolPage | undefined
): string | undefined {
  const parts = name.split(".");

  for (let index = parts.length; index > 0; index--) {
    const page = find(parts.slice(0, index).join("."));
    if (page === undefined) continue;
    if (index === parts.length) return page.url;

    const rest = parts.slice(index).join(".");
    for (
      const anchor of [
        rest,
        `prototype.${rest}`,
        rest.replace(/^prototype\./, "")
      ]
    ) {
      const member = page.members.find((member) => member.anchor === `${page.prefix}${anchor}`);
      if (member) return `${page.base}#${member.anchor}`;
    }

    // `Ende.test.each`: a member of the variable's type (`Ende.EndeTest`).
    const type = page.symbol.declarations.find((declaration) =>
      declaration.kind === "variable" &&
      declaration.def?.tsType?.kind === "typeRef"
    )?.def.tsType.value.typeName as string | undefined;
    if (type && following < 2) {
      following++;
      try {
        return page.lookup(`${type}.${rest}`);
      } finally {
        following--;
      }
    }

    return undefined;
  }

  return undefined;
}

// How deep `memberLookup` is in following variables' types.
let following = 0;

/** A symbol's members, with their anchors prefixed by `prefix`. */
function prefixed(symbol: DocSymbol, prefix: string): Member[] {
  return membersOf(symbol).map((member) => ({
    ...member,
    anchor: `${prefix}${member.anchor}`
  }));
}

/**
 * Puts symbols whose URLs differ only in case on one page: the first by name
 * keeps the URL, the others are shown on it under `#name`.
 */
function shareCaseInsensitive(pages: SymbolPage[]): SymbolPage[] {
  const groups = new Map<string, SymbolPage[]>();

  for (const page of pages) {
    const key = page.url.toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), page]);
  }

  const primaries: SymbolPage[] = [];

  for (const group of groups.values()) {
    group.sort((a, b) => a.title < b.title ? -1 : 1);
    const [primary, ...others] = group;
    primaries.push(primary);

    for (const other of others) {
      const name = other.title.split(".").at(-1)!;
      other.base = primary.url;
      other.url = `${primary.url}#${name}`;
      other.prefix = `${name}.`;
      other.members = prefixed(other.symbol, other.prefix);
      primary.others.push(other);
    }
  }

  return primaries;
}

function normalize(name: string): string {
  return name.trim().replace(/\(\)$/, "").replace(/^globalThis\./, "").replace(
    /^Deno(?=\.|$)/,
    "Ende"
  );
}

/** The built-in reference: the `Ende` namespace and the web platform globals. */
export interface Builtin {
  ende: string | null;
  pages: SymbolPage[];
  /** Every page to write, namespaces' elements included (symbols shown on another's page aren't). */
  all: SymbolPage[];
  /** Finds a built-in by its qualified name. */
  lookup: Lookup;
}

let builtinPromise: Promise<Builtin> | undefined;

export function loadBuiltin(): Promise<Builtin> {
  builtinPromise ??= (async () => {
    const data = JSON.parse(
      await Ende.readTextFile(new URL("builtin.json", root))
    ) as { ende: string | null; symbols: DocSymbol[] };
    const byName = new Map<string, SymbolPage>();
    const created: SymbolPage[] = [];
    const global: Lookup = (name) => memberLookup(normalize(name), (head) => byName.get(head));

    const page = (
      symbol: DocSymbol,
      qualified: string,
      section: Section,
      fallbackCategory: string,
      scopes: string[]
    ): SymbolPage => {
      const url = section === "ende"
        ? `/api/ende/~/${qualified}/`
        : `/api/web/~/${qualified}/`;
      const category = categoryOf(symbol, fallbackCategory);
      const lookup: Lookup = (name) => {
        for (const scope of scopes) {
          const found = global(`${scope}${normalize(name)}`);
          if (found) return found;
        }
        return global(name);
      };
      const result: SymbolPage = {
        url,
        base: url,
        prefix: "",
        others: [],
        members: prefixed(symbol, ""),
        title: qualified,
        symbol,
        section,
        category,
        lookup,
        children: []
      };

      byName.set(qualified, result);
      created.push(result);

      const namespace = symbol.declarations.find((declaration) => declaration.kind === "namespace");
      for (const element of (namespace?.def.elements ?? []) as DocSymbol[]) {
        result.children.push(
          page(element, `${qualified}.${element.name}`, section, category, [
            `${qualified}.`,
            ...scopes
          ])
        );
      }

      return result;
    };

    const pages: SymbolPage[] = [];

    for (const symbol of data.symbols) {
      if (symbol.name === "Ende") {
        const elements = symbol.declarations[0].def.elements as DocSymbol[];
        for (const element of elements) {
          pages.push(
            page(element, `Ende.${element.name}`, "ende", "Other", ["Ende."])
          );
        }
      } else {
        pages.push(page(symbol, symbol.name, "web", "Other", []));
      }
    }

    const all = shareCaseInsensitive(created);

    return { ende: data.ende, pages, all, lookup: global };
  })();

  return builtinPromise;
}

/** A symbol's identity: where it's declared, following re-exports to their target. */
function identity(symbol: DocSymbol): string {
  const declaration = symbol.declarations[0];
  const location = declaration.kind === "reference"
    ? declaration.def.target
    : declaration.location;
  return `${location?.file}:${location?.line}:${symbol.name}`;
}

export interface Std {
  packages: StdPackage[];
  /** One page per symbol, in the module that documents it (symbols shown on another's page aren't listed). */
  pages: SymbolPage[];
  /** The URL of a package's page. */
  packageUrl(pkg: StdPackage): string;
  /** The URL of a package or module page. */
  moduleUrl(pkg: StdPackage, module: StdModule): string;
  /** The page of each name a module exports. */
  exportsOf(
    pkg: StdPackage,
    module: StdModule
  ): { name: string; page: SymbolPage }[];
  /** Finds a std page from a JSR doc URL (`https://jsr.io/@ende/html/doc/~/escape`). */
  fromJsrUrl(url: string): string | undefined;
}

let stdPromise: Promise<Std> | undefined;

export function loadStd(): Promise<Std> {
  stdPromise ??= (async () => {
    const builtin = await loadBuiltin();
    const packages: StdPackage[] = [];

    for await (const entry of Ende.readDir(new URL("std/", root))) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        packages.push(
          JSON.parse(
            await Ende.readTextFile(new URL(`std/${entry.name}`, root))
          )
        );
      }
    }
    packages.sort((a, b) => a.name.localeCompare(b.name));

    const short = (pkg: StdPackage) => pkg.name.replace(/^@ende\//, "");
    const moduleUrl = (pkg: StdPackage, module: StdModule) =>
      `/runtime/reference/std/${short(pkg)}/${module.path ? `${module.path}/` : ""}`;
    const created: SymbolPage[] = [];
    // By package: identity → page, and module path → name → page.
    const byIdentity = new Map<StdPackage, Map<string, SymbolPage>>();
    const byModule = new Map<StdModule, Map<string, SymbolPage>>();

    for (const pkg of packages) {
      const identities = new Map<string, SymbolPage>();
      byIdentity.set(pkg, identities);

      // Where each declaration is documented: the package root if it exports
      // the symbol, else the module whose file declares it, else the first
      // module that exports it.
      const home = new Map<string, { module: StdModule; symbol: DocSymbol }>();
      const rank = (module: StdModule, symbol: DocSymbol) => {
        if (module.path === "") return 0;
        const declared = symbol.declarations[0].location?.file;
        return declared === module.file ? 1 : 2;
      };

      for (const module of pkg.modules) {
        for (const symbol of module.symbols) {
          if (symbol.declarations[0].kind === "reference") continue;
          const id = identity(symbol);
          const current = home.get(id);
          if (
            !current ||
            rank(module, symbol) < rank(current.module, current.symbol)
          ) {
            home.set(id, { module, symbol });
          }
        }
      }

      for (const [id, { module, symbol }] of home) {
        const url = `${moduleUrl(pkg, module)}~/${symbol.name}/`;
        const result: SymbolPage = {
          url,
          base: url,
          prefix: "",
          others: [],
          members: prefixed(symbol, ""),
          title: symbol.name,
          symbol,
          section: "std",
          category: module.path === ""
            ? pkg.name
            : `${pkg.name}/${module.path}`,
          lookup: () => undefined,
          std: { package: pkg, module },
          children: []
        };
        identities.set(id, result);
        created.push(result);
      }

      for (const module of pkg.modules) {
        const names = new Map<string, SymbolPage>();
        for (const symbol of module.symbols) {
          const found = identities.get(identity(symbol));
          if (found) names.set(symbol.name, found);
        }
        byModule.set(module, names);
      }
    }

    const pages = shareCaseInsensitive(created);

    for (const page of created) {
      const { package: pkg, module } = page.std!;
      const rootModule = pkg.modules.find((candidate) => candidate.path === "");
      const scopes = [module, rootModule, ...pkg.modules].filter((candidate) => candidate !== undefined) as StdModule[];
      const local = (head: string) => {
        for (const scope of scopes) {
          const found = byModule.get(scope)?.get(head);
          if (found) return found;
        }
        return undefined;
      };

      page.lookup = (name) => memberLookup(normalize(name), local) ?? builtin.lookup(name);
    }

    const fromJsrUrl = (url: string): string | undefined => {
      const match = url.match(
        /^https:\/\/jsr\.io\/@ende\/([^/]+)(?:@[^/]+)?\/doc(?:\/([^~]*?))?\/?(?:~\/([^#?]+))?\/?$/
      );
      if (!match) return undefined;

      const pkg = packages.find((candidate) => short(candidate) === match[1]);
      const module = pkg?.modules.find((candidate) =>
        candidate.path ===
          (match[2] ?? "").replace(/\/$/, "").replaceAll("_", "-") ||
        candidate.path === (match[2] ?? "").replace(/\/$/, "")
      );
      if (!pkg || !module) return undefined;
      if (!match[3]) return moduleUrl(pkg, module);

      return byModule.get(module)?.get(match[3])?.url;
    };

    return {
      packages,
      pages,
      moduleUrl,
      packageUrl: (pkg) => `/runtime/reference/std/${short(pkg)}/`,
      exportsOf: (_pkg, module) =>
        [...(byModule.get(module) ?? new Map()).entries()]
          .map(([name, page]) => ({ name, page }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      fromJsrUrl
    };
  })();

  return stdPromise;
}

/** The categories of a section, sorted, with their URLs. */
export function categories(
  pages: SymbolPage[],
  section: Section
): { name: string; slug: string; url: string; pages: SymbolPage[] }[] {
  const groups = new Map<string, SymbolPage[]>();

  for (const page of pages) {
    if (page.section !== section) continue;
    groups.set(page.category, [...(groups.get(page.category) ?? []), page]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b))
    .map(([name, pages]) => ({
      name,
      slug: categorySlug(name),
      url: `/api/${section}/${categorySlug(name)}/`,
      pages: pages.sort((a, b) => a.title.localeCompare(b.title))
    }));
}
