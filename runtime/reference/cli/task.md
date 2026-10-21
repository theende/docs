---
last_modified: 2026-10-20
title: "ende task"
oldUrl:
  - /runtime/tools/task_runner/
  - /runtime/manual/tools/task_runner/
  - /runtime/reference/cli/task_runner/
command: task
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende task"
description: "A configurable task runner for Ende"
---

## Description

`ende task` provides a cross-platform way to define and execute custom commands
specific to a codebase.

To get started, define your commands in your codebase's
[Ende configuration file](/runtime/fundamentals/configuration/) under a
`"tasks"` key.

For example:

```jsonc title="ende.json"
{
  "tasks": {
    "data": "ende task collect && ende task analyze",
    "collect": "ende run --allow-read=. --allow-write=. scripts/collect.js",
    "analyze": {
      "description": "Run analysis script",
      "command": "ende run --allow-read=. scripts/analyze.js"
    }
  }
}
```

## Running a task only if it exists

`ende task <name>` exits with a non-zero code when the named task is not
defined. To make a task optional, pass `--if-present`. Ende then exits with code
0 and prints nothing when the task is missing, which is useful for shared CI
scripts that call a task only some packages define:

```sh
ende task --if-present build
```

The flag only suppresses the not-found case for the named task. Listing tasks
with a bare `ende task`, running a task that does exist, and real errors such as
a missing task dependency are unaffected.

## Specifying the current working directory

By default, `ende task` executes commands with the directory of the Ende
configuration file (ex. _ende.json_) as the current working directory. This
allows tasks to use relative paths and continue to work regardless of where in
the directory tree you happen to execute the ende task from. In some scenarios,
this may not be desired and this behavior can be overridden with the `INIT_CWD`
environment variable.

`INIT_CWD` will be set with the full path to the directory the task was run in,
if not already set.

For example, the following task will change the current working directory of the
task to be in the same directory the user ran the task from and then output the
current working directory which is now that directory (remember, this works on
Windows too because `ende task` is cross-platform).

```json title="ende.json"
{
  "tasks": {
    "my_task": "cd $INIT_CWD && pwd"
  }
}
```

## Getting directory `ende task` was run from

Since tasks are run using the directory of the Ende configuration file as the
current working directory, it may be useful to know the directory the
`ende task` was executed from instead. This is possible by using the `INIT_CWD`
environment variable in a task or script launched from `ende task` (this works
cross-platform).

For example, to provide this directory to a script in a task, do the following
(note the directory is surrounded in double quotes to keep it as a single
argument in case it contains spaces):

```json title="ende.json"
{
  "tasks": {
    "start": "ende run main.ts \"$INIT_CWD\""
  }
}
```

## Wildcard matching of tasks

The `ende task` command can run multiple tasks in parallel by passing a wildcard
pattern. A wildcard pattern is specified with the `*` character.

```json title="ende.json"
{
  "tasks": {
    "build:client": "ende run -RW client/build.ts",
    "build:server": "ende run -RW server/build.ts"
  }
}
```

Running `ende task "build:*"` will run both `build:client` and `build:server`
tasks.

For multi-word task names, we recommend using `:` as the separator (e.g.
`build:client`, `test:unit`, `lint:fix`) to group related tasks for wildcard
matching.

> [!NOTE]
> **When using a wildcard** make sure to quote the task name (eg. `"build:*"`),
> otherwise your shell might try to expand the wildcard character, leading to
> surprising errors.

Exclude tasks from a wildcard match by adding an exclusion group `(!a|b|c)` to
the end of the pattern. Each listed value is matched against what the `*`
captured. For example, given `test:unit`, `test:integration`, `test:e2e`, and
`test:interactive` tasks:

```sh
ende task "test:*(!e2e|interactive)"
```

runs `test:unit` and `test:integration` but skips `test:e2e` and
`test:interactive`. A pattern that has an exclusion group but no `*` is
rejected, since there is nothing to exclude from.

## Loading environment variables from a file

Pass `--env-file` to load variables from a dotenv file into the task's shell
environment, so every command in the task body inherits them:

