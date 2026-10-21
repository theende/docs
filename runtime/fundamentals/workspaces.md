---
last_modified: 2026-10-20
title: "Workspaces and monorepos"
description: "A guide to managing workspaces and monorepos in Ende. Learn about workspace configuration, package management, dependency resolution, and how to structure multi-package projects effectively."
oldUrl: /runtime/manual/basics/workspaces
---

Ende supports workspaces, also known as "monorepos", which allow you to manage
multiple related and interdependent packages simultaneously.

A "workspace" is a collection of folders containing
[`ende.json`](/runtime/fundamentals/configuration/) configuration files. The
root `ende.json` file defines the workspace:

```json title="ende.json"
{
  "workspace": ["./add", "./subtract"]
}
```

This configures a workspace with `add` and `subtract` members, which are
directories expected to have an `ende.json(c)` file.

## Example

Let's expand on the `ende.json` workspace example and see its functionality. The
file hierarchy looks like this:

```sh
/
├── ende.json
├── main.ts
├── add/
│     ├── ende.json
│     └── mod.ts
└── subtract/
      ├── ende.json
      └── mod.ts
```

There are two workspace members (add and subtract), each with `mod.ts` files.
There is also a root `ende.json` and a `main.ts`.

The top-level `ende.json` configuration file defines the workspace and a
top-level import map applied to all members:

```json title="ende.json"
{
  "workspace": ["./add", "./subtract"],
  "imports": {
    "@ende/fmt": "jsr:@ende/fmt@^2026.10.15"
  }
}
```

The root `main.ts` file uses the `@ende/fmt` bare specifier from the import map
and imports the `add` and `subtract` functions from the workspace members. Note
that it imports them using `@scope/add` and `@scope/subtract`, even though these
are not proper URLs and aren't in the import map. How are they resolved?

```ts title="main.ts"
import { green, red } from "@ende/fmt/colors";
import { add } from "@scope/add";
import { subtract } from "@scope/subtract";

console.log("1 + 2 =", green(String(add(1, 2))));
console.log("2 - 4 =", red(String(subtract(2, 4))));
```

In the `add/` subdirectory, we define a `ende.json` with a `"name"` field, which
is important for referencing the workspace member. The `ende.json` file also
contains example configurations, like turning off semicolons when using
`ende fmt`.

```json title="add/ende.json"
{
  "name": "@scope/add",
  "version": "0.1.0",
  "exports": "./mod.ts",
  "fmt": {
    "semiColons": false
  }
}
```

```ts title="add/mod.ts"
export function add(a: number, b: number): number {
  return a + b;
}
```

The `subtract/` subdirectory is similar but does not have the same `ende fmt`
configuration.

```json title="subtract/ende.json"
{
  "name": "@scope/subtract",
  "version": "0.3.0",
  "exports": "./mod.ts"
}
```

```ts title="subtract/mod.ts"
import { add } from "@scope/add";

export function subtract(a: number, b: number): number {
  return add(a, b * -1);
}
```

Let's run it:

```sh
> ende run main.ts
1 + 2 = 3
2 - 4 = -2
```

There's a lot to unpack here, showcasing some of the Ende workspace features:

1. This monorepo consists of two packages, placed in `./add` and `./subtract`
   directories.

1. By using `name` and `version` options in members' `ende.json` files, it's
   possible to refer to them using "bare specifiers" across the whole workspace.
   In this case, the packages are named `@scope/add` and `@scope/subtract`,
   where `scope` is the "scope" name you can choose. With these two options,
   it's not necessary to use long and relative file paths in import statements.

1. `jsr:@ende/fmt` is a shared dependency in the entire workspace. Workspace
   members "inherit" `imports` of the workspace root, allowing to easily manage
   a single version of a dependency across the codebase.

1. `add` subdirectory specifies in its `ende.json` that `ende fmt` should not
   apply semicolons when formatting the code. This makes for a much smoother
   transition for existing projects, without a need to change tens or hundreds
   of files in one go.

## Workspace path patterns

Ende supports pattern matching for workspace member folders, making it easier to
manage workspaces with many members or with a specific directory structure. You
can use wildcard patterns to include multiple directories at once:

```json title="ende.json"
{
  "workspace": [
    "some-dir/*",
    "other-dir/*/*"
  ]
}
```

> [!NOTE]
> Pattern support was.

The pattern matching syntax follows specific rules regarding folder depth:

`some-path/*` matches files and directories directly within `some-path` (first
level of indentation only). For example, with `packages/*`, this includes
`packages/foo` and `packages/bar` but not `packages/foo/subpackage`.

`some-path/*/*` matches the files and directories located within subdirectories
of `some-path` (second level of indentation). It does not match items directly
within `some-path`. For example, with `examples/*/*`, this includes
`examples/basic/demo` and `examples/advanced/sample` but not `examples/basic`.

