---
last_modified: 2026-06-27
title: "ende desktop"
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende desktop"
description: "Build self-contained desktop applications from an Ende project"
---

`ende desktop` compiles an Ende project into a self-contained desktop
application. The output binary bundles your code, the Ende runtime, and a
rendering backend into one redistributable executable per platform.

```sh
ende desktop main.ts
ende desktop --hmr main.ts
ende desktop --output MyApp.app main.ts
```

This page covers the command-line flags. For the full guide (backends,
[`Ende.BrowserWindow`](/api/ende/~/Ende.BrowserWindow/), bindings, auto-update,
DevTools, and distribution) see the [Desktop apps section](/runtime/desktop/).

## Runtime flags

`ende desktop` accepts the same runtime and permission flags as
[`ende run`](/runtime/reference/cli/run/). The permissions you grant at compile
time are baked into the compiled binary:

```sh
ende desktop --allow-read --allow-net main.ts
```

## Backend

`--backend` selects the rendering engine. It accepts `webview` (the default) or
`cef`. The `raw` backend is selected through the `desktop.backend` field in
`ende.json`. See [Backends](/runtime/desktop/backends/) for the tradeoffs.

```sh
ende desktop --backend webview main.ts
```

## Build output

`--output` (`-o`) sets the output path; its extension determines the format
(`.app`, `.dmg`, `.AppImage`, and so on):

```sh
ende desktop --output ./dist/MyApp.dmg main.ts
```

Use `--icon` to set the application icon (`.ico` on Windows, `.icns` or `.png`
on macOS), and `--include` / `--exclude` to add or remove files from the
compiled binary. These can also be configured in `ende.json`; see
[Configuration](/runtime/desktop/configuration/).

## Cross-compilation

`--target` builds for another platform, and `--all-targets` builds for every
supported platform at once. No platform-specific toolchain is needed on the
host:

```sh
ende desktop --target aarch64-apple-darwin main.ts
ende desktop --all-targets main.ts
```

See [Distribution](/runtime/desktop/distribution/) for the supported target
triples and output formats.

## Development

`--hmr` runs the app with hot module replacement during development. See
[Hot module replacement](/runtime/desktop/hmr/).

```sh
ende desktop --hmr main.ts
```

The `--inspect`, `--inspect-wait`, and `--inspect-brk` flags attach a debugger
to both the Ende runtime and the renderer. `--inspect-renderer` overrides the
CEF renderer's debugger listen address. See
[DevTools](/runtime/desktop/devtools/).

## Configuration

Most settings can live in the `desktop` block of `ende.json` instead of being
passed on every build:

```jsonc title="ende.json"
{
  "desktop": {
    "app": {
      "name": "MyApp",
      "identifier": "com.example.myapp",
      "icons": {
        "macos": "./icons/icon.icns",
        "windows": "./icons/icon.ico",
        "linux": "./icons/icon.png"
      }
    },
    "backend": "cef",
    "output": {
      "macos": "./dist/macos",
      "windows": "./dist/windows",
      "linux": "./dist/linux"
    },
    "release": { "baseUrl": "https://updates.example.com" },
    "errorReporting": { "url": "https://errors.example.com/report" }
  }
}
```

For the full schema, see [Configuration](/runtime/desktop/configuration/).