```sh
# Load .env
ende task --env-file start

# Load a specific file
ende task --env-file=.env.production start
```

The flag can be given more than once to load multiple files, with later files
taking precedence. With no value it defaults to `.env`.

## Task dependencies

You can specify dependencies for a task:

```json title="ende.json"
{
  "tasks": {
    "build": "ende run -RW build.ts",
    "generate": "ende run -RW generate.ts",
    "serve": {
      "command": "ende run -RN server.ts",
      "dependencies": ["build", "generate"]
    }
  }
}
```

In the above example, running `ende task serve` will first execute `build` and
`generate` tasks in parallel, and once both of them finish successfully the
`serve` task will be executed:

```sh
ende task serve
Task build ende run -RW build.ts
Task generate ende run -RW generate.ts
Generating data...
Starting the build...
Build finished
Data generated
Task serve ende run -RN server.ts
Listening on http://localhost:8000/
```

Dependency tasks are executed in parallel, with the default parallel limit being
equal to number of cores on your machine. To change this limit for a single
invocation, pass `--jobs` (short `-j`, also spelled `--concurrency`); to set it
for the environment, use the `ENDE_JOBS` environment variable. The flag takes
precedence:

```sh
# Run workspace tasks fully sequentially
ende task --recursive --jobs 1 build
```

Dependencies are tracked and if multiple tasks depend on the same task, that
task will only be run once:

```jsonc title="ende.json"
{
  //   a
  //  / \
  // b   c
  //  \ /
  //   d
  "tasks": {
    "a": {
      "command": "ende run a.js",
      "dependencies": ["b", "c"]
    },
    "b": {
      "command": "ende run b.js",
      "dependencies": ["d"]
    },
    "c": {
      "command": "ende run c.js",
      "dependencies": ["d"]
    },
    "d": "ende run d.js"
  }
}
```

```sh
ende task a
Task d ende run d.js
Running d
Task c ende run c.js
Running c
Task b ende run b.js
Running b
Task a ende run a.js
Running a
```

If a cycle between dependencies is discovered, an error will be returned:

```jsonc title="ende.json"
{
  "tasks": {
    "a": {
      "command": "ende run a.js",
      "dependencies": ["b"]
    },
    "b": {
      "command": "ende run b.js",
      "dependencies": ["a"]
    }
  }
}
```

```sh
ende task a
Task cycle detected: a -> b -> a
```

You can also specify a task that has `dependencies` but no `command`. This is
useful to logically group several tasks together:

```json title="ende.json"
{
  "tasks": {
    "dev:client": "ende run --watch client/mod.ts",
    "dev:server": "ende run --watch server/mod.ts",
    "dev": {
      "dependencies": ["dev:client", "dev:server"]
    }
  }
}
```

Running `ende task dev` will run both `dev:client` and `dev:server` in parallel.

## Caching task results

A task can skip work when none of its inputs have changed. Add a `files` field
listing the input globs the task reads, and Ende fingerprints the command, its
appended arguments, the contents of the matching files, and the values of any
listed env vars, then skips the task on the next run when none of them changed.
Caching is opt-in: a task with no `files` field always runs.

```jsonc title="ende.json"
{
  "tasks": {
    "build": {
      "command": "ende run -RW build.ts",
      "files": ["src/**/*.ts", "ende.json"],
      "output": ["dist/"],
      "env": ["NODE_ENV"]
    }
  }
}
```

- `files` lists the input globs that make up the cache key. Declaring them is
  what turns on caching for the task.
- `output` lists the globs the task produces. On a cache hit they are restored
  from the cache, so deleting `dist/` and re-running regenerates it.
- `env` lists environment variable names whose values are part of the cache key,
  so the task re-runs when one of them changes.

A task's [dependency](#task-dependencies) fingerprints are folded into its own
cache key, so a task re-runs whenever an upstream one did.

## Workspace support

`ende task` can be used in workspaces, to run tasks from multiple member
directories in parallel. To execute `dev` tasks from all workspace members use
`--recursive` flag:

```jsonc title="ende.json"
{
  "workspace": [
    "client",
    "server"
  ]
}
```

