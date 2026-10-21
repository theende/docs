// Prints the types, parameters and signatures of `ende doc --json` data as
// escaped HTML, with type references linked where `link` finds a page.

import { escape } from "@ende/html";
import type { Param, TsType, TsTypeLiteral, TypeParam } from "./doc.ts";

/** Finds the reference URL for a type name, or `undefined`. */
export type Linker = (name: string) => string | undefined;

function list(items: string[], separator = ", "): string {
  return items.join(separator);
}

/** Types that need parentheses inside an array, union or similar. */
function needsParens(type: TsType): boolean {
  return [
    "union",
    "intersection",
    "fnOrConstructor",
    "conditional",
    "typeOperator",
    "infer"
  ]
    .includes(type.kind);
}

function wrapped(type: TsType, link: Linker): string {
  const text = typeHtml(type, link);
  return needsParens(type) ? `(${text})` : text;
}

function name(text: string, link: Linker): string {
  const url = link(text);
  return url ? `<a href="${escape(url)}">${escape(text)}</a>` : escape(text);
}

export function typeParamsHtml(
  params: TypeParam[] | undefined,
  link: Linker
): string {
  if (!params || params.length === 0) return "";

  return `&lt;${
    list(params.map((param) => {
      let text = escape(param.name);
      if (param.constraint) {
        text += ` extends ${typeHtml(param.constraint, link)}`;
      }
      if (param.default) text += ` = ${typeHtml(param.default, link)}`;
      return text;
    }))
  }&gt;`;
}

export function paramHtml(param: Param, link: Linker): string {
  const type = (text: string, tsType?: TsType, optional?: boolean) =>
    `${text}${optional ? "?" : ""}${tsType ? `: ${typeHtml(tsType, link)}` : ""}`;

  switch (param.kind) {
    case "identifier":
      return type(escape(param.name), param.tsType, param.optional);
    case "rest":
      return type(
        `...${paramHtml({ ...param.arg, tsType: undefined } as Param, link)}`,
        param.tsType
      );
    case "assign":
      return `${paramHtml(param.left, link)} = ${escape(param.right)}`;
    case "array":
      return type(
        `[${list((param.elements ?? []).map((element) => element ? paramHtml(element, link) : ""))}]`,
        param.tsType,
        param.optional
      );
    case "object":
      return type(
        `{ ${list((param.props ?? []).map((prop) => escape(prop.key ?? prop.name ?? "…")))} }`,
        param.tsType,
        param.optional
      );
    default:
      return escape((param as { name?: string }).name ?? "…");
  }
}

export function paramsHtml(params: Param[] | undefined, link: Linker): string {
  return `(${list((params ?? []).map((param) => paramHtml(param, link)))})`;
}

function literalHtml(
  value: NonNullable<TsType["value"]> & { kind: string },
  link: Linker
): string {
  switch (value.kind) {
    case "string":
      return escape(JSON.stringify(value.string));
    case "number":
      return escape(String(value.number));
    case "bigInt":
      return escape(`${value.string}n`);
    case "boolean":
      return String(value.boolean);
    case "template":
      return `\`${
        (value.tsTypes as TsType[]).map((part) =>
          part.kind === "literal" &&
            (part.value as { kind: string }).kind === "string"
            ? escape((part.value as { string: string }).string)
            : `\${${typeHtml(part, link)}}`
        ).join("")
      }\``;
    default:
      return escape(String(value.kind));
  }
}

/** A type literal's members, inline: `{ a: string; b(): void }`. */
export function typeLiteralHtml(literal: TsTypeLiteral, link: Linker): string {
  const members: string[] = [];

  for (const signature of literal.constructors ?? []) {
    members.push(
      `new ${typeParamsHtml(signature.typeParams, link)}${paramsHtml(signature.params, link)}${
        signature.returnType ? `: ${typeHtml(signature.returnType, link)}` : ""
      }`
    );
  }
  for (const signature of literal.callSignatures ?? []) {
    members.push(
      `${typeParamsHtml(signature.typeParams, link)}${paramsHtml(signature.params, link)}${
        signature.tsType ? `: ${typeHtml(signature.tsType, link)}` : ""
      }`
    );
  }
  for (const signature of literal.indexSignatures ?? []) {
    members.push(
      `${signature.readonly ? "readonly " : ""}[${list(signature.params.map((param) => paramHtml(param, link)))}]${
        signature.tsType ? `: ${typeHtml(signature.tsType, link)}` : ""
      }`
    );
  }
  for (const property of literal.properties ?? []) {
    members.push(
      `${property.readonly ? "readonly " : ""}${escape(property.name)}${property.optional ? "?" : ""}${
        property.tsType ? `: ${typeHtml(property.tsType, link)}` : ""
      }`
    );
  }
  for (const method of literal.methods ?? []) {
    const prefix = method.kind === "getter"
      ? "get "
      : method.kind === "setter"
      ? "set "
      : "";
    members.push(
      `${prefix}${escape(method.name)}${method.optional ? "?" : ""}${typeParamsHtml(method.typeParams, link)}${
        paramsHtml(method.params, link)
      }${method.returnType ? `: ${typeHtml(method.returnType, link)}` : ""}`
    );
  }

  return members.length === 0 ? "{}" : `{ ${members.join("; ")} }`;
}

