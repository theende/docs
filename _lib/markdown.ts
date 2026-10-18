import { parse, render } from "@ende/markdown";
import { raw, type RawHtml } from "@ende/satz/jsx-runtime";

/** Renders Markdown from data (CLI help, example descriptions) as trusted HTML. */
export function markdown(source: string): RawHtml {
  return raw(render(parse(source, { gfm: true }), { headingIds: false }));
}
