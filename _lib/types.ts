/** A link in the top navigation (`navigation` in `_data.json`). */
export interface NavLink {
  name: string;
  href: string;
}

/** A section's sidebar (`sidebar` in its `_data.ts`): groups of links. */
export type Sidebar = SidebarSection[];

export interface SidebarSection {
  title?: string;
  href?: string;
  items?: SidebarItem[];
}

export interface SidebarItem {
  title: string;
  href?: string;
  items?: SidebarItem[];
  /** For a group that has a page of its own: link the group's title to it. */
  disclosure?: boolean;
  externalUrl?: string;
  type?: "video" | "example" | "tutorial";
}

/** A heading, as satz lists them in a Markdown page's `toc`. */
export interface TocEntry {
  depth: number;
  text: string;
  slug: string;
}
