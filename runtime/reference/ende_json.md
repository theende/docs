---
last_modified: 2026-10-20
title: "Configuration file (ende.json)"
description: "Reference for every ende.json field: dependencies and import maps, tasks, lint and fmt, lockfile, TypeScript compiler options, unstable flags, include/exclude, exports, permissions, compile, and proxies."
oldUrl:
  - /runtime/manual/basics/modules/import_maps/
  - /runtime/basics/import_maps/
  - /runtime/manual/linking_to_external_code/import_maps
  - /manual/linking_to_external_code/proxies
---

This page documents the fields you can set in a `ende.json` (or `ende.jsonc`)
configuration file. For an overview of how Ende discovers and applies
configuration, see the [Configuration](/runtime/fundamentals/configuration/)
concept page.

## Dependencies

The `"imports"` field in your `ende.json` allows you to specify dependencies
used in your project. You can use it to map bare specifiers to URLs or file
paths making it easier to manage dependencies and module resolution in your
applications.

For example, if you want to use the `assert` module from the standard library in
your project, you could use this import map:

```json title="ende.json"
{
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15",
    "@ende/fmt": "jsr:@ende/fmt@^2026.10.15"
  }
}
```

Then your script can use the bare specifiers `@ende/assert` and `@ende/fmt`:

```js title="script.ts"
import { assertEquals } from "@ende/assert";
import { yellow } from "@ende/fmt/colors";

assertEquals(1, 2);
console.log(yellow("Hello world"));
```

Read more about
[module imports and dependencies](/runtime/fundamentals/modules/)

### Custom path mappings

The import map in `ende.json` can be used for more general path mapping of
specifiers. You can map an exact specifiers to a third party module or a file
directly, or you can map a part of an import specifier to a directory.

```jsonc title="ende.jsonc"
{
  "imports": {
    // Map to an exact file
    "foo": "./some/long/path/foo.ts",
    // Map to a directory, usage: "bar/file.ts"
    "bar/": "./some/folder/bar/"
  }
}
```

Usage:

```ts
import * as foo from "foo";
import * as bar from "bar/file.ts";
```

Path mapping of import specifies is commonly used in larger code bases for
brevity.

For example:

```json title="ende.json"
{
  "imports": {
    "@/": "./"
  }
}
```

```ts title="main.ts"
import { MyUtil } from "@/util.ts";
```

This causes import specifiers starting with `@/` to be resolved relative to the
import map's URL or file path.

### Scoped mappings

