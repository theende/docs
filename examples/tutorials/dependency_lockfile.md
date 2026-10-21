---
last_modified: 2026-10-20
title: "Lock dependencies with ende.lock"
description: "Use ende.lock for reproducible installs: what the lockfile records, reviewing lockfile diffs, frozen lockfiles for CI with --frozen-lockfile and ende ci, and regenerating or relocating the lockfile."
url: /examples/dependency_lockfile_tutorial/
---

`ende.lock` pins every dependency to an exact resolved version with an integrity
hash, so every machine (and your CI) runs identical code. Ende creates and
updates it automatically whenever an `ende.json` is present; your job is just to
commit it and decide when it may change.

## What ende.lock records

Add a dependency (for example `ende add jsr:@ende/fmt@2026.10.14`) and Ende
writes the lockfile alongside your config:

```json title="ende.lock"
{
  "version": "5",
  "specifiers": {
    "jsr:@ende/fmt@2026.10.14": "2026.10.14"
  },
  "jsr": {
    "@ende/fmt@2026.10.14": {
      "integrity": "8164455e7add9108748f336ac5ed1c604b14717ffeef0ccd1e196e47bfba8779"
    }
  },
  "workspace": {
    "dependencies": [
      "jsr:@ende/fmt@2026.10.14"
    ]
  }
}
```

Each version range from your config is mapped to one exact version, and each
package gets a hash that Ende verifies on every install. Commit `ende.lock` to
git; on other machines and in CI, [`ende ci`](/runtime/reference/cli/ci/) then
installs exactly what the lockfile says.

## Reviewing lockfile diffs

A version bump shows up as a changed resolution plus a changed hash:

```diff
   "specifiers": {
-    "jsr:@ende/fmt@2026.10.14": "2026.10.14"
+    "jsr:@ende/fmt@^2026.10.15": "2026.10.15"
   },
   "jsr": {
-    "@ende/fmt@2026.10.14": {
-      "integrity": "8164455e7add9108748f336ac5ed1c604b14717ffeef0ccd1e196e47bfba8779"
+    "@ende/fmt@2026.10.15": {
+      "integrity": "a45abcdcb9fdd36ff050b539c724816be229661ac8b951eb09ea716890c9b334"
     }
```

A new dependency adds entries instead, including its transitive dependencies,
listed under `dependencies`:

```diff
   "jsr": {
+    "@ende/fs@2026.10.15": {
+      "integrity": "08f90fc65f2673817760baec63bfb58c94638a270749715a913219fcc83befc4",
+      "dependencies": [
+        "jsr:@ende/internal",
+        "jsr:@ende/path"
+      ]
+    },
```

Unexpected new packages in a lockfile diff are worth a closer look in review.

## Freeze the lockfile for CI

By default the lockfile is additive: new dependencies are recorded without
complaint. In CI you usually want the opposite: fail if anything is not already
locked:

```json title="ende.json"
{
  "lock": {
    "frozen": true
  }
}
```

The same is available ad hoc as the `--frozen-lockfile` flag. With a frozen
lockfile, any command that would modify `ende.lock` exits with an error showing
the changes it wanted to make:

```sh
$ ende add jsr:@ende/path
error: The lockfile is out of date. Run `ende install --frozen=false`, or rerun with `--frozen=false` to update it.
changes:
13 | -      "jsr:@ende/fmt@^2026.10.15"
13 | +      "jsr:@ende/fmt@^2026.10.15",
14 | +      "jsr:@ende/path@^2026.10.15"
```

[`ende ci`](/runtime/reference/cli/ci/) wraps the recommended CI flow: it
installs strictly from the lockfile, and errors if the lockfile is missing or
out of date.

## Updating and regenerating

To intentionally update dependencies, disable freezing for one command:

```sh
ende install --frozen=false
```

Because the lockfile is additive, entries for removed dependencies can linger.
To regenerate it from scratch, delete it and reinstall:

```sh
rm ende.lock
ende install
```

## Custom path or disabling

```json title="ende.json"
{
  "lock": { "path": "deps.lock" }
}
```

Set `"lock": false` to disable the lockfile entirely (not recommended for
applications). For the full picture, including supply chain practices built on
the lockfile, see
[Integrity checking and lock files](/runtime/packages/#lockfile-and-reproducible-installs).
