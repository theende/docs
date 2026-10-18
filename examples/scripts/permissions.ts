/**
 * @title Permission management
 * @difficulty beginner
 * @tags cli
 * @run <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.Permissions} Doc: Ende.Permissions
 * @resource {https://docs.ende.sh/runtime/fundamentals/security/} Doc: Permissions and the --allow-* flags
 * @group CLI
 *
 * There are times where depending on the state of permissions
 * granted to a process, we want to do different things. This is
 * made very easy to do with the Ende permissions API.
 *
 * This example covers the runtime permissions API. To grant permissions when
 * launching a program from the command line with flags like `--allow-read` or
 * `--allow-net`, see the permissions reference linked above.
 */

// In the most simple case, we can just request a permission by it's name.
// In this case, we ask for -E and prompt the user. The user will
// not be prompted if it was already allowed in the past and not revoked.
let status = await Ende.permissions.request({ name: "env" });
if (status.state === "granted") {
  console.log("'env' permission is granted.");
} else {
  console.log("'env' permission is denied.");
}

// There are also synchronous versions of all the permission APIs
status = Ende.permissions.requestSync({ name: "env" });
if (status.state === "granted") {
  console.log("'env' permission is granted.");
} else {
  console.log("'env' permission is denied.");
}

// We can also query permissions without asking for them. In this case,
// we are querying whether or not we have the read permission. Not only
// can we query whether we have a permission or not, we can even specify
// what directories we have permissions in using the path option.
const readStatus = await Ende.permissions.query({
  name: "read",
  path: "/etc",
});
console.log(readStatus.state);

// In the case that we no longer need a permission, it is also possible
// to revoke a process's access to that permission. This is useful when
// a process starts running untrusted code.
import { assert } from "jsr:@ende/assert";

const runStatus = await Ende.permissions.revoke({ name: "run" });
assert(runStatus.state !== "granted");