```jsonc title="client/ende.json"
{
  "name": "@scope/client",
  "tasks": {
    "dev": "ende run -RN build.ts"
  }
}
```

```jsonc title="server/ende.json"
{
  "name": "@scope/server",
  "tasks": {
    "dev": "ende run -RN server.ts"
  }
}
```

```sh
ende task --recursive dev
Task dev ende run -RN build.ts
Task dev ende run -RN server.ts
Bundling project...
Listening on http://localhost:8000/
Project bundled
```

Tasks to run can be filtered based on the workspace members:

```sh
ende task --filter "client" dev
Task dev ende run -RN build.ts
Bundling project...
Project bundled
```

Note that the filter matches against the workspace member names as specified in
the `name` field of each member's
[`ende.json`](/runtime/fundamentals/configuration/) file.

## Syntax

`ende task` uses a cross-platform shell that's a subset of sh/bash to execute
defined tasks.

### Boolean lists

Boolean lists provide a way to execute additional commands based on the exit
code of the initial command. They separate commands using the `&&` and `||`
operators.

The `&&` operator provides a way to execute a command and if it _succeeds_ (has
an exit code of `0`) it will execute the next command:

```sh
ende run --allow-read=. --allow-write=. collect.ts && ende run --allow-read=. analyze.ts
```

The `||` operator is the opposite. It provides a way to execute a command and
only if it _fails_ (has a non-zero exit code) it will execute the next command:

```sh
ende run --allow-read=. --allow-write=. collect.ts || ende run play_sad_music.ts
```

### Sequential lists

Sequential lists are similar to boolean lists, but execute regardless of whether
the previous command in the list passed or failed. Commands are separated with a
semi-colon (`;`).

```sh
ende run output_data.ts ; ende run --allow-net server.ts
```

### Async commands

Async commands provide a way to make a command execute asynchronously. This can
be useful when starting multiple processes. To make a command asynchronous, add
an `&` to the end of it. For example the following would execute
`sleep 1 && ende run --allow-net server.ts` and `ende run --allow-net client.ts`
at the same time:

```sh
sleep 1 && ende run --allow-net server.ts & ende run --allow-net client.ts
```

Unlike in most shells, the first async command to fail will cause all the other
commands to fail immediately. In the example above, this would mean that if the
server command fails then the client command will also fail and exit. You can
opt out of this behavior by adding `|| true` to the end of a command, which will
force a `0` exit code. For example:

```sh
ende run --allow-net server.ts || true & ende run --allow-net client.ts || true
```

### Environment variables

Environment variables are defined like the following:

```sh
export VAR_NAME=value
```

Here's an example of using one in a task with shell variable substitution and
then with it being exported as part of the environment of the spawned Ende
process (note that in the JSON configuration file the double quotes would need
to be escaped with backslashes):

```sh
export VAR=hello && echo $VAR && ende eval "console.log('Ende: ' + Ende.env.get('VAR'))"
```

Would output:

```sh
hello
Ende: hello
```

#### Setting environment variables for a command

To specify environment variable(s) before a command, list them like so:

```sh
VAR=hello VAR2=bye ende run main.ts
```

This will use those environment variables specifically for the following
command.

### Shell variables

Shell variables are similar to environment variables, but won't be exported to
spawned commands. They are defined with the following syntax:

```sh
VAR_NAME=value
```

If we use a shell variable instead of an environment variable in a similar
example to what's shown in the previous "Environment variables" section:

```sh
VAR=hello && echo $VAR && ende eval "console.log('Ende: ' + Ende.env.get('VAR'))"
```

We will get the following output:

```sh
hello
Ende: undefined
```

Shell variables can be useful when we want to reuse a value, but don't want it
available in any spawned processes.

### Exit status variable

The exit code of the previously run command is available in the `$?` variable.

```sh
# outputs 10
ende eval 'Ende.exit(10)' || echo $?
```

### Pipelines

Pipelines provide a way to pipe the output of one command to another.

The following command pipes the stdout output "Hello" to the stdin of the
spawned Ende process:

