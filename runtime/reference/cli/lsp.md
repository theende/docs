---
last_modified: 2026-10-20
title: "ende lsp"
oldUrl: /runtime/manual/tools/lsp/
command: lsp
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende lsp"
description: "Start the Ende language server, used by editors for IntelliSense, formatting, and diagnostics"
---

> [!NOTE]
> Usually humans do not use this subcommand directly. The 'ende lsp' can provide
> IDEs with go-to-definition support and automatic code formatting.

Starts the Ende language server. The language server is used by editors to
provide features like IntelliSense, code formatting, and more.

## Usage

```sh
ende lsp
```

The language server communicates over stdin/stdout using the
[Language Server Protocol](https://microsoft.github.io/language-server-protocol/).
You typically don't run this directly — your editor starts it automatically.

## Editor setup

For instructions on configuring your editor to use the Ende language server, see
[Set up your environment](/runtime/getting_started/setup_your_environment/) and
the [LSP integration reference](/runtime/reference/lsp_integration/).
