/**
 * @title Get operating system information
 * @difficulty beginner
 * @tags cli
 * @run -S <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.build} Doc: Ende.build
 * @group System
 *
 * Scripts often need to know what system they are running on, for example
 * to pick a platform specific binary or to include host details in logs.
 * Ende exposes this through `Ende.build` and a few dedicated functions.
 */

// `Ende.build` describes the platform the running Ende binary was built for.
// It is a plain object and requires no permissions.
console.log(Ende.build.os);     // e.g. darwin
console.log(Ende.build.arch);   // e.g. aarch64
console.log(Ende.build.target); // e.g. aarch64-apple-darwin

// The functions below report details about the host machine and need the
// system permission, granted with `-S` (short for `--allow-sys`).
console.log(Ende.hostname()); // e.g. MacBookPro.localdomain

// The kernel release of the operating system.
console.log(Ende.osRelease()); // e.g. 24.5.0

// Seconds since the machine was booted.
console.log(Ende.osUptime()); // e.g. 2083872
