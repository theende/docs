/**
 * @title Environment variables
 * @difficulty beginner
 * @tags cli
 * @run -E <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.env} Doc: Ende.env
 * @resource {https://docs.ende.sh/deploy/classic/environment-variables} Deploy Docs: Environment Variables
 * @group System
 *
 * Environment variables can be used to configure the behavior of a program,
 * or pass data from one program to another.
 */

// Here an environment variable with the name `PORT` is read. If this variable
// is set the return value will be a string. If it is unset it will be `undefined`.
const PORT = Ende.env.get("PORT");
console.log("PORT:", PORT);

// You can also get an object containing all environment variables.
const env = Ende.env.toObject();
console.log("env:", env);

// Environment variables can also be set. The set environment variable only affects
// the current process, and any new processes that are spawned from it. It does
// not affect parent processes or the user shell.
Ende.env.set("MY_PASSWORD", "123456");

// You can also unset an environment variable.
Ende.env.delete("MY_PASSWORD");

// Note that environment variables are case-sensitive on Unix, but not on
// Windows. This means that these two invocations will have different results
// between platforms.
Ende.env.set("MY_PASSWORD", "123");
Ende.env.set("my_password", "456");
console.log("UPPERCASE:", Ende.env.get("MY_PASSWORD"));
console.log("lowercase:", Ende.env.get("my_password"));

// Access to environment variables is only possible if the Ende process is
// running with env var permissions (`-E`). You can limit the permission
// to only a specific number of environment variables (`-E=PORT,MY_PASSWORD`).