/** A type as escaped HTML. */
export function typeHtml(type: TsType | undefined, link: Linker): string {
  if (!type) return "unknown";

  // ende-lint-ignore no-explicit-any
  const value = type.value as any;

  switch (type.kind) {
    case "keyword":
      return escape(value);
    case "this":
      return "this";
    case "typeRef": {
      const params = value.typeParams as TsType[] | undefined;
      const local = value.resolution?.kind === "typeParam";
      return `${local ? escape(value.typeName) : name(value.typeName, link)}${
        params && params.length > 0
          ? `&lt;${list(params.map((param) => typeHtml(param, link)))}&gt;`
          : ""
      }`;
    }
    case "literal":
      return literalHtml(value, link);
    case "union":
      return list(
        (value as TsType[]).map((member) => typeHtml(member, link)),
        " | "
      );
    case "intersection":
      return list(
        (value as TsType[]).map((member) => typeHtml(member, link)),
        " &amp; "
      );
    case "array":
      return `${wrapped(value, link)}[]`;
    case "tuple":
      return `[${list((value as TsType[]).map((member) => typeHtml(member, link)))}]`;
    case "typeOperator":
      return `${escape(value.operator)} ${wrapped(value.tsType, link)}`;
    case "parenthesized":
      return `(${typeHtml(value, link)})`;
    case "rest":
      return `...${typeHtml(value ?? (type as unknown as { tsType: TsType }).tsType, link)}`;
    case "optional":
      return `${wrapped(value, link)}?`;
    case "typeQuery":
      return `typeof ${name(value, link)}`;
    case "fnOrConstructor":
      return `${value.constructor ? "new " : ""}${typeParamsHtml(value.typeParams, link)}${
        paramsHtml(value.params, link)
      } =&gt; ${typeHtml(value.tsType, link)}`;
    case "conditional":
      return `${typeHtml(value.checkType, link)} extends ${typeHtml(value.extendsType, link)} ? ${
        typeHtml(value.trueType, link)
      } : ${typeHtml(value.falseType, link)}`;
    case "infer":
      return `infer ${escape(value.typeParam.name)}${
        value.typeParam.constraint
          ? ` extends ${typeHtml(value.typeParam.constraint, link)}`
          : ""
      }`;
    case "indexedAccess":
      return `${value.readonly ? "readonly " : ""}${wrapped(value.objType, link)}[${typeHtml(value.indexType, link)}]`;
    case "mapped": {
      const readonly = value.readonly === true
        ? "readonly "
        : value.readonly === "+"
        ? "+readonly "
        : value.readonly === "-"
        ? "-readonly "
        : "";
      const optional = value.optional === true
        ? "?"
        : value.optional === "+"
        ? "+?"
        : value.optional === "-"
        ? "-?"
        : "";
      const key = `${escape(value.typeParam.name)} in ${typeHtml(value.typeParam.constraint, link)}${
        value.nameType ? ` as ${typeHtml(value.nameType, link)}` : ""
      }`;
      return `{ ${readonly}[${key}]${optional}: ${typeHtml(value.tsType, link)} }`;
    }
    case "typeLiteral":
      return typeLiteralHtml(value, link);
    case "typePredicate": {
      const subject = value.param.type === "this"
        ? "this"
        : escape(value.param.name);
      return `${value.asserts ? "asserts " : ""}${subject}${value.type ? ` is ${typeHtml(value.type, link)}` : ""}`;
    }
    case "importType":
      return `import(${escape(JSON.stringify(value.specifier))})${
        value.qualifier ? `.${escape(value.qualifier)}` : ""
      }`;
    default:
      return escape(type.kind);
  }
}