```sh
echo Hello | ende run main.ts
```

To pipe stdout and stderr, use `|&` instead:

```sh
ende eval 'console.log(1); console.error(2);' |& ende run main.ts
```

### Command substitution

The `$(command)` syntax provides a way to use the output of a command in other
commands that get executed.

For example, to provide the output of getting the latest git revision to another
command you could do the following:

```sh
ende run main.ts $(git rev-parse HEAD)
```

Another example using a shell variable:

```sh
REV=$(git rev-parse HEAD) && ende run main.ts $REV && echo $REV
```

### Negate exit code

To negate the exit code, add an exclamation point and space before a command:

```sh
# change the exit code from 1 to 0
! ende eval 'Ende.exit(1);'
```

### Redirects

Redirects provide a way to pipe stdout and/or stderr to a file.

For example, the following redirects _stdout_ of `ende run main.ts` to a file
called `file.txt` on the file system:

```sh
ende run main.ts > file.txt
```

To instead redirect _stderr_, use `2>`:

```sh
ende run main.ts 2> file.txt
```

To redirect both stdout _and_ stderr, use `&>`:

```sh
ende run main.ts &> file.txt
```

To append to a file, instead of overwriting an existing one, use two right angle
brackets instead of one:

```sh
ende run main.ts >> file.txt
```

Suppressing either stdout, stderr, or both of a command is possible by
redirecting to `/dev/null`. This works in a cross-platform way including on
Windows.

```sh
# suppress stdout
ende run main.ts > /dev/null
# suppress stderr
ende run main.ts 2> /dev/null
# suppress both stdout and stderr
ende run main.ts &> /dev/null
```

Or redirecting stdout to stderr and vice-versa:

```sh
# redirect stdout to stderr
ende run main.ts >&2
# redirect stderr to stdout
ende run main.ts 2>&1
```

Input redirects are also supported:

```sh
# redirect file.txt to the stdin of gzip
gzip < file.txt
```

Note that redirecting multiple redirects is currently not supported.

### Cross-platform shebang

`ende task` will execute scripts that start with `#!/usr/bin/env -S` the same
way on all platforms.

For example:

```ts title="script.ts"
#!/usr/bin/env -S ende run
console.log("Hello there!");
```

```json title="ende.json"
{
  "tasks": {
    "hi": "./script.ts"
  }
}
```

Then on a Windows machine:

```sh
> pwd
C:\Users\david\dev\my_project
> ende task hi
Hello there!
```

### Glob expansion

Glob expansion is supported . This allows for specifying globs to match files in
a cross-platform way.

```sh
# match .ts files in the current and descendant directories
echo **/*.ts
# match .ts files in the current directory
echo *.ts
# match files that start with "data", have a single number, then end with .csv
echo data[0-9].csv
```

The supported glob characters are `*`, `?`, and `[`/`]`.

