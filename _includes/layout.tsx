import type { LayoutProps } from "@ende/satz";
import Footer from "../_components/Footer.tsx";
import Header from "../_components/Header.tsx";
import type { NavLink } from "../_lib/types.ts";

const DEFAULT_DESCRIPTION =
  "In-depth documentation, guides, and reference materials for building secure, high-performance JavaScript and TypeScript applications with Ende.";

/** The HTML document around every page: head, header, the page, footer. */
export default function Layout(props: LayoutProps) {
  const title = props.title as string | undefined;
  const description = (props.description as string | undefined) ?? DEFAULT_DESCRIPTION;
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
        <link rel="preconnect" href="https://rsms.me/"/>
        <link rel="preconnect" href="https://uchu.style/"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

        <link rel="stylesheet" href="https://rsms.me/inter/inter.css"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap"/>
        <link rel="stylesheet" href="https://uchu.style/uchu.css"/>

        <link rel="icon" href="/favicon.svg"/>
        <link rel="stylesheet" href="/style.css"/>
        <script type="module" src="/js/copy.js"></script>
        <script type="module" src="/js/tabs.js"></script>
        <script type="module" src="/js/menu.js"></script>
      </head>
      <body>
        <Header navigation={props.navigation as NavLink[]} url={props.url}/>
        {props.content}
        <Footer/>
      </body>
    </html>
  );
}
