import type { LayoutProps } from "@ende/satz";
import Footer from "../_components/Footer.tsx";
import Header from "../_components/Header.tsx";
import type { NavLink } from "../_lib/types.ts";

const DEFAULT_DESCRIPTION =
  "In-depth documentation, guides, and reference materials for building secure, high-performance JavaScript and TypeScript applications with Ende";

/** The HTML document around every page: head, header, the page, footer. */
export default function Layout(props: LayoutProps) {
  const title = props.title as string | undefined;
  const description = (props.description as string | undefined) ??
    DEFAULT_DESCRIPTION;
  const is404 = props.url === "/404.html";

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="color-scheme" content="light dark"/>
        <title>{title ? `${title} | Ende Docs` : "Ende Docs"}</title>
        <meta name="description" content={description}/>
        {!is404 && <link rel="canonical" href={`https://docs.ende.sh${props.url}`}/>}
        <link rel="icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
        <script type="module" src="/js/copy.js"></script>
        <script type="module" src="/js/tabs.js"></script>
      </head>
      <body>
        <a href="#content">Skip to main content</a>
        <Header navigation={props.navigation as NavLink[]} url={props.url}/>
        {props.content}
        <Footer/>
      </body>
    </html>
  );
}
