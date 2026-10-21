---
last_modified: 2026-10-20
title: "ende publish"
oldUrl: /runtime/manual/tools/publish/
command: publish
openGraphLayout: "/open_graph/cli-commands.jsx"
openGraphTitle: "ende publish"
description: "Publish your package or workspace to the JSR registry"
---

`ende publish` publishes your package to the [JSR](https://jsr.io/) registry.

## Package Requirements

Your package must have a `name` and `version` and an `exports` field in its
[`ende.json`](/runtime/fundamentals/configuration/) or `jsr.json` file.

- The `name` field must be unique and follow the `@<scope_name>/<package_name>`
  convention.
- The `version` field must be a valid semver version. To bump it as part of your
  release flow, see [`ende bump-version`](/runtime/reference/cli/bump_version/).
- The `exports` field must point to the main entry point of the package. The
  exports field can either be specified as a single string, or as an object
  mapping entrypoint names to paths in your package.

Example:

```json title="ende.json"
{
  "name": "@scope_name/package_name",
  "version": "1.0.0",
  "exports": "./main.ts"
}
```

Before you publish your package, you must create it in the registry by visiting
[JSR - Publish a package](https://jsr.io/new).

## Excluding a workspace member

When run inside a [workspace](/runtime/fundamentals/workspaces/), `ende publish`
tries to publish every member that has a `name` and `exports`, and errors if any
of them is missing a `version`. To opt a member out, for example an internal
helper package that only exists to host shared `tasks`, set `"publish": false`
in that member's `ende.json`:

```jsonc title="internal-helpers/ende.json"
{
  "name": "@scope/internal-helpers",
  "publish": false
}
```

The member stays part of the workspace but is skipped by `ende publish`. See
[Excluding a workspace member from publish](/runtime/fundamentals/workspaces/#excluding-a-workspace-member-from-publish)
for the full discussion.

## Examples

Publish your current workspace

```sh
ende publish
```

Publish your current workspace with a specific token, bypassing interactive
authentication

```sh
ende publish --token c00921b1-0d4f-4d18-b8c8-ac98227f9275
```

Publish and check for errors in remote modules

```sh
ende publish --check=all
```

Perform a dry run to simulate publishing.

```sh
ende publish --dry-run
```

Publish using settings from a specific configuration file

```sh
ende publish --config custom-config.json
```