Each `/*` segment in the pattern corresponds to a specific folder depth relative
to the base path. This allows for precise targeting of workspace members at
different levels within your directory structure.

### Recursive matching

Use `**` to match directories at any depth below a base path, instead of pinning
to a single level. For example, `packages/**` matches `packages/foo`,
`packages/foo/subpackage`, and any deeper directories that contain a config
file:

```json title="ende.json"
{
  "workspace": ["packages/**"]
}
```

### Excluding members

Prefix a pattern with `!` to exclude directories that an earlier pattern would
otherwise include. This is handy when a wildcard sweeps up a directory you don't
want as a workspace member. Both literal paths and globs work after the `!`:

```json title="ende.json"
{
  "workspace": [
    "packages/*",
    "!packages/internal",
    "!packages/*/fixtures"
  ]
}
```

Here `packages/*` includes every directory under `packages`, then the two
exclusions drop `packages/internal` and any `fixtures` directory one level down.

## How Ende resolves workspace dependencies

When running a project in a workspace that imports from another workspace
member, Ende follows these steps to resolve the dependencies:

1. Ende starts in the directory of the executing project (e.g., project A)
2. It looks up in the parent directory for a root `ende.json` file
3. If found, it checks for the `workspace` property in that file
4. For each import statement in project A, Ende checks if the import matches a
   package name defined in any workspace member's `ende.json`
5. If a matching package name is found, Ende verifies that the containing
   directory is listed in the root workspace configuration
6. The import is then resolved to the correct file using the `exports` field in
   the workspace member's `ende.json`

For example, given this structure:

```sh
/
├── ende.json         # workspace: ["./project-a", "./project-b"]
├── project-a/
│   ├── ende.json     # name: "@scope/project-a"
│   └── mod.ts        # imports from "@scope/project-b"
└── project-b/
    ├── ende.json     # name: "@scope/project-b"
    └── mod.ts
```

When `project-a/mod.ts` imports from `"@scope/project-b"`, Ende:

1. Sees the import statement
2. Checks parent directory's `ende.json`
3. Finds `project-b` in the workspace array
4. Verifies `project-b/ende.json` exists and has matching package name
5. Resolves the import using `project-b`'s exports

### Important note for containerization

When containerizing a workspace member that depends on other workspace members,
you must include:

1. The root `ende.json` file
2. All dependent workspace packages
3. The same directory structure as your development environment

For example, if dockerizing `project-a` above, your Dockerfile should:

```dockerfile
COPY ende.json /app/ende.json
COPY project-a/ /app/project-a/
COPY project-b/ /app/project-b/
```

This preserves the workspace resolution mechanism that Ende uses to find and
import workspace dependencies.

## Multiple package entries

The `exports` property details the entry points and exposes which modules should
be importable by users of your package.

So far, our package only has a single entry. This is fine for simple packages,
but often you'll want to have multiple entries that group relevant aspects of
your package. This can be done by passing an `object` instead of a `string` to
`exports`:

```json title="my-package/ende.json"
{
  "name": "@scope/my-package",
  "version": "0.3.0",
  "exports": {
    ".": "./mod.ts",
    "./foo": "./foo.ts",
    "./other": "./dir/other.ts"
  }
}
```

The `"."` entry is the default entry that's picked when importing
`@scope/my-package`. Therefore, the above `ende.json` example provides the
following entries:

- `@scope/my-package`
- `@scope/my-package/foo`
- `@scope/my-package/other`

## Publishing workspace packages to registries

Workspaces make it easy to publish packages to registries like JSR. You can
publish individual workspace members while keeping their development connected
in your monorepo.

#### Publishing to JSR

To publish a workspace package to JSR, follow these steps:

1. Ensure each package has the appropriate metadata in its `ende.json`:

```json title="my-package/ende.json"
{
  "name": "@scope/my-package",
  "version": "1.0.0",
  "exports": "./mod.ts",
  "publish": {
    "exclude": ["tests/", "*.test.ts", "examples/"]
  }
}
```

2. Navigate to the specific package directory and publish:

```sh
cd my-package
ende publish
```

#### Excluding a workspace member from publish

Workspaces often contain members that are not meant to be published, such as
internal helpers, examples, or packages that only exist to host shared `tasks`.
By default `ende publish` will try to publish every workspace member that has a
`name` and `exports`, and will error if any of them is missing a `version`.

To opt a member out of `ende publish`, set `"publish": false` in that member's
`ende.json`:

```jsonc title="internal-helpers/ende.json"
{
  "name": "@scope/internal-helpers",
  "tasks": {
    "build": "ende run -A scripts/build.ts"
  },
  "publish": false
}
```

