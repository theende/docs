export const TAGS = {
  cli: {
    description: "Works in Ende CLI",
    title: "cli"
  },
  web: {
    description: "Works in on the Web",
    title: "web"
  }
};

export const DIFFICULTIES = {
  beginner: {
    description: "No significant prior knowledge is required for this example.",
    title: "Beginner"
  },
  intermediate: {
    description: "Some prior knowledge is needed for this example.",
    title: "Intermediate"
  }
};

export type ExampleFromFileSystem = {
  content: string;
  externalURL?: string;
  label: string;
  name: string;
  parsed: Example;
};

export interface Example {
  additionalResources: [string, string][];
  description: string;
  difficulty: keyof typeof DIFFICULTIES;
  files: ExampleFile[];
  group: string;
  id: string;
  run?: string;
  sortOrder: string | number;
  tags: (keyof typeof TAGS)[];
  title: string;
}

export interface ExampleFile {
  name: string;
  snippets: ExampleSnippet[];
}

export interface ExampleSnippet {
  code: string;
  text: string;
}

export interface VideoReference {
  externalURL: string;
}
