# Ende Docs

This repository contains the website running
[docs.ende.sh](https://docs.ende.sh). The intent of this project is to
centralize all official Ende documentation content in a single website. The site
is built with [satz](https://jsr.io/@ende/satz), a static site generator for
[Ende](https://ende.sh) built on the `@ende/*` standard library.

## Local development

Install [Ende](https://ende.sh). Then start the development server:

```console
ende task serve
```

It serves the site on [localhost:3000](http://localhost:3000) (`--port` picks
another), rebuilds when a file changes and reloads open pages. Redirects work
there too. To build the site into `_site/` once:

```console
ende task build
```

The site is configured in `_config.ts` (redirects come from `oldurls.json` and
`go.json`), its layouts are in `_includes/` and its components in
`_components/`. The pages are unstyled for now.

## Checks

```console
ende task build && ende task check:links   # every internal link and #fragment resolves
ende task test                             # front matter and sidebar rules
ende task test:examples                    # type-checks every example script
ende task check                            # type-checks the site's own code
```

The link checker reads the built site. Links into the API and standard library
reference are reported as pending until that reference is generated again.

## Editing content

The actual content of the docs site is found mostly in these folders:

- `runtime` - docs for the Ende CLI / runtime
- `examples` - docs for the [Examples](#Examples) section
- `lint/rules` - one page per lint rule

Pages are GitHub-flavored Markdown with YAML front matter. Callouts are GitHub
alerts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!CAUTION]`); text after the
marker is the callout's title, followed by a `>` line:

```md
> [!TIP] Want to type-check only?
>
> Use `ende check` instead.
```

A code block's file name goes in its fence: `` ```json title="ende.json" ``.

Left navigation for the different doc sections are configured in the `_data.ts`
files in their respective content directories.

- `runtime/_data.ts` - sidebar config for the Runtime section
- `examples/_data.ts` - the Examples catalog and its sidebar
- `lint/_data.ts` - the list of lint rules

Static files (like screenshots) can be included directly in the content folders
and referenced by URLs relative to the Markdown file. Files in `static/` are
published at the root of the site.

### Keep `last_modified` fresh

Every content page carries a `last_modified: YYYY-MM-DD` field in its
frontmatter. Whenever you change a page, bump that date to the day of the change
in the same pull request. CI enforces this: the `frontmatter_test` checks that
every page has a valid `last_modified`, and the Freshness workflow fails when a
page is edited without bumping it. Run `ende task check:freshness` locally to
check your branch.

### Guides teach, reference enumerates

A topic's depth lives in exactly one place. Guide pages (like `/runtime/test/`
or `/runtime/packages/`) teach the opinionated path with minimal flags and link
out for detail; reference pages (under `/runtime/reference/`) enumerate every
flag, field, and option exhaustively. Don't repeat flag or option documentation
in a guide: link to the reference instead. A guide may include at most one
summary table when it links to the full reference. When the same material exists
in both kinds of page, move the depth to the reference and keep the narrative in
the guide.

### Mark version-specific behavior

When documenting behavior that was added or changed in a specific Ende release,
say so where it's documented: a note callout titled with the release
(`> [!NOTE] Ende 2026.10.17`) for a change worth a callout, or an inline "(Ende
2026.10.17+)" for a brief mention. Releases are ChronVer dates. Don't mark
behavior that predates Ende's first release (2026.10.14).

## Reference docs

The API reference (`/api/`) and the standard library reference
(`/runtime/reference/std/`) aren't built at the moment. They will be generated
with `ende doc`.

## Versioning docs content

Philosophically, we want to maintain as few discrete versions of the
documentation as possible. This will reduce confusion for users (reduce the
number of versions they need to think about), improve search indexing, and help
us maintain the docs by keeping our build times faster.

In general, we should only version the documentation **when we want to
concurrently maintain several versions of the docs**, like for major versions.
For example - the [Node.js docs](https://nodejs.org/en/docs) are only versioned
for major releases, like `20.x` and `19.x`. We will adopt this pattern as well,
and won't have versioned docs for patch or feature releases.

For additive changes, it should usually be sufficient to indicate which version
a feature or API was released in. For example - in the Node 20 docs, the
[register function](https://nodejs.org/dist/latest-v20.x/docs/api/module.html#moduleregister)
is marked as being added in version `20.6.0`.

## Contribution

We are very grateful for any help you can offer to improve Ende's documentation!
For any small copy changes or fixes, please feel free to
[submit a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
directly to the `primary` branch of this repository.

For larger changes, please
[create a GitHub issue first](https://github.com/theende/docs/issues) to
describe your proposed updates. It will be better to get feedback on your
concept first before going to the trouble of writing a large number of docs!

Over time, we will add more in the way of linting and formatting to the pull
request process. But for now, you should merely ensure that `npm run build`
succeeds without error before submitting a pull request. This will ensure that
there are no broken links or invalid MDX syntax in the content you have
authored.

## Examples

[Ende by Example](https://docs.ende.sh/examples) is a collection of small
snippets of code, tutorials and videos showcasing various functions of the APIs
implemented in Ende.

### Adding an example script

- Examples are written in TypeScript
- Each example should be a single file, no more than 50 lines
- Each example should be a self-contained unit, and should depend on no
  dependencies other than Ende builtins and the standard library, unless a
  third-party library is strictly required.
- Each example should be runnable without additional dependencies on all systems
  (exceptions can be made for platform specific functionality)
- Examples should be introduce at most one (or in exceptional cases two or
  three) concepts in Ende / Web APIs. Existing concepts should be linked to.
- Code should be kept _really simple_, and should be easy to read and understand
  by anyone. Do not use complicated code constructs, or hard to follow builtins
  like `Array.reduce`
- Concepts introduced in an example should be explained

### Adding an example

To add an example, create a file in the `examples/scripts` directory. The file
name should be a short description of the example (in kebab case) and the
contents should be the code for the example. The file should be in the `.ts`
format. The file should start with a JSDoc style multi line comment that
describes the example:

```ts
/**
 * @title HTTP server: Hello World
 * @difficulty intermediate
 * @tags cli, deploy
 * @run --allow-net <url>
 * @group Basics
 *
 * An example of a HTTP server that serves a "Hello World" message.
 */
```

You should add a title, a difficulty level (`beginner` or `intermediate`), and a
list of tags (`cli`, `deploy`, `web` depending on where an example is runnable).
The `@run` tag should be included if the example can be run locally by just
doing `ende run <url>`. If running requires permissions, add these:

```ts
/**
 * ...
 * @run --allow-net --allow-read <url>
 */
```

After the pragmas, you can add a description of the example. This is optional,
but recommended for most examples. It should not be longer than one or two
lines. The description shows up at the top of the example in the example page,
and in search results.

After the JS Doc comment, you can write the code. Code can be prefixed with a
comment that describes the code. The comment will be rendered next to the code
in the example page.

## Special thanks for historical contributions

This repository is a fork of the [Deno docs](https://github.com/denoland/docs),
which were created using content from the
[Deno Manual](https://github.com/denoland/manual), a project contributed to by
hundreds of developers since 2018. You can view a list of historical
contributors in this repository with this command:

```bash
git shortlog -s -n
```

## License

MIT
