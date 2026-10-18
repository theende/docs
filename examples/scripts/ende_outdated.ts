/**
 * @title Find and update outdated dependencies
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @resource {https://docs.ende.sh/runtime/reference/cli/outdated/} Doc: ende outdated
 * @resource {https://docs.ende.sh/runtime/fundamentals/modules/} Doc: Modules and dependencies
 * @group CLI
 *
 * Dependencies pinned months ago quietly fall behind. The ende outdated
 * subcommand compares what your lockfile resolves to against the newest
 * versions on JSR, and can rewrite ende.json for you.
 */

// This script imports one dependency at an old version, the kind of pin
// that accumulates in any project over time.
import { basename } from "jsr:@ende/path@2026.10.14";

console.log(basename("/tmp/projects/report.txt"));

// The walkthrough below uses a project with an ende.json import map and a
// lockfile created back when these versions were current:
//
//   {
//     "imports": {
//       "@ende/fmt": "jsr:@ende/fmt@^2026.10.14",
//       "@ende/path": "jsr:@ende/path@2026.10.14"
//     }
//   }

// Running ende outdated prints a table. Current is what the lockfile
// resolves today, Update is the newest version that still satisfies the
// range in ende.json, and Latest is the newest version overall:
//
//   ende outdated
//   ┌────────────────┬────────────┬────────────┬────────────┐
//   │ Package        │ Current    │ Update     │ Latest     │
//   ├────────────────┼────────────┼────────────┼────────────┤
//   │ jsr:@ende/path │ 2026.10.14 │ 2026.10.14 │ 2026.10.15 │
//   └────────────────┴────────────┴────────────┴────────────┘
//
//   Run ende update --latest to update to the latest available versions,
//   or ende outdated --help for more information.

// The --update flag applies the Update column. It respects the ranges, so
// the exact @ende/path pin stays where it is:
//
//   ende outdated --update
//   Updated 1 dependency:
//    - jsr:@ende/fmt ^2026.10.14 -> ^2026.10.15

// Adding --latest ignores the ranges and applies the Latest column instead:
//
//   ende outdated --update --latest
//   Updated 2 dependencies:
//    - jsr:@ende/fmt  ^2026.10.14 -> ^2026.10.15
//    - jsr:@ende/path  2026.10.14 ->  2026.10.15

// Both forms rewrite ende.json in place. The plain ende outdated command
// makes no changes at all and is always safe to run.
