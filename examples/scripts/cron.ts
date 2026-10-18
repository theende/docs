/**
 * @title Ende.cron
 * @difficulty intermediate
 * @tags cli
 * @run --unstable-cron <url>
 * @resource {/runtime/fundamentals/cron/} Cron guide
 * @resource {https://docs.ende.sh/api/ende/~/Ende.cron} Ende.cron API docs
 * @group Unstable APIs
 *
 * <strong>Warning: This is an unstable API that is subject to change or removal at any time.</strong><br>Ende.cron is a cron task scheduler built into the Ende runtime. There are no
 * overlapping cron executions, and handlers are retried automatically on
 * exceptions.
 */

// Create a cron job called "Log a message" that runs once a minute.
Ende.cron("Log a message", "* * * * *", () => {
  console.log("This will print once a minute.");
});

// Create a cron job with a backoff schedule measured in milliseconds.
Ende.cron("Retry example", "* * * * *", {
  backoffSchedule: [1000, 5000, 10000],
}, () => {
  throw new Error("Ende.cron will retry this three times, to no avail!");
});