> [!CAUTION]
> Because `globstar` is enabled by default (see
> [Shell options](#shell-options)), `**` recurses into **all** descendant
> directories, including vendored and generated ones. This differs from some
> interactive shells where `**` is not recursive unless explicitly enabled, so a
> task like `ende check **/*.ts` can expand to far more files than the same
> command typed in your terminal, sweeping in dependency files. That can lead to
> errors such as `Argument list too long` or type-checking files you didn't
> intend to.
>
> For `ende check` and `ende fmt`, prefer running them without glob arguments
> and using the [`exclude`](/runtime/reference/ende_json/#include-and-exclude)
> option in your `ende.json`, or disable recursion for the task with
> `shopt -u globstar`.

### Shell options

`ende task` supports shell options to control glob expansion and pipeline
behavior. By default, `failglob` and `globstar` are enabled.

- **failglob** - When enabled, globs that don't match any files will cause an
  error. Disable with `shopt -u failglob`.
- **globstar** - When enabled, `**` matches zero or more directories. Disable
  with `shopt -u globstar`.
- **nullglob** - When enabled, globs that don't match any files expand to
  nothing instead of the literal glob pattern. Enable with `shopt -s nullglob`.
- **pipefail** - When enabled, the exit code of a pipeline is the exit code of
  the last command to exit with a non-zero status, or zero if all commands exit
  successfully. Enable with `set -o pipefail`.
- **errexit** - When enabled, a sequential list aborts on the first command that
  exits non-zero. Enable with `set -e` or `set -o errexit`; disable again with
  `set +e` or `set +o errexit`. Useful when porting a shell script that relies
  on `set -e` semantics into a `tasks` block.

Examples:

```jsonc title="ende.jsonc"
{
  "tasks": {
    // disable failglob
    "task1": "shopt -u failglob && rm -rf *.ts",
    // disable failglob and enable nullglob
    "task2": "shopt -u failglob && shopt -s nullglob && rm -rf *.ts",
    // disable globstar
    "task3": "shopt -u globstar && echo **/*.ts",
    // enable pipefail
    "task4": "set -o pipefail && cat missing.txt | echo 'hello'",
    // abort the sequential list on the first failing command
    "task5": "set -e; build_step_one; build_step_two; build_step_three"
  }
}
```

> [!NOTE]
> Shell options do not propagate to `ende task` subprocesses. Each `ende task`
> invocation starts with the default options.

## Built-in commands

`ende task` ships with several built-in commands that work the same out of the
box on Windows, Mac, and Linux.

- [`cp`](https://man7.org/linux/man-pages/man1/cp.1.html) - Copies files.
- [`mv`](https://man7.org/linux/man-pages/man1/mv.1.html) - Moves files.
- [`rm`](https://man7.org/linux/man-pages/man1/rm.1.html) - Remove files or
  directories.
  - Ex: `rm -rf [FILE]...` - Commonly used to recursively delete files or
    directories.
- [`mkdir`](https://man7.org/linux/man-pages/man1/mkdir.1.html) - Makes
  directories.
  - Ex. `mkdir -p DIRECTORY...` - Commonly used to make a directory and all its
    parents with no error if it exists.
- [`pwd`](https://man7.org/linux/man-pages/man1/pwd.1.html) - Prints the name of
  the current/working directory.
- [`sleep`](https://man7.org/linux/man-pages/man1/sleep.1.html) - Delays for a
  specified amount of time.
  - Ex. `sleep 1` to sleep for 1 second, `sleep 0.5` to sleep for half a second,
    or `sleep 1m` to sleep a minute
- [`echo`](https://man7.org/linux/man-pages/man1/echo.1.html) - Displays a line
  of text.
- [`cat`](https://man7.org/linux/man-pages/man1/cat.1.html) - Concatenates files
  and outputs them on stdout. When no arguments are provided it reads and
  outputs stdin.
- [`exit`](https://man7.org/linux/man-pages/man1/exit.1p.html) - Causes the
  shell to exit.
- [`head`](https://man7.org/linux/man-pages/man1/head.1.html) - Output the first
  part of a file.
- [`export`](https://man7.org/linux/man-pages/man1/export.1p.html) - Sets
  environment variables and exports them to spawned commands.
- [`unset`](https://man7.org/linux/man-pages/man1/unset.1p.html) - Unsets
  environment variables.
- [`xargs`](https://man7.org/linux/man-pages/man1/xargs.1p.html) - Builds
  arguments from stdin and executes a command.
- [`:`](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/colon.html) -
  The POSIX null command. Does nothing and always exits with status `0` (Ende
  2.8+). Handy as a no-op placeholder in conditionals or for parameter-expansion
  side effects.

If you find a useful flag missing on a command or have any suggestions for
additional commands that should be supported out of the box, then please
[open an issue](https://github.com/denoland/deno_task_shell/issues) on the
[deno_task_shell](https://github.com/denoland/deno_task_shell/) repo.

Note that if you wish to execute any of these commands in a non-cross-platform
way on Mac or Linux, then you may do so by running it through `sh`:
`sh -c <command>` (ex. `sh -c cp source destination`).

## Command Resolution

When a task command references a program that isn't a
[built-in command](#built-in-commands) (e.g., `git`, `tsc`), Ende looks it up on
the system `PATH`.