The `"scopes"` field lets you override import mappings for modules loaded from a
particular path prefix, following the
[import maps specification](https://github.com/WICG/import-maps#scoping-examples).
Each key is a scope (a path prefix), and its value is an import map that applies
only to modules whose specifier falls under that scope. This is useful when two
dependencies need different versions of the same package.

```json title="ende.json"
{
  "imports": {
    "@ende/assert": "jsr:@ende/assert@^2026.10.15"
  },
  "scopes": {
    "./legacy/": {
      "@ende/assert": "jsr:@ende/assert@^2026.10.15"
    }
  }
}
```

In this example modules under `./legacy/` resolve `@ende/assert` to the older
version, while the rest of the project uses the version from `"imports"`.

### Overriding packages

The `links` field in `ende.json` allows you to override dependencies with local
packages stored on disk.

```json title="ende.json"
{
  "links": [
    "../some-package"
  ]
}
```

This capability addresses several common development challenges:

- Dependency bug fixes
- Private local libraries
- Compatibility issues

The package being referenced doesn't need to be published at all. It just needs
to have the proper package name and metadata in `ende.json`, so that Ende knows
what package it's dealing with. This provides greater flexibility and
modularity, maintaining clean separation between your main code and external
packages.

## Tasks

The `tasks` field in your `ende.json` file is used to define custom commands
that can be executed with the `ende task` command and allows you to tailor
commands and permissions to the specific needs of your project.

```json title="ende.json"
{
  "tasks": {
    "start": "ende run --allow-net --watch=static/,routes/,data/ dev.ts",
    "test": "ende test --allow-net",
    "lint": "ende lint"
  }
}
```

To execute a task, use the `ende task` command followed by the task name. For
example:

```sh
ende task start
ende task test
ende task lint
```

Read more about [`ende task`](/runtime/reference/cli/task/).

## Linting

The `lint` field in the `ende.json` file is used to configure the behavior of
Ende’s built-in linter. This allows you to specify which files to include or
exclude from linting, as well as customize the linting rules to suit your
project’s needs.

For example:

```json title="ende.json"
{
  "lint": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"],
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    }
  }
}
```

This configuration will:

- only lint files in the `src/` directory,
- not lint files in the `src/testdata/` directory or any TypeScript files in the
  `src/fixtures/` directory.
- specify that the recommended linting rules should be applied,
- add the `ban-untagged-todo`, and
- exclude the `no-unused-vars` rule.

You can find a full list of available linting rules in the
[List of rules](/lint/) documentation page.

Read more about [linting with Ende](/runtime/reference/cli/lint/).

## Formatting

The `fmt` field in the `ende.json` file is used to configure the behavior of
Ende’s built-in code formatter. This allows you to customize how your code is
formatted, ensuring consistency across your project, making it easier to read
and collaborate on. Here are the key options you can configure:

```json title="ende.json"
{
  "fmt": {
    "useTabs": true,
    "lineWidth": 80,
    "indentWidth": 4,
    "semiColons": true,
    "singleQuote": true,
    "proseWrap": "preserve",
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  }
}
```

This configuration will:

- use tabs instead of spaces for indentation,
- limit lines to 80 characters,
- use an indentation width of 4 spaces,
- add semicolons to the end of statements,
- use single quotes for strings,
- preserve prose wrapping,
- format files in the `src/` directory,
- exclude files in the `src/testdata/` directory and any TypeScript files in the
  `src/fixtures/` directory.

The `fmt` field accepts the following options, each shown with its default and
allowed values:

<div class="fmt-options">

| Option                                | Default                 | Possible values                                             |
| ------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `bracePosition`                       | `sameLine`              | `maintain`, `sameLine`, `nextLine`, `sameLineUnlessHanging` |
| `indentWidth`                         | `2`                     | a number                                                    |
| `lineWidth`                           | `80`                    | a number                                                    |
| `newLineKind`                         | `lf`                    | `auto`, `crlf`, `lf`, `system`                              |
| `nextControlFlowPosition`             | `sameLine`              | `sameLine`, `nextLine`, `maintain`                          |
| `operatorPosition`                    | `sameLine`              | `sameLine`, `nextLine`, `maintain`                          |
| `proseWrap`                           | `always`                | `always`, `never`, `preserve`                               |
| `quoteProps`                          | `asNeeded`              | `asNeeded`, `consistent`, `preserve`                        |
| `semiColons`                          | `true`                  | `true`, `false`                                             |
| `singleBodyPosition`                  | `sameLineUnlessHanging` | `sameLine`, `nextLine`, `maintain`, `sameLineUnlessHanging` |
| `singleQuote`                         | `false`                 | `true`, `false`                                             |
| `sortNamedExports`                    | `caseInsensitive`       | `caseInsensitive`, `caseSensitive`, `maintain`              |
| `sortNamedImports`                    | `caseInsensitive`       | `caseInsensitive`, `caseSensitive`, `maintain`              |
| `spaceAround`                         | `false`                 | `true`, `false`                                             |
| `spaceSurroundingProperties`          | `true`                  | `true`, `false`                                             |
| `trailingCommas`                      | `always`                | `always`, `never`                                           |
| `typeLiteral.separatorKind`           | `semiColon`             | `comma`, `semiColon`                                        |
| `useBraces`                           | `whenNotSingleLine`     | `maintain`, `whenNotSingleLine`, `always`, `preferNone`     |
| `useTabs`                             | `false`                 | `true`, `false`                                             |
| `json.trailingCommas`                 | `never`                 | `never`, `always`, `maintain`, `jsonc`                      |
| `jsx.bracketPosition`                 | `nextLine`              | `maintain`, `sameLine`, `nextLine`                          |
| `jsx.forceNewLinesSurroundingContent` | `false`                 | `true`, `false`                                             |
| `jsx.multiLineParens`                 | `prefer`                | `never`, `prefer`, `always`                                 |
| `unstable-component`                  | `false`                 | `true`, `false`                                             |
| `unstable-sql`                        | `false`                 | `true`, `false`                                             |

</div>

`json.trailingCommas` controls trailing commas in JSON and JSONC files
separately from the `trailingCommas` option, which applies to JavaScript and
TypeScript. The `maintain` value keeps trailing commas as written, and the
`jsonc` value adds trailing commas in `.jsonc` files while omitting them in
`.json` files.

Read more about [formatting your code with Ende](/runtime/lint_and_format/).

## Lockfile

The `lock` field in the `ende.json` file is used to specify configuration of the
lock file that Ende uses to
[ensure the integrity of your dependencies](/runtime/packages/#lockfile-and-reproducible-installs).
A lock file records the exact versions and integrity hashes of the modules your
project depends on, ensuring that the same versions are used every time the
project is run, even if the dependencies are updated or changed remotely.

```json title="ende.json"
{
  "lock": {
    "path": "./ende.lock",
    "frozen": true
  }
}
```

This configuration will:

- specify lockfile location at `./ende.lock` (this is the default and can be
  omitted)
- tell Ende that you want to error out if any dependency changes

Ende uses lockfile by default, you can disable it with following configuration:

```json title="ende.json"
{
  "lock": false
}
```

### Merge conflicts

After merging branches, `ende.lock` can be left with git conflict markers. These
markers make the file invalid JSON, which used to make Ende error out with
`Lockfile may be corrupt`. Ende now resolves these conflicts for you: the next
command that reads the lockfile merges the conflicting entries and rewrites a
clean file. Most of the lockfile is a set of identity-keyed entries where a key
always maps to the same value regardless of which branch wrote it, so the merge
is a union and you do not need to edit the markers by hand.

## Minimum dependency age

The `minimumDependencyAge` field stops Ende from installing JSR package versions
that were published more recently than the configured age. Freshly published
malicious versions are usually detected and yanked within days, so a small delay
window catches the bulk of supply-chain attacks. See
[supply chain management](/runtime/packages/supply_chain/) for guidance on
choosing a window.

```jsonc title="ende.json"
{
  // Don't install versions published less than 3 days ago
  "minimumDependencyAge": "P3D"
}
```

The value accepts an
[ISO-8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) such as
`P3D` or `PT72H`, a number of minutes (`120`), an absolute cutoff date
(`2025-09-16`) or RFC3339 timestamp, or `0` to disable.

A 24-hour minimum applies by default even when this field is unset; set an
explicit value to widen or narrow the window, or `0` to turn it off.

To exempt specific packages, use the object form with an `exclude` list:

```jsonc title="ende.json"
{
  "minimumDependencyAge": {
    "age": "P3D",
    "exclude": ["jsr:@mycompany/cli", "jsr:@mycompany/lib"]
  }
}
```

The same control is available as the `--minimum-dependency-age` CLI flag.

## TypeScript compiler options

The `compilerOptions` field in the `ende.json` file is used to configure
[TypeScript compiler settings](https://www.typescriptlang.org/tsconfig) for your
Ende project. This allows you to customize how TypeScript code is compiled,
ensuring it aligns with your project’s requirements and coding standards.

> [!NOTE]
> Ende recommends the default TypeScript configuration. This will help when
> sharing code.

Existing `tsconfig.json` files work out of the box with Ende. See the
[tsconfig.json compatibility reference](/runtime/reference/ts_config_migration/)
for the supported fields and precedence rules.

For the full list of supported compiler options, library configuration, and
advanced settings, see
[Configuring TypeScript](/runtime/reference/ts_config_migration/).

## Unstable features

The `unstable` field in a `ende.json` file is used to enable specific unstable
features for your Ende project.

These features are still in development and not yet part of the stable API. By
listing features in the `unstable` array, you can experiment with and use these
new capabilities before they are officially released.

```json title="ende.json"
{
  "unstable": ["cron", "webgpu"]
}
```

[Learn more](/runtime/reference/cli/unstable_flags/).

## include and exclude

Many configurations (ex. `lint`, `fmt`) have an `include` and `exclude` property
for specifying the files to include.

### include

Only the paths or patterns specified here will be included.

```jsonc
{
  "lint": {
    // only format the src/ directory
    "include": ["src/"]
  }
}
```

### exclude

The paths or patterns specified here will be excluded.

```jsonc
{
  "lint": {
    // don't lint the dist/ folder
    "exclude": ["dist/"]
  }
}
```

This has HIGHER precedence than `include` and will win over `include` if a path
is matched in both `include` and `exclude`.

You may wish to exclude a directory, but include a sub directory. In Ende
1.41.2+, you may un-exclude a more specific path by specifying a negated glob
below the more general exclude:

```jsonc
{
  "fmt": {
    // don't format the "fixtures" directory,
    // but do format "fixtures/scripts"
    "exclude": [
      "fixtures",
      "!fixtures/scripts"
    ]
  }
}
```

### Top level exclude

If there's a directory you never want Ende to fmt, lint, type check, analyze in
the LSP, etc., then specify it in the top level exclude array:

```jsonc
{
  "exclude": [
    // exclude the dist folder from all sub-commands and the LSP
    "dist/"
  ]
}
```

Sometimes you may find that you want to un-exclude a path or pattern that's
excluded in the top level-exclude. You may un-exclude a path by specifying a
negated glob in a more specific config:

```jsonc
{
  "fmt": {
    "exclude": [
      // format the dist folder even though it's
      // excluded at the top level
      "!dist"
    ]
  },
  "exclude": [
    "dist/"
  ]
}
```

### Publish - Override .gitignore

The `.gitignore` is taken into account for the `ende publish` command. In Ende
1.41.2+, you can opt-out of excluded files ignored in the _.gitignore_ by using
a negated exclude glob:

```title=".gitignore"
dist/
.env
```

```jsonc title="ende.json"
{
  "publish": {
    "exclude": [
      // include the .gitignored dist folder
      "!dist/"
    ]
  }
}
```

Alternatively, explicitly specifying the gitignored paths in an `"include"`
works as well:

```json
{
  "publish": {
    "include": [
      "dist/",
      "README.md",
      "ende.json"
    ]
  }
}
```

## Exports

The `exports` field in the `ende.json` file allows you to define which paths of
your package should be publicly accessible. This is particularly useful for
controlling the API surface of your package and ensuring that only the intended
parts of your code are exposed to users.

```jsonc title="ende.json"
{
  "exports": "./src/mod.ts" // A default entry point
}
```

You can also define multiple entry points:

```json title="ende.json"
{
  "exports": {
    "./module1": "./src/module1.ts",
    "./module2": "./src/module2.ts",
    ".": "./src/mod.ts" // Default entry point
  }
}
```

This configuration will:

- expose `module1` and `module2` as entry points for your package, and
- make `./src/mod.ts` the default entry point (`.`).

Users can import these modules using the specified paths, while other files in
your package remain private.

To use the exports in your code, you can import them like this:

```ts title="example.ts"
import * as module_1 from "@example/my-package/module1";
import * as module_2 from "@example/my-package/module2";
```

## Permissions

Ende supports storing [permission](/runtime/reference/permissions/) sets in the
config file.

### Named permissions

Permissions can be defined as key-value pairs under arbitrarily-named permission
sets under the `"permissions"` key. Within each set,

- the key is the name of a [permission](/runtime/reference/permissions/) that
  would follow `--allow-` or `--deny-` in the CLI invocation (i.e. `read`,
  `write`, `net`, `env`, `sys`, `run`, `ffi`, `import`)
- the value is a boolean (`true` / `false` correspond to allow / deny), an array
  of strings representing paths, domains etc., or an object with `allow`,
  `deny`, and/or `ignore` boolean key-value pairs.

```jsonc
{
  "permissions": {
    "read-data": {
      "read": "./data"
    },
    "read-and-write": {
      "read": true,
      "write": ["./data"]
    }
  }
}
```

Permission sets can be used by specifying the `--permission-set=<name>` or
`-P=<name>` flag:

```sh
$ ende run -P=read-data main.ts
```

### Default permission

A special `"default"` permission key allows excluding the name when using the
`--permission-set`/`-P` flag:

```jsonc
{
  "permissions": {
    "default": {
      "env": true
    }
  }
}
```

Then run with just `-P`:

```sh
$ ende run -P main.ts
```

### Allow, deny, and ignore

For finer control over permissions, you can use the object form with `allow`,
`deny`, and `ignore` keys. This is especially useful when you need more granular
permission control than simple boolean or array values provide.

#### Object form syntax

Instead of specifying a permission as a boolean or array:

```jsonc
{
  "permissions": {
    "default": {
      "read": true, // Simple boolean form
      "write": ["./data"] // Simple array form
    }
  }
}
```

You can use the object form:

```jsonc
{
  "permissions": {
    "default": {
      "read": {
        "allow": ["./data", "./config"],
        "deny": ["./data/secrets"],
        "ignore": ["./data/cache"]
      },
      "write": {
        "allow": ["./output"],
        "deny": ["./output/system"]
      }
    }
  }
}
```

#### Available permissions

The `allow`, `deny`, and `ignore` keys work differently depending on the
permission type:

- **`read` and `env`**: Support `allow`, `deny`, and `ignore`
- **`write`, `net`, `run`, `ffi`, `sys`, and `import`**: Support `allow` and
  `deny` (but not `ignore`)

#### Behavior

- **`allow`**: Explicitly grant access to specific resources. Can be `true` (to
  allow all), `false` (to allow none), or an array of specific paths/values to
  allow.
- **`deny`**: Explicitly deny access (throw
  [PermissionDenied](https://docs.ende.sh/api/ende/~/Ende.errors.PermissionDenied))
  to specific resources, even if they would otherwise be allowed. Can be `true`
  (to deny all), `false` (to deny none), or an array of specific paths/values to
  deny.
- **`ignore`**: (Only for `read` and `env` permissions) Silently ignore access
  attempts to specific resources without throwing errors. Can be `true`,
  `false`, or an array of specific paths/values to ignore.

#### Example

```jsonc
{
  "permissions": {
    "default": {
      // Allow reading from data directory, but deny access to secrets
      // and silently ignore cache files
      "read": {
        "allow": ["./data"],
        "deny": ["./data/secrets"],
        "ignore": ["./data/cache"]
      },
      // Allow all environment variables except API keys
      "env": {
        "allow": true,
        "ignore": ["API_KEY", "SECRET_TOKEN"]
      },
      // Allow all, but deny 'rm', 'sudo'
      "run": {
        "allow": true,
        "deny": ["rm", "sudo"]
      }
    }
  }
}
```

### Test, bench, and compile permissions

Permissions can be optionally specified within the `"test"`, `"bench"`, or
`"compile"` keys.

```jsonc
{
  "test": {
    "permissions": {
      "read": ["./data"]
    }
  }
}
```

Or reference a permission set:

```jsonc
{
  "test": {
    "permissions": "read-data"
  },
  "permissions": {
    "read-data": {
      "read": ["./data"]
    }
  }
}
```

When this is defined, you must run `ende test` with `-P` or a permission flag:

```
> ende test
error: Test permissions were found in the config file. Did you mean to run with `-P`?
    at file:///Users/david/dev/example/ende.json
> ende test -P
...runs...
> ende test --allow-read
...runs...
> ende test -A
...runs...
```

This is to help prevent you waste your time wondering why something is not
working when you forget to run without permissions.

Note that test and bench files in a workspace will use the closest `ende.json`
for determining `test` and `bench` permissions. This allows giving different
permissions to different workspace members.

### Security risk

The threat model for permissions in the config file is similar to `ende task`,
in that a script could modify the `ende.json` to elevate permissions. That's why
this requires an explicit opt-in with `-P` and is not loaded by default.

If you're ok with this risk, then this feature will be useful for you.

## Compile config

The `"compile"` block configures
[`ende compile`](/runtime/reference/cli/compile/) without requiring you to
repeat flags on every invocation. You can declare which extra files or
directories to bundle into the executable, and which paths to exclude:

```jsonc title="ende.json"
{
  "compile": {
    "include": ["names.csv", "data", "worker.ts"],
    "exclude": ["data/secrets", "**/*.test.ts"]
  }
}
```

`--include` and `--exclude` flags on the command line are merged with these
lists rather than replacing them. The `"compile"` block can also carry
`permissions` (see
[Test, bench, and compile permissions](#test-bench-and-compile-permissions)).

## An example `ende.json` file

```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["ende.window"],
    "strict": true
  },
  "permissions": {
    "default": {
      "read": {
        "allow": ["./src/"],
        "deny": ["./src/secrets/"]
      },
      "env": {
        "allow": true,
        "ignore": ["TEMP_*"]
      }
    }
  },
  "lint": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"],
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    }
  },
  "fmt": {
    "useTabs": true,
    "lineWidth": 80,
    "indentWidth": 4,
    "semiColons": false,
    "singleQuote": true,
    "proseWrap": "preserve",
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  },
  "lock": false,
  "unstable": ["webgpu"],
  "test": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  },
  "tasks": {
    "start": "ende run --allow-read main.ts"
  },
  "imports": {
    "@hono/hono": "jsr:@hono/hono@^4"
  },
  "exclude": [
    "dist/"
  ]
}
```

This is an example of a `ende.json` file that configures the TypeScript compiler
options, linter, formatter, etc. For a full list of available fields and
configurations, see the [Ende configuration file schema](#json-schema).

## JSON schema

A JSON schema file is available for editors to provide autocompletion. The file
is versioned and available at:
[https://github.com/theende/ende/blob/primary/cli/schemas/config-file.v1.json](https://github.com/theende/ende/blob/primary/cli/schemas/config-file.v1.json)

## Proxies

Ende supports proxies for module downloads and the fetch API. Proxy
configuration is read from
[environment variables](https://docs.ende.sh/runtime/reference/env_variables/#special-environment-variables):
HTTP_PROXY, HTTPS_PROXY and NO_PROXY.

If you are using Windows - if environment variables are not found Ende falls
back to reading proxies from the registry.
