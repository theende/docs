---
last_modified: 2026-10-20
title: "Environment variables"
description: "A guide to working with environment variables in Ende. Learn about Ende.env API, .env file support, CLI configuration, and special environment variables that control Ende's behavior."
oldUrl:
  - /runtime/manual/basics/env_variables/
  - /runtime/reference/cli/env_variables/
---

There are a few ways to use environment variables in Ende:

## Built-in Ende.env method

The Ende runtime offers built-in support for environment variables with
[`Ende.env`](https://docs.ende.sh/api/ende/~/Ende.env).

[`Ende.env`](/api/ende/~/Ende.Env/#env) has getter and setter methods. Here is
example usage:

```ts
Ende.env.set("FIREBASE_API_KEY", "examplekey123");
Ende.env.set("FIREBASE_AUTH_DOMAIN", "firebasedomain.com");

console.log(Ende.env.get("FIREBASE_API_KEY")); // examplekey123
console.log(Ende.env.get("FIREBASE_AUTH_DOMAIN")); // firebasedomain.com
console.log(Ende.env.has("FIREBASE_AUTH_DOMAIN")); // true
```

## .env file

Ende also supports `.env` files. You can tell Ende to read environment variables
from `.env` with the `--env-file` flag, for example:

```sh
ende run --env-file main.ts
```

This will read the `.env` file from the current working directory or the first
parent directory that contains one. If you want to load environment variables
from a different file, you can specify that file as a parameter to the flag.

You can pass multiple `--env-file` flags (e.g.,
`ende run --env-file=.env.one --env-file=.env.two --allow-env <script>`) to load
variables from multiple files.

> [!NOTE]
> When multiple declarations for the same environment variable exist within a
> single `.env` file, the first occurrence is applied. However, if the same
> variable is defined across multiple `.env` files (using multiple `--env-file`
> arguments), the value from the last file specified takes precedence. This
> means that the first occurrence found in the last `.env` file listed will be
> applied.

## [`@ende/dotenv`](/runtime/reference/std/dotenv/)

The `dotenv` package in the Standard Library can be used to load environment
variables from `.env`.

Let's say you have an `.env` file that looks like this:

```sh
GREETING="Hello, world."
```

Import the `load` module to auto-import from the `.env` file and into the
process environment.

```ts
import { load } from "jsr:@ende/dotenv";

const env = await load({
  // optional: choose a specific path (defaults to ".env")
  envPath: ".env.local",
  // optional: also export to the process environment (so Ende.env can read it)
  export: true
});

console.log(env.GREETING);
console.log(Ende.env.get("GREETING"));
```

Run this with `ende run --allow-read --allow-env app.ts`.

Further documentation for `.env` handling can be found in the
[@ende/dotenv](https://jsr.io/@ende/dotenv/doc) documentation.

## Set a variable when running a command

As with other CLI commands, you can set environment variables before running a
command like so:

```shell
MY_VAR="my value" ende run main.ts
```

This can be useful when you want to vary a task based on an environment
variable, and can be helpfully combined with
[`ende task`](/runtime/reference/cli/task/) commands like so:

```jsonc title="ende.json"
{

  ...
  
  "tasks": {
    "build:full": {
      "description": "Build the site with all features",
      "command": "BUILD_TYPE=FULL ende run main.ts"
    },
    "build:light": {
      "description": "Build the site without expensive operations",
      "command": "BUILD_TYPE=LIGHT ende run main.ts"
    }
  }
}
```

> [!NOTE] Variables with spaces
>
> When setting environment variables that contain space characters in a `.env`
> file, ensure you enclose the value in quotes. For example:
>
> ```shell
> MY_VAR="my value with spaces"
> ```

## Special environment variables

The Ende runtime has these special environment variables.

| name                   | description                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ENDE_AUTH_TOKENS       | A semi-colon separated list of bearer tokens and hostnames to use when fetching remote modules from private repositories<br/>(e.g. `abcde12345@ende.sh;54321edcba@github.com`)                                                                                                  |
| ENDE_TLS_CA_STORE      | Comma-separated list of order dependent certificate stores.<br/>Possible values: `system`, `mozilla`. Defaults to `mozilla`.                                                                                                                                                    |
| ENDE_CERT              | Load certificate authorities from a PEM encoded file. The file can contain more than one certificate, each in its own PEM block. This is the environment variable form of the `--cert` flag.                                                                                    |
| ENDE_COVERAGE_DIR      | Set the directory for collecting coverage profile data. This option only works for [`ende test` subcommand](/runtime/reference/cli/test/).                                                                                                                                      |
| ENDE_DIR               | Set the cache directory                                                                                                                                                                                                                                                         |
| ENDE_INSTALL_ROOT      | Set the installation root for `ende install` and the [install scripts](/runtime/getting_started/installation/). Executables are placed in its `bin` subdirectory, unless the path already ends with `bin` (defaults to `$HOME/.ende`, i.e. executables go to `$HOME/.ende/bin`) |
| ENDE_REPL_HISTORY      | Set REPL history file path History file is disabled when the value is empty <br/>(defaults to `$ENDE_DIR/ende_history.txt`)                                                                                                                                                     |
| ENDE_UNSTABLE_TSGO     | Set to `1` to type-check with TypeScript's native (Go) compiler. Equivalent to the `--unstable-tsgo` flag. See [TypeScript](/runtime/fundamentals/typescript/#faster-type-checking-with-the-native-compiler-tsgo).                                                              |
| ENDE_NO_PROMPT         | Set to disable permission prompts on access<br/>(alternative to passing `--no-prompt` on invocation)                                                                                                                                                                            |
| ENDE_NO_UPDATE_CHECK   | Set to disable checking if a newer Ende version is available                                                                                                                                                                                                                    |
| ENDE_V8_FLAGS          | Set V8 command line options                                                                                                                                                                                                                                                     |
| ENDE_JOBS              | Number of parallel workers used for the `--parallel` flag with the test subcommand.<br/>Defaults to number of available CPUs.                                                                                                                                                   |
| ENDE_AUDIT_PERMISSIONS | Audit every permission access. Set to a file path to write JSONL, or to the literal value `otel` to emit OpenTelemetry log records via the configured OTel exporter. See [permissions audit](/runtime/reference/permissions/) for the field set.                                |
| ENDE_TRACE_PERMISSIONS | Set to `1` to enable stack traces in permission prompts (disabled by default because collecting traces costs performance)                                                                                                                                                       |
| ENDE_WEBGPU_TRACE      | Path to a directory to output a [WGPU trace](https://github.com/gfx-rs/wgpu/pull/619) to when using the WebGPU API                                                                                                                                                              |
| ENDE_WEBGPU_BACKEND    | Select the backend WebGPU will use, or a comma separated list of backends in order of preference. Possible values are `vulkan`, `dx12`, `metal`, or `opengl`                                                                                                                    |
| HTTP_PROXY             | Proxy address for HTTP requests (module downloads, fetch)                                                                                                                                                                                                                       |
| HTTPS_PROXY            | Proxy address for HTTPS requests (module downloads, fetch)                                                                                                                                                                                                                      |
| NO_COLOR               | Set to disable color                                                                                                                                                                                                                                                            |
| NO_PROXY               | Comma-separated list of hosts which do not use a proxy (module downloads, fetch)                                                                                                                                                                                                |