The member is still part of the workspace. Its `tasks` run, its `imports` are
resolved, and other members can depend on it, but `ende publish` skips it
entirely and won't complain about a missing `version`.

#### Managing interdependent packages

When publishing packages from a workspace with interdependencies, use consistent
versioning schemes across related packages. Publish dependent packages first,
then the packages that depend on them. After publishing, verify the published
packages work as expected:

```sh
# Test a published package
ende add jsr:@scope/my-published-package
ende test integration-test.ts
```

When publishing packages that depend on other workspace members, Ende will
automatically replace workspace references with proper registry references in
the published code.

## Configuring built-in Ende tools

Some configuration options only make sense at the root of the workspace, eg.
specifying `nodeModulesDir` option in one of the members is not available and
Ende will warn if an option needs to be applied at the workspace root.

Here's a full matrix of various `ende.json` options available at the workspace
root and its members:

| Option               | Workspace | Package | Notes                                                                                                                                                                                                           |
| -------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| compilerOptions      | ✅        | ✅      |                                                                                                                                                                                                                 |
| importMap            | ✅        | ❌      | Exclusive with imports and scopes per config file. Additionally, it is not supported to have importMap in the workspace config, and imports in the package config.                                              |
| imports              | ✅        | ✅      | Exclusive with importMap per config file.                                                                                                                                                                       |
| scopes               | ✅        | ❌      | Exclusive with importMap per config file.                                                                                                                                                                       |
| exclude              | ✅        | ✅      |                                                                                                                                                                                                                 |
| lint.include         | ✅        | ✅      |                                                                                                                                                                                                                 |
| lint.exclude         | ✅        | ✅      |                                                                                                                                                                                                                 |
| lint.files           | ⚠️        | ❌      | Deprecated                                                                                                                                                                                                      |
| lint.rules.tags      | ✅        | ✅      | Tags are merged by appending package to workspace list. Duplicates are ignored.                                                                                                                                 |
| lint.rules.include   | ✅        | ✅      | Rules are merged per package, with package taking priority over workspace (package include is stronger than workspace exclude).                                                                                 |
| lint.rules.exclude   | ✅        | ✅      | Rules are merged per package, with package taking priority over workspace (package include is stronger than workspace exclude).                                                                                 |
| lint.report          | ✅        | ❌      | Only one reporter can be active at a time, so allowing different reporters per workspace would not work in the case where you lint files spanning multiple packages.                                            |
| fmt.include          | ✅        | ✅      |                                                                                                                                                                                                                 |
| fmt.exclude          | ✅        | ✅      |                                                                                                                                                                                                                 |
| fmt.files            | ⚠️        | ❌      | Deprecated                                                                                                                                                                                                      |
| fmt.useTabs          | ✅        | ✅      | Package takes priority over workspace.                                                                                                                                                                          |
| fmt.indentWidth      | ✅        | ✅      | Package takes priority over workspace.                                                                                                                                                                          |
| fmt.singleQuote      | ✅        | ✅      | Package takes priority over workspace.                                                                                                                                                                          |
| fmt.proseWrap        | ✅        | ✅      | Package takes priority over workspace.                                                                                                                                                                          |
| fmt.semiColons       | ✅        | ✅      | Package takes priority over workspace.                                                                                                                                                                          |
| fmt.options.\*       | ⚠️        | ❌      | Deprecated                                                                                                                                                                                                      |
| minimumDependencyAge | ✅        | ❌      | Resolution behaviour must be the same in the entire workspace.                                                                                                                                                  |
| nodeModulesDir       | ✅        | ❌      | Resolution behaviour must be the same in the entire workspace.                                                                                                                                                  |
| vendor               | ✅        | ❌      | Resolution behaviour must be the same in the entire workspace.                                                                                                                                                  |
| allowScripts         | ✅        | ❌      | Must be defined at the workspace root to ensure consistent security policy across all packages.                                                                                                                 |
| links                | ✅        | ❌      | Only respected in the workspace root.                                                                                                                                                                           |
| tasks                | ✅        | ✅      | Package tasks take priority over workspace. cwd used is the cwd of the config file that the task was inside of.                                                                                                 |
| test.include         | ✅        | ✅      |                                                                                                                                                                                                                 |
| test.exclude         | ✅        | ✅      |                                                                                                                                                                                                                 |
| test.files           | ⚠️        | ❌      | Deprecated                                                                                                                                                                                                      |
| publish              | ❌        | ✅      | Set to `false` to exclude a member from `ende publish`. See [Excluding a workspace member from publish](#excluding-a-workspace-member-from-publish).                                                            |
| publish.include      | ✅        | ✅      |                                                                                                                                                                                                                 |
| publish.exclude      | ✅        | ✅      |                                                                                                                                                                                                                 |
| bench.include        | ✅        | ✅      |                                                                                                                                                                                                                 |
| bench.exclude        | ✅        | ✅      |                                                                                                                                                                                                                 |
| bench.files          | ⚠️        | ❌      | Deprecated                                                                                                                                                                                                      |
| lock                 | ✅        | ❌      | Only a single lock file may exist per resolver, and only resolver may exist per workspace, so conditional enablement of the lockfile per package does not make sense.                                           |
| unstable             | ✅        | ❌      | For simplicities sake, we do not allow unstable flags, because a lot of the CLI assumes that unstable flags are immutable and global to the entire process. Also weird interaction with ENDE_UNSTABLE_\* flags. |
| name                 | ❌        | ✅      |                                                                                                                                                                                                                 |
| version              | ❌        | ✅      |                                                                                                                                                                                                                 |
| exports              | ❌        | ✅      |                                                                                                                                                                                                                 |
| workspace            | ✅        | ❌      | Nested workspaces are not supported.                                                                                                                                                                            |

## Running commands across workspaces

Ende provides several ways to run commands across all or specific workspace
members:

### Type checking

Workspace members can have different sets of compiler options. They are also
inherited between root and member, much like
[TSConfig `extends`](https://www.typescriptlang.org/tsconfig/#extends). For
example:

```json title="ende.json"
{
  "workspace": ["./web"],
  "compilerOptions": {
    "checkJs": true
  }
}
```

```json title="web/ende.json"
{
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  }
}
```

Files in the `web` subdirectory will be configured with the following options:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "lib": ["esnext", "dom"]
  }
}
```

Each member will be partitioned and checked separately from one another. Just
run `ende check` from the workspace root:

```sh
ende check
```

### Running tests

To run tests across all workspace members, simply execute `ende test` from the
workspace root:

```sh
ende test
```

This will run tests in all workspace members according to their individual test
configurations.

To run tests for a specific workspace member, you can either:

1. Change to that member's directory and run the test command:

```sh
cd my-directory
ende test
```

2. Or specify the path from the workspace root:

```sh
ende test my-directory/
```

### Formatting and linting

Similar to testing, formatting and linting commands run across all workspace
members by default:

```sh
ende fmt
ende lint
```

Each workspace member follows its own formatting and linting rules as defined in
its `ende.json` file, with some settings inherited from the root configuration
as shown in the table above.

### Using workspace tasks

You can define tasks at both the workspace root and in individual workspace
members:

```json title="ende.json"
{
  "workspace": ["./add", "./subtract"],
  "tasks": {
    "build": "echo 'Building all packages'",
    "test:all": "ende test"
  }
}
```

```json title="add/ende.json"
{
  "name": "@scope/add",
  "version": "0.1.0",
  "exports": "./mod.ts",
  "tasks": {
    "build": "echo 'Building add package'",
    "test": "ende test"
  }
}
```

To run a task defined in a specific package:

```sh
ende task --cwd=add build
```

## Sharing and managing dependencies

Workspace members can share dependencies, depend on each other, and resolve
version conflicts member by member. To pin one version of a dependency for the
whole workspace, declare it in the root's `imports`.

Workspaces provide powerful ways to share and manage dependencies across
projects:

### Sharing development dependencies

Common development dependencies like testing libraries can be defined at the
workspace root:

```json title="ende.json"
{
  "workspace": ["./add", "./subtract"],
  "imports": {
    "@ende/testing/": "jsr:@ende/testing@^2026.10.15/",
    "@ende/expect": "jsr:@ende/expect@^2026.10.15"
  }
}
```

This makes these dependencies available to all workspace members without needing
to redefine them.

### Managing version conflicts

When resolving dependencies, workspace members can override dependencies defined
in the root. If both the root and a member specify different versions of the
same dependency, the member's version will be used when resolving within that
member's folder. This allows individual packages to use specific dependency
versions when needed.

However, member-specific dependencies are scoped only to that member's folder.
Outside of member folders, or when working with files at the workspace root
level, the workspace root's import map will be used for resolving dependencies
(including JSR and HTTPS dependencies).

### Interdependent workspace members

As shown in the earlier example with the `add` and `subtract` modules, workspace
members can depend on each other. This enables a clean separation of concerns
while maintaining the ability to develop and test interdependent modules
together.

The `subtract` module imports functionality from the `add` module, demonstrating
how workspace members can build upon each other:

```ts title="subtract/mod.ts"
import { add } from "@scope/add";

export function subtract(a: number, b: number): number {
  return add(a, b * -1);
}
```

This approach allows you to:

1. Break down complex projects into manageable, single-purpose packages
2. Share code between packages without publishing to a registry
3. Test and develop interdependent modules together
4. Gradually migrate monolithic codebases to modular architecture
