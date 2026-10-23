/**
 * @title Process information
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @group System
 *
 * An example of how to access the current process `id` and parent process `id`.
 */

// The current process’s process `id` is available in the `Ende.pid` variable.
console.log(Ende.pid);

// The parent process `id` is available in the Ende namespace too.
console.log(Ende.ppid);
