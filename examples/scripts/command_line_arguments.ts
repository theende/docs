/**
 * @title Command line arguments
 * @difficulty beginner
 * @tags cli
 * @run <url> Ende Sushi --help --version=1.0.0 --no-color
 * @resource {https://docs.ende.sh/api/ende/~/Ende.args} Doc: Ende.args
 * @resource {https://jsr.io/@ende/cli/doc/parse-args/~} Doc: @ende/cli
 * @group CLI
 *
 * Command line arguments are often used to pass configuration options to a
 * program.
 */

// You can get the list of command line arguments from `Ende.args`.
const name = Ende.args[0];
const food = Ende.args[1];
console.log(`Hello ${name}, I like ${food}!`);

// Often you want to parse command line arguments like `--foo=bar` into
// structured data. This can be done using `std/cli`.
import { parseArgs } from "jsr:@ende/cli/parse-args";

// The `parseArgs` function takes the argument list, and a list of options. In these
// options you specify the types of the accepted arguments and possibly default
// values. An object is returned with the parsed arguments.
// NOTE: this function is based on [`minimist`](https://github.com/minimistjs/minimist), not compatible with the `parseArgs()` function in `node:util`.
const flags = parseArgs(Ende.args, {
  boolean: ["help", "color"],
  string: ["version"],
  default: { color: true },
  negatable: ["color"],
});
console.log("Wants help?", flags.help);
console.log("Version:", flags.version);
console.log("Wants color?:", flags.color);

// The `_` field of the returned object contains all arguments that were not
// recognized as flags.
console.log("Other:", flags._);
