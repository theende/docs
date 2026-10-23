/**
 * @title Detect a TTY and get terminal size
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.stdout} Doc: Ende.stdout
 * @resource {https://docs.ende.sh/api/ende/~/Ende.consoleSize} Doc: Ende.consoleSize
 * @group System
 *
 * A program can check whether it is talking to a real terminal or to a pipe.
 * This is how command line tools decide to print colors and progress bars
 * for humans, but plain machine readable text when their output is piped to
 * another program or a file.
 */

// `isTerminal` reports whether a standard stream is attached to a terminal.
// Run directly in a terminal, both lines print true. Run piped, as in
// `ende run terminal_detection.ts | cat`, `stdin` stays attached to the
// terminal but `stdout` is now a pipe, so the second line prints `false`.
console.log(`stdin is a terminal: ${Ende.stdin.isTerminal()}`); // stdin is a terminal: true
console.log(`stdout is a terminal: ${Ende.stdout.isTerminal()}`); // stdout is a terminal: false (when piped; true in a terminal)

// `Ende.consoleSize` returns the current size of the terminal window. It
// throws when no standard stream is attached to a terminal, for example in
// CI, so wrap it in a `try`/`catch`.
try {
  const { columns, rows } = Ende.consoleSize();
  console.log(`terminal size: ${columns}x${rows}`); // e.g. terminal size: 120x40
} catch {
  console.log("no terminal attached");
}

// The practical use: pick human friendly output only when `stdout` really is
// a terminal. Here ANSI color codes are skipped when the output is piped,
// so downstream programs receive clean text.
const useColor = Ende.stdout.isTerminal();
const status = useColor ? "\x1b[32mok\x1b[0m" : "ok";
console.log(status); // ok (shown in green in a terminal, plain when piped)
