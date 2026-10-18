import goLinks from "./go.json" with { type: "json" };
import oldUrls from "./oldurls.json" with { type: "json" };

const redirects: Record<string, string> = {
  ...oldUrls,
  ...Object.fromEntries(
    Object.entries(goLinks).map(([name, url]) => [`/go/${name}/`, url]),
  ),
};

export default {
  location: "https://docs.ende.sh",
  search: true,
  ignore: [
    "AGENTS.md",
    "LICENSE",
    "README.md",
    "ende.json",
    "ende.lock",
    "go.json",
    "oldurls.json",
  ],
  copy: { static: "/", "examples/scripts": "/examples/scripts/" },
  redirects,
};
