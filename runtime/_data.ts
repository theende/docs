import type { Sidebar } from "../_lib/types.ts";

export const sidebar = [
  {
    title: "Get started",
    items: [
      {
        title: "Welcome to Deno",
        href: "/runtime/",
      },
      {
        title: "Installation",
        href: "/runtime/getting_started/installation/",
      },
      {
        title: "Setup your environment",
        href: "/runtime/getting_started/setup_your_environment/",
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Running code",
        href: "/runtime/run/",
        disclosure: true,
        items: [
          {
            title: "Watch mode and HMR",
            href: "/runtime/run/watch_mode/",
          },
        ],
      },
      {
        title: "Dependency management",
        href: "/runtime/packages/",
        disclosure: true,
        items: [
          {
            title: "Publishing",
            href: "/runtime/packages/publishing/",
          },
          {
            title: "Supply chain",
            href: "/runtime/packages/supply_chain/",
          },
          {
            title: "Private repositories",
            href: "/runtime/packages/private_repositories/",
          },
        ],
      },
      {
        title: "Web development",
        href: "/runtime/fundamentals/web_dev/",
      },
      {
        title: "JSX and React",
        href: "/runtime/reference/jsx/",
      },
      {
        title: "HTTP Server",
        href: "/runtime/fundamentals/http_server/",
      },
      {
        title: "Testing",
        href: "/runtime/test/",
        disclosure: true,
        items: [
          {
            title: "Mocking",
            href: "/runtime/test/mocking/",
          },
          {
            title: "Snapshots",
            href: "/runtime/test/snapshots/",
          },
          {
            title: "Coverage",
            href: "/runtime/test/coverage/",
          },
          {
            title: "Documentation tests",
            href: "/runtime/test/doc_tests/",
          },
          {
            title: "Sanitizers",
            href: "/runtime/test/sanitizers/",
          },
          {
            title: "Migrating from Jest",
            href: "/runtime/test/migrate_from_jest/",
          },
        ],
      },
      {
        title: "Linting and formatting",
        href: "/runtime/lint_and_format/",
      },
      {
        title: "Building CLI apps",
        href: "/runtime/cli_apps/",
      },
      {
        title: "Desktop apps",
        href: "/runtime/desktop/",
        disclosure: true,
        items: [
          {
            title: "Configuration",
            href: "/runtime/desktop/configuration/",
          },
          {
            title: "Backends",
            href: "/runtime/desktop/backends/",
          },
          {
            title: "HTTP serving",
            href: "/runtime/desktop/serving/",
          },
          {
            title: "Frameworks",
            href: "/runtime/desktop/frameworks/",
          },
          {
            title: "Windows",
            href: "/runtime/desktop/windows/",
          },
          {
            title: "WebGPU rendering",
            href: "/runtime/desktop/webgpu/",
          },
          {
            title: "Bindings",
            href: "/runtime/desktop/bindings/",
          },
          {
            title: "Menus",
            href: "/runtime/desktop/menus/",
          },
          {
            title: "Tray and dock",
            href: "/runtime/desktop/tray_and_dock/",
          },
          {
            title: "Dialogs",
            href: "/runtime/desktop/dialogs/",
          },
          {
            title: "Notifications",
            href: "/runtime/desktop/notifications/",
          },
          {
            title: "Hot module replacement",
            href: "/runtime/desktop/hmr/",
          },
          {
            title: "DevTools",
            href: "/runtime/desktop/devtools/",
          },
          {
            title: "Auto-update",
            href: "/runtime/desktop/auto_update/",
          },
          {
            title: "Error reporting",
            href: "/runtime/desktop/error_reporting/",
          },
          {
            title: "Distribution",
            href: "/runtime/desktop/distribution/",
          },
          {
            title: "Comparison",
            href: "/runtime/desktop/comparison/",
          },
        ],
      },
      {
        title: "Deploying your app",
        href: "/runtime/deploy/",
      },
    ],
  },
  {
    title: "Concepts",
    items: [
      {
        title: "TypeScript",
        href: "/runtime/fundamentals/typescript/",
      },
      {
        title: "Security",
        href: "/runtime/fundamentals/security/",
      },
      {
        title: "Modules",
        href: "/runtime/fundamentals/modules/",
      },
      {
        title: "Config files",
        href: "/runtime/fundamentals/configuration/",
      },
      {
        title: "Workspaces",
        href: "/runtime/fundamentals/workspaces/",
      },
      {
        title: "Stability and releases",
        href: "/runtime/fundamentals/stability_and_releases/",
      },
    ],
  },
  {
    title: "Diagnostics",
    items: [
      {
        title: "Debugging",
        href: "/runtime/fundamentals/debugging/",
      },
      {
        title: "CPU profiling",
        href: "/runtime/fundamentals/cpu_profiling/",
      },
      {
        title: "OpenTelemetry",
        href: "/runtime/fundamentals/open_telemetry/",
      },
    ],
  },
  {
    title: "Advanced",
    items: [
      {
        title: "FFI",
        href: "/runtime/fundamentals/ffi/",
      },
      {
        title: "WebAssembly",
        href: "/runtime/reference/wasm/",
      },
      {
        title: "Cron",
        href: "/runtime/fundamentals/cron/",
      },
      {
        title: "Lint plugins",
        href: "/runtime/reference/lint_plugins/",
      },
      {
        title: "Bundling",
        href: "/runtime/reference/bundling/",
      },
      {
        title: "Docker",
        href: "/runtime/reference/docker/",
      },
      {
        title: "Continuous integration",
        href: "/runtime/reference/continuous_integration/",
      },
      {
        title: "Deno & VS Code",
        href: "/runtime/reference/vscode/",
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        title: "Overview",
        href: "/runtime/reference/",
      },
      {
        title: "CLI",
        href: "/runtime/reference/cli/",
        disclosure: true,
        items: [
          {
            title: "deno add",
            href: "/runtime/reference/cli/add/",
          },
          {
            title: "deno audit",
            href: "/runtime/reference/cli/audit/",
          },
          {
            title: "deno bench",
            href: "/runtime/reference/cli/bench/",
          },
          {
            title: "deno bump-version",
            href: "/runtime/reference/cli/bump_version/",
          },
          {
            title: "deno bundle",
            href: "/runtime/reference/cli/bundle/",
          },
          {
            title: "deno check",
            href: "/runtime/reference/cli/check/",
          },
          {
            title: "deno ci",
            href: "/runtime/reference/cli/ci/",
          },
          {
            title: "deno clean",
            href: "/runtime/reference/cli/clean/",
          },
          {
            title: "deno compile",
            href: "/runtime/reference/cli/compile/",
          },
          {
            title: "deno create",
            href: "/runtime/reference/cli/create/",
          },
          {
            title: "deno completions",
            href: "/runtime/reference/cli/completions/",
          },
          {
            title: "deno coverage",
            href: "/runtime/reference/cli/coverage/",
          },
          {
            title: "deno desktop",
            href: "/runtime/reference/cli/desktop/",
          },
          {
            title: "deno doc",
            href: "/runtime/reference/cli/doc/",
          },
          {
            title: "deno eval",
            href: "/runtime/reference/cli/eval/",
          },
          {
            title: "deno fmt",
            href: "/runtime/reference/cli/fmt/",
          },
          {
            title: "deno info",
            href: "/runtime/reference/cli/info/",
          },
          {
            title: "deno init",
            href: "/runtime/reference/cli/init/",
          },
          {
            title: "deno install",
            href: "/runtime/reference/cli/install/",
          },
          {
            title: "deno jupyter",
            href: "/runtime/reference/cli/jupyter/",
          },
          {
            title: "deno link",
            href: "/runtime/reference/cli/link/",
          },
          {
            title: "deno lint",
            href: "/runtime/reference/cli/lint/",
          },
          {
            title: "deno list",
            href: "/runtime/reference/cli/list/",
          },
          {
            title: "deno outdated",
            href: "/runtime/reference/cli/outdated/",
          },
          {
            title: "deno publish",
            href: "/runtime/reference/cli/publish/",
          },
          {
            title: "deno lsp",
            href: "/runtime/reference/cli/lsp/",
          },
          {
            title: "deno remove",
            href: "/runtime/reference/cli/remove/",
          },
          {
            title: "deno repl",
            href: "/runtime/reference/cli/repl/",
          },
          {
            title: "deno run",
            href: "/runtime/reference/cli/run/",
          },
          {
            title: "deno serve",
            href: "/runtime/reference/cli/serve/",
          },
          {
            title: "deno task",
            href: "/runtime/reference/cli/task/",
          },
          {
            title: "deno test",
            href: "/runtime/reference/cli/test/",
          },
          {
            title: "deno transpile",
            href: "/runtime/reference/cli/transpile/",
          },
          {
            title: "deno types",
            href: "/runtime/reference/cli/types/",
          },
          {
            title: "deno uninstall",
            href: "/runtime/reference/cli/uninstall/",
          },
          {
            title: "deno unlink",
            href: "/runtime/reference/cli/unlink/",
          },
          {
            title: "deno update",
            href: "/runtime/reference/cli/update/",
          },
          {
            title: "deno upgrade",
            href: "/runtime/reference/cli/upgrade/",
          },
          {
            title: "deno unstable flags",
            href: "/runtime/reference/cli/unstable_flags/",
          },
          {
            title: "deno watch",
            href: "/runtime/reference/cli/watch/",
          },
          {
            title: "deno why",
            href: "/runtime/reference/cli/why/",
          },
          {
            title: "deno x",
            href: "/runtime/reference/cli/x/",
          },
        ],
      },
      {
        title: "deno.json",
        href: "/runtime/reference/deno_json/",
      },
      {
        title: "TypeScript",
        href: "/runtime/reference/ts_config_migration/",
      },
      {
        title: "Environment variables",
        href: "/runtime/reference/env_variables/",
      },
      {
        title: "Permissions",
        href: "/runtime/reference/permissions/",
      },
      {
        title: "LSP integration",
        href: "/runtime/reference/lsp_integration/",
      },
      {
        title: "Lint rules",
        href: "/lint/",
      },
    ],
  },
  {
    title: "Contributing",
    items: [
      {
        title: "Overview",
        href: "/runtime/contributing/",
      },
      {
        title: "Architecture",
        href: "/runtime/contributing/architecture/",
      },
      {
        title: "Style guide",
        href: "/runtime/contributing/style_guide/",
      },
      {
        title: "Help",
        href: "/runtime/help/",
      },
    ],
  },
] satisfies Sidebar;

export const sectionTitle = "Runtime";
export const sectionHref = "/runtime/";

export default { sidebar, sectionTitle, sectionHref };
