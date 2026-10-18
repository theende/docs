---
last_modified: 2026-02-02
title: "Language Server Integration"
description: "Technical guide to integrating Ende's Language Server Protocol (LSP). Learn about LSP implementation details, custom commands, requests, notifications, and testing API integration for editor and tool developers."
oldUrl:
  - /runtime/manual/reference/lsp/
  - /runtime/manual/advanced/language_server/overview/
  - /runtime/manual/advanced/language_server/imports/
  - /runtime/manual/advanced/language_server/testing_api/
  - /runtime/reference/cli/lsp_integration/
---

> [!TIP]
> If you are looking for information how to use Ende's LSP with various editors,
> visit
> [Setup your environment page](/runtime/getting_started/setup_your_environment/).

The Ende CLI comes with a built in language server that can provide an
intelligent editing experience, as well as a way to easily access the other
tools that come built in with Ende. For most users, using the language server
would be via [an editor](/runtime/getting_started/setup_your_environment/).

This page is designed for those creating integrations to the language server or
providing a package registry for Ende that integrates intelligently.

The Ende Language Server provides a server implementation of the
[Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
which is specifically tailored to provide a _an Ende_ view of code. It is
integrated into the command line and can be started via the `lsp` sub-command.

## Structure

When the language server is started, a `LanguageServer` instance is created
which holds all of the state of the language server. It also defines all of the
methods that the client calls via the Language Server RPC protocol.

## Settings

The language server reads its settings from the `ende` section. Settings in the
`deno` section, which the Deno editor extensions send, are still accepted.

The language server supports a number of settings for a workspace:

- `ende.enable`
- `ende.enablePaths`
- `ende.cache`
- `ende.certificateStores`
- `ende.config`
- `ende.importMap`
- `ende.internalDebug`
- `ende.codeLens.implementations`
- `ende.codeLens.references`
- `ende.codeLens.referencesAllFunctions`
- `ende.codeLens.test`
- `ende.suggest.completeFunctionCalls`
- `ende.suggest.names`
- `ende.suggest.paths`
- `ende.suggest.autoImports`
- `ende.suggest.imports.autoDiscover`
- `ende.suggest.imports.hosts`
- `ende.lint`
- `ende.tlsCertificate`
- `ende.unsafelyIgnoreCertificateErrors`
- `ende.unstable`

And there are settings that are supported on a per resource basis by the
language server:

- `ende.enable`
- `ende.enablePaths`
- `ende.codeLens.test`

Ende analyzes these settings at multiple points in the language server process.
First, when the `initialize` request arrives from the client, the
`initializationOptions` will be assumed to be an object that represents the
`ende` namespace of options. For example, the following value will enable Ende
with the unstable APIs for this instance of the language server.

```json
{
  "enable": true,
  "unstable": true
}
```

When the language server receives a `workspace/didChangeConfiguration`
notification, it will assess if the client has indicated if it has a
`workspaceConfiguration` capability. If it does, it will send a
`workspace/configuration` request which will include a request for the workspace
configuration as well as the configuration of all URIs that the language server
is currently tracking.

If the client has the `workspaceConfiguration` capability, the language server
will send a configuration request for the URI when it received the
`textDocument/didOpen` notification in order to get the resources specific
settings.

If the client does not have the `workspaceConfiguration` capability, the
language server will assume the workspace setting applies to all resources.

## Commands

There are several commands that might be issued by the language server to the
client, which the client is expected to implement:

### .cache

`ende.cache` is sent as a resolution code action when there is an un-cached
module specifier that is being imported into a module. It will be sent with an
argument that contains the resolved specifier as a string to be cached.

### showReferences

`ende.showReferences` is sent as the command on some code lenses to show
locations of references. The arguments contain the specifier that is the subject
of the command, the start position of the target and the locations of the
references to show.

### test

`ende.test` is sent as part of a test code lens to, of which the client is
expected to run a test based on the arguments, which are the specifier the test
is contained in and the name of the test to filter the tests on.

## Requests

The LSP currently supports the following custom requests. A client should
implement these in order to have a fully functioning client that integrates well
with Ende:

### /cache

`ende/cache` will instruct Ende to attempt to cache a module and all of its
dependencies. If a `referrer` only is passed, then all dependencies for the
module specifier will be loaded. If there are values in the `uris`, then only
those `uris` will be cached.

It expects parameters of:

```ts
interface CacheParams {
  referrer: TextDocumentIdentifier;
  uris: TextDocumentIdentifier[];
}
```

### performance

`ende/performance` requests the return of the timing averages for the internal
instrumentation of Ende. It does not expect any parameters.

### reloadImportRegistries

`ende/reloadImportRegistries` reloads any cached responses from import
registries. It does not expect any parameters.

### virtualTextDocument

`ende/virtualTextDocument` requests a virtual text document from the LSP, which
is a read only document that can be displayed in the client. This allows clients
to access documents in the Ende cache, like remote modules and TypeScript
library files built into Ende. The Ende language server will encode all internal
files under the custom scheme `ende:`, so clients should route all requests for
the `ende:` scheme back to the `ende/virtualTextDocument` API.

It also supports a special URL of `ende:/status.md` which provides a markdown
formatted text document that contains details about the status of the LSP for
display to a user.

It expects parameters of:

```ts
interface VirtualTextDocumentParams {
  textDocument: TextDocumentIdentifier;
}
```

### task

`ende/task` requests the return of available ende tasks, see
[task_runner](/runtime/reference/cli/task_runner/). It does not expect any
parameters.

## Notifications

There is currently one custom notification that is sent from the server to the
client, `ende/registryState`. When `ende.suggest.imports.autoDiscover` is `true`
and an origin for an import being added to a document is not explicitly set in
`ende.suggest.imports.hosts`, the origin will be checked and the notification
will be sent to the client of the status.

When receiving the notification, if the param `suggestion` is `true`, the client
should offer the user the choice to enable the origin and add it to the
configuration for `ende.suggest.imports.hosts`. If `suggestion` is `false` the
client should add it to the configuration of as `false` to stop the language
server from attempting to detect if suggestions are supported.

The params for the notification are:

```ts
interface RegistryStatusNotificationParams {
  origin: string;
  suggestions: boolean;
}
```

## Language IDs

The language server supports diagnostics and formatting for the following
[text document language IDs](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocumentItem):

- `"javascript"`
- `"javascriptreact"`
- `"jsx"` _non standard, same as `javascriptreact`_
- `"typescript"`
- `"typescriptreact"`
- `"tsx"` _non standard, same as `typescriptreact`_

The language server supports only formatting for the following language IDs:

- `"json"`
- `"jsonc"`
- `"markdown"`

## Testing

The Ende language server supports a custom set of APIs to enable testing.
Language server clients can use them to list, run and report tests in a test
explorer.

Both the client and the server should support the experimental `testingApi`
capability:

```ts
interface ClientCapabilities {
  experimental?: {
    testingApi: boolean;
  };
}
```

```ts
interface ServerCapabilities {
  experimental?: {
    testingApi: boolean;
  };
}
```

When a version of Ende that supports the testing API encounters a client which
supports the capability, it will initialize the code which handles the test
detection and will start providing the notifications which enable it.

It should also be noted that when the testing API capabilities are enabled, the
testing code lenses will no longer be sent to the client.

### Testing settings

There are specific settings which change the behavior of the language server:

- `ende.testing.args` - An array of strings which will be provided as arguments
  when executing tests. This works in the same fashion as the `ende test`
  subcommand.
- `ende.testing.enable` - A binary flag that enables or disables the testing
  server

### Testing notifications

The server will send notifications to the client under certain conditions.

#### ende/testModule

When a module containing tests is discovered by the server, it will notify the
client by sending a `ende/testModule` notification along with a payload of
`TestModuleParams`.

Ende structures in this fashion:

- A module can contain _n_ tests.
- A test can contain _n_ steps.
- A step can contain _n_ steps.

When Ende does static analysis of a test module, it attempts to identify any
tests and test steps. Because of the dynamic way tests can be declared in Ende,
they cannot always be statically identified and can only be identified when the
module is executed. The notification is designed to handle both of these
situations when updating the client. When tests are discovered statically, the
notification `kind` will be `"replace"`, when tests or steps are discovered at
execution time, the notification `kind` will be `"insert"`.

As a test document is edited in the editor, and `textDocument/didChange`
notifications are received from the client, the static analysis of those changes
will be performed server side and if the tests have changed, the client will
receive a notification.

When a client receives a `"replace"` notification, it can safely "replace" a
test module representation, where when an `"insert"` it received, it should
recursively try to add to existing representations.

For test modules the `textDocument.uri` should be used as the unique ID for any
representation (as it the string URL to the unique module). `TestData` items
contain a unique `id` string. This `id` string is a SHA-256 hash of identifying
information that the server tracks for a test.

```ts
interface TestData {
  /** The unique ID for this test/step. */
  id: string;

  /** The display label for the test/step. */
  label: string;

  /** Any test steps that are associated with this test/step */
  steps?: TestData[];

  /** The range of the owning text document that applies to the test. */
  range?: Range;
}

interface TestModuleParams {
  /** The text document identifier that the tests are related to. */
  textDocument: TextDocumentIdentifier;

  /** A indication if tests described are _newly_ discovered and should be
   * _inserted_ or if the tests associated are a replacement for any existing
   * tests. */
  kind: "insert" | "replace";

  /** The text label for the test module. */
  label: string;

  /** An array of tests that are owned by this test module. */
  tests: TestData[];
}
```

#### ende/testModuleDelete

When a test module is deleted that the server is observing, the server will
issue a `ende/testModuleDelete` notification. When receiving the notification
the client should remove the representation of the test module and all of its
children tests and test steps.

```ts
interface TestModuleDeleteParams {
  /** The text document identifier that has been removed. */
  textDocument: TextDocumentIdentifier;
}
```

#### ende/testRunProgress

When a [`ende/testRun`](#endetestrun) is requested from the client, the server
will support progress of that test run via the `ende/testRunProgress`
notification.

The client should process these messages and update any UI representation.

The state change is represented in the `.message.kind` property of the
`TestRunProgressParams`. The states are:

- `"enqueued"` - A test or test step has been enqueued for testing.
- `"skipped"` - A test or test step was skipped. This occurs when the Ende test
  has the `ignore` option set to `true`.
- `"started"` - A test or test step has started.
- `"passed"` - A test or test step has passed.
- `"failed"` - A test or test step has failed. This is intended to indicate an
  error with the test harness instead of the test itself, but Ende currently
  does not support this distinction.
- `"errored"` - The test or test step has errored. Additional information about
  the error will be in the `.message.messages` property.
- `"end"` - The test run has ended.

```ts
interface TestIdentifier {
  /** The test module the message is related to. */
  textDocument: TextDocumentIdentifier;

  /** The optional ID of the test. If not present, then the message applies to
   * all tests in the test module. */
  id?: string;

  /** The optional ID of the step. If not present, then the message only applies
   * to the test. */
  stepId?: string;
}

interface TestMessage {
  /** The content of the message. */
  message: MarkupContent;

  /** An optional string which represents the expected output. */
  expectedOutput?: string;

  /** An optional string which represents the actual output. */
  actualOutput?: string;

  /** An optional location related to the message. */
  location?: Location;
}

interface TestEnqueuedStartedSkipped {
  /** The state change that has occurred to a specific test or test step.
   *
   * - `"enqueued"` - the test is now enqueued to be tested
   * - `"started"` - the test has started
   * - `"skipped"` - the test was skipped
   */
  type: "enqueued" | "started" | "skipped";

  /** The test or test step relating to the state change. */
  test: TestIdentifier;
}

interface TestFailedErrored {
  /** The state change that has occurred to a specific test or test step.
   *
   * - `"failed"` - The test failed to run properly, versus the test erroring.
   *   currently the Ende language server does not support this.
   * - `"errored"` - The test errored.
   */
  type: "failed" | "errored";

  /** The test or test step relating to the state change. */
  test: TestIdentifier;

  /** Messages related to the state change. */
  messages: TestMessage[];

  /** An optional duration, in milliseconds from the start to the current
   * state. */
  duration?: number;
}

interface TestPassed {
  /** The state change that has occurred to a specific test or test step. */
  type: "passed";

  /** The test or test step relating to the state change. */
  test: TestIdentifier;

  /** An optional duration, in milliseconds from the start to the current
   * state. */
  duration?: number;
}

interface TestOutput {
  /** The test or test step has output information / logged information. */
  type: "output";

  /** The value of the output. */
  value: string;

  /** The associated test or test step if there was one. */
  test?: TestIdentifier;

  /** An optional location associated with the output. */
  location?: Location;
}

interface TestEnd {
  /** The test run has ended. */
  type: "end";
}

type TestRunProgressMessage =
  | TestEnqueuedStartedSkipped
  | TestFailedErrored
  | TestPassed
  | TestOutput
  | TestEnd;

interface TestRunProgressParams {
  /** The test run ID that the progress message applies to. */
  id: number;

  /** The message*/
  message: TestRunProgressMessage;
}
```

### Testing requests

The server handles two different requests:

#### ende/testRun

To request the language server to perform a set of tests, the client sends a
`ende/testRun` request, which includes that ID of the test run to be used in
future responses to the client, the type of the test run, and any test modules
or tests to include or exclude.

Currently Ende only supports the `"run"` kind of test run. Both `"debug"` and
`"coverage"` are planned to be supported in the future.

When there are no test modules or tests that are included, it implies that all
discovered tests modules and tests should be executed. When a test module is
included, but not any test ids, it implies that all tests within that test
module should be included. Once all the tests are identified, any excluded tests
are removed and the resolved set of tests are returned in the response as
`"enqueued"`.

It is not possible to include or exclude test steps via this API, because of the
dynamic nature of how test steps are declared and run.

```ts
interface TestRunRequestParams {
  /** The id of the test run to be used for future messages. */
  id: number;

  /** The run kind. Currently Ende only supports `"run"` */
  kind: "run" | "coverage" | "debug";

  /** Test modules or tests to exclude from the test run. */
  exclude?: TestIdentifier[];

  /** Test modules or tests to include in the test run. */
  include?: TestIdentifier[];
}

interface EnqueuedTestModule {
  /** The test module the enqueued test IDs relate to */
  textDocument: TextDocumentIdentifier;

  /** The test IDs which are now enqueued for testing */
  ids: string[];
}

interface TestRunResponseParams {
  /** Test modules and test IDs that are now enqueued for testing. */
  enqueued: EnqueuedTestModule[];
}
```

#### ende/testRunCancel

If a client wishes to cancel a currently running test run, it sends a
`ende/testRunCancel` request with the test ID to cancel. The response back will
be a boolean of `true` if the test is cancelled or `false` if it was not
possible. Appropriate test progress notifications will still be sent as the test
is being cancelled.

```ts
interface TestRunCancelParams {
  /** The test id to be cancelled. */
  id: number;
}
```
