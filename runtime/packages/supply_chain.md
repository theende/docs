---
last_modified: 2026-06-25
title: "Supply chain management"
description: "Keep Ende dependencies deterministic and safe: lockfile discipline, minimum dependency age, intentional updates, and a recommended CI baseline."
---

Modern JavaScript projects pull code from many sources (JSR, HTTPS imports,
local workspaces). Good supply chain management helps you achieve four goals:

- Determinism: everyone (and your CI) runs the exact same code.
- Security: unexpected upstream changes or compromises are detected early.
- Velocity: you can update dependencies intentionally when you choose.
- Resilience: builds keep working offline or when registries have outages.

This page builds on
[lockfiles](/runtime/packages/#lockfile-and-reproducible-installs) from the
[dependency management guide](/runtime/packages/).

## Core practices

1. Pin versions deliberately
   - For applications, prefer exact versions (for example
     `jsr:@luca/cases@1.2.3`).
   - For libraries, a caret range (`^1.2.3`) lets consumers get
     backwards‑compatible fixes.
   - Avoid unbounded (`*`) or overly broad ranges in production applications.
2. Commit your `ende.lock` file.
3. Enable a frozen lockfile in CI / production (`--frozen-lockfile` or
   `"lock": { "frozen": true }`) so new, unseen dependencies fail the build
   instead of silently appearing.
4. Vendor when you need hermetic/offline builds (`"vendor": true`) or when you
   must patch third‑party code locally. Vendoring does not remove the need for a
   lockfile—it complements it.
5. Use `jsr:` specifiers with import map (`imports`) entries to centralize
   version management.
6. Periodically unfreeze and update consciously (for example on a weekly or
   sprint cadence) instead of ad‑hoc updates during feature work.
7. Set a [minimum dependency age](#minimum-dependency-age) so freshly published
   versions can't slip into an install before the ecosystem has had time to spot
   a compromised release.

## Minimum dependency age

Ende refuses to install package versions younger than a configured age. This is
a cheap, broad defence against supply-chain attacks: malicious versions are
usually detected and yanked within days, so delaying installs by a similar
window catches the bulk of them.

This is on by default with a 24-hour window, so versions published in the last
day are skipped even with no configuration. The settings below change that
window or turn it off (set the age to `0`).

You can configure the same control in several places; pick whichever fits the
project:

- **`ende.json`**, apply project-wide:

  ```jsonc title="ende.json"
  {
    "minimumDependencyAge": "P3D"
  }
  ```

- **CLI flag**, apply ad-hoc, e.g. for a one-off install or in a CI step:

  ```sh
  ende install --minimum-dependency-age=P3D
  ```

`ende.json` and `--minimum-dependency-age` accept an
[ISO-8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) such as
`P3D` (3 days) or `PT72H` (72 hours), an integer (interpreted as minutes), an
absolute cutoff date (`2025-09-16`) or RFC3339 timestamp, or `0` to disable. The
field also supports an object form that exempts specific packages; see the
[`minimumDependencyAge` reference](/runtime/reference/ende_json/#minimum-dependency-age)
for the full shape.

## Typical CI pattern

The single command [`ende ci`](/runtime/reference/cli/ci/) encapsulates the
recommended CI install flow (installing strictly from the lockfile):

```sh
ende ci
```

To compose the steps manually:

```sh
# Install (resolve) dependencies exactly as locked; fail if drift or new deps
ende install --frozen-lockfile --entrypoint main.ts

# (optional) Run with only cached modules to guarantee no network access
ende run --cached-only main.ts
```

## Updating dependencies intentionally

When you decide to update:

1. Temporarily allow lockfile writes: add `--frozen=false` or set
   `"lock": { "frozen": false }`.
2. Change versions (edit `ende.json`, use `ende add <specifier>@<newVersion>`,
   or remove with `ende remove`).
3. Re-run `ende install --entrypoint main.ts` (optionally `--reload`) to update
   resolutions and integrity hashes.
4. Review the diff in `ende.lock` (and `vendor/` if used) in your pull request.
5. Re-enable the frozen lockfile.

## Troubleshooting a frozen lockfile

You may encounter errors like:

```text
error: The lockfile is frozen. Cannot add new entry for "jsr:@scope/pkg@1.3.0".
```

or:

```text
error: Module not found in frozen lockfile: https://example.com/dependency/mod.ts
```

Common causes and fixes:

| Symptom                                                    | Cause                                          | Fix                                                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Need to bump a version but command fails with frozen error | Lockfile is in frozen mode                     | Re-run with `--frozen=false` (one-off) or temporarily set `"lock": { "frozen": false }`, then update and re-freeze          |
| New transitive dependency appears after editing code       | Code now imports something not in lockfile     | Unfreeze (`--frozen=false`) and run `ende install --entrypoint <entry>.ts` to record it                                     |
| Removed imports but lockfile still contains old entries    | Lockfile is additive; entries persist          | (Optional) regenerate: move `ende.lock` aside (`mv ende.lock ende.lock.old`), run install to recreate, compare, then commit |
| Lockfile corruption / merge conflict                       | Manual edit or conflict left inconsistent JSON | Delete conflicting sections and re-run install, or regenerate entirely                                                      |
| Using vendored deps but lockfile complains                 | Vendor dir out of sync with lockfile           | Re-run `ende install --entrypoint <entry>` (unfrozen) to sync both, then commit                                             |

## Safe regeneration checklist

Only regenerate the entire `ende.lock` when necessary (corruption, massive
pruning). When you do:

1. Back it up: `cp ende.lock ende.lock.bak`.
2. Remove it: `rm ende.lock`.
3. (If vendoring) remove or move the `vendor/` directory.
4. Run `ende install --entrypoint main.ts` to recreate.
5. Inspect the diff between old and new to catch unexpected additions.

## Vendor vs lockfile

These are complementary:

- Lockfile: records exact resolved versions + integrity hashes for remote and
  JSR deps.
- Vendor directory: stores the actual source locally for hermetic, offline, and
  patchable builds.

Use both for maximum reproducibility. A frozen lockfile alone does not make your
build fully hermetic if the remote source disappears; vendoring closes that gap.

## Quick decision guide

| Need                       | Use                                            |
| -------------------------- | ---------------------------------------------- |
| Detect upstream tampering  | Lockfile (commit & freeze)                     |
| Offline / air-gapped build | `vendor: true` + lockfile                      |
| Patch third-party code     | Vendoring or `scopes` overrides (short-term)   |
| Fast CI with integrity     | `ende ci`                                      |
| Intentionally upgrade      | Temporarily unfreeze, run install, review diff |

## Minimum supply chain baseline (recommended)

```json title="ende.json"
{
  "imports": {/* centralize versions */},
  "vendor": true,
  "lock": { "frozen": true }
}
```

Commit `ende.json`, `ende.lock`, and (if using vendor) the entire `vendor/`
directory.

> [!TIP] Automate a weekly dependency refresh
>
> A scheduled CI job that unfreezes, runs `ende update --latest` (or manually
> bumps key packages), executes tests, and opens a pull request with the updated
> `ende.lock` (and `vendor/`) keeps security patches flowing while keeping
> day-to-day builds deterministic.
