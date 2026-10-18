---
last_modified: 2026-07-16
title: "Stability and releases"
description: "Ende's stability guarantees and release process: ChronVer releases, upgrading, unstable features, and the standard library."
oldUrl:
  - /runtime/manual/runtime/stability/
  - /runtime/fundamentals/stability/
---

The `Ende` namespace APIs are stable. That means we will strive to keep code
that works today working in future releases.

## Releases

Ende is versioned with [ChronVer](https://chronver.org): a release is named
after the day it's cut, such as `2026.10.17`. Releases are published on
[GitHub](https://github.com/theende/ende/releases), and
`https://dl.ende.sh/release-latest.txt` names the newest one.

`ende upgrade` reads that file and installs the newest release, downloading a
small binary patch from the previous release when one is available. Pass a
version to install a specific release, such as `ende upgrade 2026.10.14`. See
[`ende upgrade`](/runtime/reference/cli/upgrade/) for more.

Ende publishes a single stable release channel; there are no canary, release
candidate or long-term-support builds.

## Unstable APIs

When introducing new APIs, these are first marked as unstable. This means that
the API may change in the future. These APIs are not available to use unless you
explicitly pass an unstable flag, like `--unstable-cron`.
[Learn more about `--unstable-*` flags](/runtime/reference/cli/unstable_flags).

There are also some non-runtime features of Ende that are considered unstable,
and are locked behind unstable flags. For example, the
`--unstable-sloppy-imports` flag is used to enable `import`ing code without
specifying file extensions.

## Standard library

The Ende Standard Library ([jsr.io/@ende](https://jsr.io/@ende)) is published as
`@ende/*` packages, versioned with ChronVer like the runtime. Modules whose
names start with `unstable_` are experimental and may change in any release.

Using unstable standard library modules is not recommended for production code,
but it is a great way to experiment with new features and provide feedback to
the Ende team. It is not necessary to use any unstable flags to use unstable
standard library modules.
