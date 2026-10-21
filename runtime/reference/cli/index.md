---
last_modified: 2026-10-20
title: "Ende CLI Subcommands"
oldUrl: "/runtime/reference/cli/all_commands"
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende help"
---

The Ende CLI (Command Line Interface) allows you to interact with the Ende
runtime environment from your terminal or command prompt. The CLI has a number
of subcommands that can be used to perform different tasks, check the links
below for more information on each subcommand.

## Execution

- [ende run](/runtime/reference/cli/run/) - run a script
- [ende serve](/runtime/reference/cli/serve/) - run a web server
- [ende task](/runtime/reference/cli/task/) - run a task
- [ende repl](/runtime/reference/cli/repl/) - starts a read-eval-print-loop
- [ende eval](/runtime/reference/cli/eval/) - evaluate provided script
- [ende watch](/runtime/reference/cli/watch/) - run a program, hot-replacing
  modules on change

## Dependency management

- [ende add](/runtime/reference/cli/add) - add dependencies
- [ende bump-version](/runtime/reference/cli/bump_version/) - bump the project
  version in `ende.json`
- [ende ci](/runtime/reference/cli/ci/) - install dependencies strictly from the
  lockfile
- ende cache - _(Deprecated. Please use
  [ende install](/runtime/reference/cli/install/))_
- [ende install](/runtime/reference/cli/install/) - install a dependency or a
  script
- [ende link](/runtime/reference/cli/link/) - link a local JSR package into the
  project
- [ende list](/runtime/reference/cli/list/) - list the project's dependencies
- [ende uninstall](/runtime/reference/cli/uninstall/) - uninstall a dependency
  or a script
- [ende remove](/runtime/reference/cli/remove) - Remove dependencies
- [ende outdated](/runtime/reference/cli/outdated) - view or update outdated
  dependencies
- [ende unlink](/runtime/reference/cli/unlink/) - remove a linked package
- [ende update](/runtime/reference/cli/update/) - update dependencies
- [ende why](/runtime/reference/cli/why/) - explain why a package is in the
  dependency tree

## Tooling

- [ende bench](/runtime/reference/cli/bench/) - benchmarking tool
- [ende check](/runtime/reference/cli/check/) - type check your program without
  running it
- [ende clean](/runtime/reference/cli/clean/) - remove the cache directory
- [ende compile](/runtime/reference/cli/compile/) - compile a program into a
  standalone executable
- [ende completions](/runtime/reference/cli/completions/) - generate shell
  completions
- [ende coverage](/runtime/reference/cli/coverage/) - generate test coverage
  reports
- [ende create](/runtime/reference/cli/create/) - scaffold a new project from a
  template
- [ende doc](/runtime/reference/cli/doc/) - generate documentation for a module
- [ende desktop](/runtime/reference/cli/desktop/) - build a desktop app from the
  current Ende project
- [ende fmt](/runtime/reference/cli/fmt/) - format your code
- [ende info](/runtime/reference/cli/info/) - inspect an ES module and all of
  its dependencies
- [ende init](/runtime/reference/cli/init/) - create a new project
- [ende lint](/runtime/reference/cli/lint/) - lint your code
- [ende lsp](/runtime/reference/cli/lsp/) - language server protocol integration
- [ende publish](/runtime/reference/cli/publish/) - publish a module to JSR
- [ende test](/runtime/reference/cli/test/) - run your tests
- [ende transpile](/runtime/reference/cli/transpile/) - transpile TypeScript,
  JSX, or TSX to JavaScript
- [ende types](/runtime/reference/cli/types/) - print runtime types
- [ende upgrade](/runtime/reference/cli/upgrade/) - upgrade Ende to the latest
  version
- [ende x](/runtime/reference/cli/x/) - run a JSR package or a script URL

## Other

- [Unstable feature flags](/runtime/reference/cli/unstable_flags/)
- [Integrating the Ende LSP](/runtime/reference/lsp_integration/)
