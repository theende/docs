---
last_modified: 2026-10-20
title: "Publishing packages"
description: "Publish Ende packages to JSR with ende publish."
oldUrl:
  - /runtime/manual/basics/modules/publishing_modules/
  - /runtime/manual/advanced/publishing/dnt/
  - /runtime/manual/advanced/publishing/
---

Any Ende program that defines an export can be published as a package for other
developers to import. This page covers where to publish and how.

## Choose a registry

Ende packages are published to [JSR](https://jsr.io). It accepts TypeScript
directly (no build step) and generates documentation from your JSDoc comments.

## Publish to JSR

Give your package a name, a version, and an entry point in `ende.json`:

```json title="ende.json"
{
  "name": "@scope/my-package",
  "version": "1.0.0",
  "exports": "./mod.ts"
}
```

The name is always scoped (`@scope/name`). Create the scope on
[jsr.io](https://jsr.io) the first time you publish.

Check what will be published, then publish:

```sh
ende publish --dry-run   # verify the file list and metadata
ende publish             # opens jsr.io to authenticate, then publishes
```

`ende publish` type-checks your code and verifies that your exports don't rely
on anything outside the package before uploading. See the
[`ende publish` reference](/runtime/reference/cli/publish/) for flags, and
[Publishing packages on jsr.io](https://jsr.io/docs/publishing-packages) for
scopes, versioning, provenance, and publishing from CI.

To bump the version field between releases, you can use
[`ende bump-version`](/runtime/reference/cli/bump_version/).

## Workspaces

In a [workspace](/runtime/fundamentals/workspaces/), `ende publish` publishes
every workspace member that has a name and version, in dependency order. See
[publishing workspace packages](/runtime/fundamentals/workspaces/#publishing-workspace-packages-to-registries)
for the details.

### Automating workspace releases

`ende bump-version` can drive a whole workspace release. Run at the workspace
root with no increment, it derives each member's version bump from the
[Conventional Commits](https://www.conventionalcommits.org/) made since the last
release, rewrites the `jsr:` constraints in the root import map so cross-package
references stay in sync, and prepends a changelog entry to `Releases.md`. See
[deriving bumps from Conventional Commits](/runtime/reference/cli/bump_version/#deriving-bumps-from-conventional-commits)
for the rules and the flags that pin the commit range.

The [Ende Standard Library](https://github.com/theende/std) publishes from CI as
a reference you can adapt: publishing a GitHub release triggers its
[`workspace_publish` workflow](https://github.com/theende/std/blob/primary/.github/workflows/workspace_publish.yml),
which runs `ende publish` for every member, authenticating to JSR with GitHub
OIDC.

## Keep going

- [Dependency management](/runtime/packages/): the day-to-day workflow this page
  grew out of
- [`ende publish`](/runtime/reference/cli/publish/) and `ende pack` references
- [JSR publishing docs](https://jsr.io/docs/publishing-packages)
