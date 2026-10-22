/**
 * @title Check if two values are deeply equal
 * @difficulty beginner
 * @tags cli, web
 * @run <url>
 * @resource {https://jsr.io/@ende/assert/doc/~/equal} Doc: @ende/assert equal
 * @group Basics
 *
 * Two objects with the same contents are not equal with the `===` operator,
 * which compares references. To compare by value, use a deep equality
 * check. This example uses `equal` and `assertEquals` from [`@ende/assert`](https://jsr.io/@ende/assert).
 */

// Reference comparison fails even when the contents match.
const first = { a: 1 };
const second = { a: 1 };
console.log(first === second); // false

// The standard library exports `equal`, a non-throwing deep comparison.
import { equal } from "jsr:@ende/assert";

console.log(equal({ a: [1, 2] }, { a: [1, 2] })); // true
console.log(equal(new Map([["a", 1]]), new Map([["a", 1]]))); // true
console.log(equal({ a: 1 }, { a: 1, b: undefined })); // false
// In tests, prefer an asserting variant, which throws with a readable diff
// of the two values on failure.
import { assertEquals } from "jsr:@ende/assert";

assertEquals({ a: [1, 2] }, { a: [1, 2] });
console.log("assertEquals passed"); // assertEquals passed
