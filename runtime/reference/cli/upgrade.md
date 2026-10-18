---
last_modified: 2026-07-15
title: "ende upgrade"
oldUrl: /runtime/manual/tools/upgrade/
command: upgrade
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende upgrade"
description: "Upgrade Ende to the latest, or any specific version"
---

## Examples

### Upgrade to the latest version

Use this command without any options to upgrade Ende to the latest release, the
one named in `https://dl.ende.sh/release-latest.txt`:

```sh
ende upgrade
```

### Upgrade to a specific version

You can specify a particular release to upgrade to:

```sh
ende upgrade 2026.10.14
```

### Check available upgrade without installing

Use the `--dry-run` flag to see what would be upgraded without actually
performing the upgrade:

```sh
ende upgrade --dry-run
Current Ende version: v2026.10.14
Looking up latest version

Found latest version v2026.10.17
```

## --quiet flag

The `--quiet` flag suppresses diagnostic output during the upgrade process. When
used with `ende upgrade`, it will hide progress indicators, download
information, and success messages.

```sh
ende upgrade --quiet
```

This is useful for scripting environments or when you want cleaner output in CI
pipelines.

## Cached downloads

Downloaded Ende binaries are cached in `$ENDE_DIR/dl/`. If you reinstall the
same version later, the cached archive is reused instead of re-downloading.

## Checksum verification

Use the `--checksum` flag to verify a downloaded binary against a known SHA-256
hash. This protects against tampering in CI environments and security-sensitive
setups:

```sh
ende upgrade --checksum=<sha256-hash> 2026.10.17
```

SHA-256 checksums are published as `.sha256sum` files alongside release archives
on GitHub:

```sh
curl -sL https://github.com/theende/ende/releases/download/v2026.10.17/ende-x86_64-unknown-linux-gnu.zip.sha256sum
```

## Delta updates

`ende upgrade` downloads small binary patches (deltas) instead of the full
release archive when upgrading between recent stable releases. This typically
reduces the download from tens of megabytes to a few megabytes.

Deltas are applied automatically when available, there is nothing to opt into.
If a patch is missing or fails verification, `ende upgrade` transparently falls
back to downloading the full archive.

To force a full download (for example, in environments that cache release
archives) pass `--no-delta`:

```sh
ende upgrade --no-delta
```

Each delta patch and the resulting binary are verified against the SHA-256
checksums published with the release before being installed.

## Install a build from a pull request

`ende upgrade pr <number>` downloads the binary built by CI for a specific ende
PR and installs it. This is handy when you need to verify a fix before it has
shipped in a release.

```sh
# Install the binary built by CI for PR #12345
ende upgrade pr 12345

# A `#` prefix is also accepted
ende upgrade pr '#12345'

# Write to a path instead of replacing the current binary
ende upgrade --output ./ende-test pr 12345

# See what would be downloaded without replacing
ende upgrade --dry-run pr 12345
```

This subcommand requires the [`gh` CLI](https://cli.github.com/) to be installed
and authenticated. `ende upgrade` uses `gh` to look up the PR's CI run and
download the matching `{profile}-{os}-{arch}-ende` artifact (for example
`release-linux-x86_64-ende`), preferring release builds and falling back to
debug. The downloaded binary is verified to run before it replaces the current
executable.
