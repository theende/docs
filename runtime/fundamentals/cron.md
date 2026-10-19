---
last_modified: 2026-06-18
title: "Cron"
description: "Schedule recurring tasks in Ende with the Ende.cron() runtime API, an unstable feature enabled via --unstable-cron."
---

[`Ende.cron()`](/api/ende/~/Ende.cron/) is an Ende runtime API for scheduling
JavaScript or TypeScript code to run on a recurring schedule, expressed using
[cron syntax](https://en.wikipedia.org/wiki/Cron#UNIX-like). It ships with Ende
itself, so the same code that runs locally can be deployed without changes.

[`Ende.cron`](/api/ende/~/Ende.cron/) is currently an unstable API. To use it
locally with `ende run`, enable the
[`--unstable-cron`](/runtime/reference/cli/unstable_flags/#--unstable-cron) flag
(or add `"cron"` to the
[`unstable`](/runtime/reference/ende_json/#unstable-features) array in
`ende.json`).

```sh
ende run --unstable-cron main.ts
```

<a href="/api/ende/~/Ende.cron/" class="docs-cta runtime-cta">Ende.cron API
reference</a>

## Defining a cron job

[`Ende.cron()`](/api/ende/~/Ende.cron/) takes a human-readable name, a schedule,
and a handler function. The name identifies the cron job in logs, the schedule
determines when the handler fires, and all times are in UTC.

```ts
Ende.cron("log-a-message", "* * * * *", () => {
  console.log("This runs once a minute.");
});
```

A 5-field cron expression has one field per time unit, separated by spaces:

```sh
┌──────────── minute (0-59)
│ ┌────────── hour (0-23)
│ │ ┌──────── day of month (1-31)
│ │ │ ┌────── month (1-12 or JAN-DEC)
│ │ │ │ ┌──── day of week (0-6 or SUN-SAT, where 0 is Sunday)
│ │ │ │ │
* * * * *
```

Each field accepts an exact value, `*` (every value), a range (`1-5`), a list
(`1,3,5`), or a step (`*/15` for every fifteenth unit). For example,
`0 9 * * MON-FRI` runs at 09:00 UTC on weekdays.

The schedule can be a standard 5-field cron expression or a structured object:

```ts
Ende.cron("hourly-task", { hour: { every: 1 } }, () => {
  console.log("This runs once an hour.");
});
```

Cron jobs must be registered at the top level of a module, before any server
starts. Definitions nested inside request handlers, conditionals, or callbacks
will not be picked up.

## Retries and backoff

By default, failed handler invocations are not retried. Pass a `backoffSchedule`
(an array of millisecond delays) to retry on failure:

```ts
Ende.cron(
  "retry-example",
  "* * * * *",
  { backoffSchedule: [1000, 5000, 10000] },
  () => {
    throw new Error("Will be retried up to three times.");
  }
);
```

## Running cron jobs in production

[`Ende.cron`](/api/ende/~/Ende.cron/) keeps execution state in-memory in the
Ende CLI, which means each process maintains its own independent set of cron
tasks. Keep exactly one long-running process with your cron definitions up, for
example under a process manager such as systemd, so each job runs once per
schedule.

## OpenTelemetry

When [OpenTelemetry](/runtime/fundamentals/open_telemetry/) is enabled
(`OTEL_ENDE=true`), each [`Ende.cron()`](/api/ende/~/Ende.cron/) invocation
automatically produces an OpenTelemetry span. This lets you trace cron execution
alongside your other instrumented code:

```sh
OTEL_ENDE=true ende run --unstable-cron main.ts
```

Each cron invocation creates a span named after the cron job. The span covers
the duration of the handler function, and any spans created inside the handler
are nested under it as children.
