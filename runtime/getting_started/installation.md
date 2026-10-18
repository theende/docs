---
last_modified: 2026-10-18
title: Installation
description: "Install Ende on macOS, Linux and Windows with the install script or a manual download, then update or uninstall it."
oldUrl:
  - /runtime/manual/fundamentals/installation
  - /runtime/manual/getting_started/installation
  - /runtime/fundamentals/installation
---

Ende is a single binary executable with no external dependencies. Releases are
published for macOS on Apple silicon, Linux (x64 and arm64), and Windows (x64).

## Download and install

The install scripts download the latest release, verify its checksum, and
install it to `~/.ende/bin`.

<ende-tabs group-id="operating-systems">
<ende-tab value="mac" label="macOS / Linux" default>

```shell
curl -fsSL https://ende.sh/install.sh | sh
```

The script prints the line to add to your shell profile if `~/.ende/bin` isn't
on your `PATH` yet. To install a specific release, pass its version:

```shell
curl -fsSL https://ende.sh/install.sh | sh -s v2026.10.17
```

</ende-tab>
<ende-tab value="windows" label="Windows">

```powershell
irm https://ende.sh/install.ps1 | iex
```

The script adds `~\.ende\bin` to your user `PATH`. To install a specific
release, set `$v` first:

```powershell
$v = "v2026.10.17"; irm https://ende.sh/install.ps1 | iex
```

</ende-tab>
</ende-tabs>

Set `ENDE_INSTALL_ROOT` before running a script to install somewhere other than
`~/.ende`; the binary goes in its `bin` directory.

## Manual download

Ende binaries can also be installed manually, by downloading a zip file at
[github.com/theende/ende/releases](https://github.com/theende/ende/releases).
Each release ships one archive per platform, containing a single executable:

| Platform                    | Asset                                |
| --------------------------- | ------------------------------------ |
| Windows x86_64              | `ende-x86_64-pc-windows-msvc.zip`    |
| macOS ARM64 (Apple Silicon) | `ende-aarch64-apple-darwin.zip`      |
| Linux x86_64                | `ende-x86_64-unknown-linux-gnu.zip`  |
| Linux ARM64                 | `ende-aarch64-unknown-linux-gnu.zip` |

Unzip the archive and place the `ende` executable somewhere on your `PATH`. You
will have to set the executable bit on macOS and Linux. Each asset has a
matching `.sha256sum` file for verifying the download.

On Linux a common choice is `~/.local/bin` (per-user) or `/usr/local/bin`
(system-wide). For example:

```sh
unzip ende-x86_64-unknown-linux-gnu.zip
mkdir -p ~/.local/bin
mv ende ~/.local/bin/
chmod +x ~/.local/bin/ende
# ensure the directory is on your PATH, then verify
ende --version
```

## Installation location

### Binary location

The install scripts place the `ende` binary in the following default location:

| Platform      | Default path                       |
| ------------- | ---------------------------------- |
| macOS / Linux | `$HOME/.ende/bin/ende`             |
| Windows       | `%USERPROFILE%\.ende\bin\ende.exe` |

This is the same directory `ende install -g` puts installed tools in.

### Cache location

Downloaded dependencies and compiled artefacts are stored in Ende's cache
directory. It defaults to a platform-specific path:

| Platform | Default path                |
| -------- | --------------------------- |
| Linux    | `$HOME/.cache/ende`         |
| macOS    | `$HOME/Library/Caches/ende` |
| Windows  | `%LOCALAPPDATA%\ende`       |

Override it by setting the `ENDE_DIR` environment variable (see
[Environment variables](/runtime/reference/env_variables/)). Run `ende info` to
print the directory currently in use.

## Testing your installation

To test your installation, run `ende --version`. If this prints the Ende version
to the console the installation was successful.

Use `ende help` to see help text documenting Ende's flags and usage. For a guide
to every subcommand, see the [CLI reference](/runtime/reference/cli/).

### If you see "command not found"

If `ende --version` reports `command not found`, the install directory isn't on
your `PATH` yet:

- On macOS and Linux, add the lines the install script printed to your shell
  profile (`~/.zshrc`, `~/.bashrc`, …), then open a new terminal.
- On Windows, open a new terminal so the updated user `PATH` is picked up.
- If you set `ENDE_INSTALL_ROOT`, the binary lives at
  `$ENDE_INSTALL_ROOT/bin/ende`.

## Updating

To update a previously installed version of Ende, run:

```shell
ende upgrade
```

This fetches the latest release from
[github.com/theende/ende/releases](https://github.com/theende/ende/releases) and
replaces your current executable with it. You can also install a specific
release:

```shell
ende upgrade 2026.10.14
```

## Uninstalling

First clear the Ende cache directory (`$ENDE_DIR`):

```shell
ende clean
```

Then remove the Ende installation directory:

<ende-tabs group-id="operating-systems">
<ende-tab value="mac" label="macOS / Linux" default>

```shell
rm -rf ~/.ende
```

Finally, remove the lines that add `~/.ende/bin` to your `PATH` from your shell
profile.

</ende-tab>
<ende-tab value="windows" label="Windows">

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.ende"
```

Then remove the Ende `bin` directory from your user `PATH` environment variable
via System Settings.

</ende-tab>
</ende-tabs>

## Building from source

Information about how to build from source can be found in the
[`Building from source`](https://github.com/theende/ende/blob/primary/.github/CONTRIBUTING.md#building-from-source)
guide.
