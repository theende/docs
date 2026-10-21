---
last_modified: 2026-10-20
title: "Deploying your app"
description: "Ways to run an Ende app in production: a standalone compiled binary, the runtime on your own host, and containers."
---

Once your app runs locally, you run it in production on infrastructure you
control. This page maps the options.

## Choosing an option

- **Want a single self-contained artifact with no runtime to install?**
  [Compile to a standalone binary](#self-hosting-the-runtime) and run it on any
  machine.
- **Already have container infrastructure?** Build a
  [container image](#containers) that installs Ende.

## Self-hosting the runtime

To run on a VM or bare metal yourself, you have two paths:

- [Compile a standalone binary](/runtime/reference/cli/compile/) with
  `ende compile`. The result bundles your code and the runtime into a single
  executable with no external dependencies, which you can copy to a server and
  run directly.
- [Install Ende](/runtime/getting_started/installation/) on the host and run
  your app with [`ende serve`](/runtime/reference/cli/serve/) for a
  production-ready HTTP server, typically behind a process manager such as
  systemd.

## Containers

Ende doesn't publish container images yet. Install it in your image with the
install script, or copy in a binary compiled with `ende compile`:

```dockerfile title="Dockerfile"
FROM debian:stable-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl unzip ca-certificates \
  && curl -fsSL https://ende.sh/install.sh | sh
ENV PATH="/root/.ende/bin:$PATH"
WORKDIR /app
COPY . .
RUN ende install --entrypoint main.ts
CMD ["ende", "serve", "--allow-net", "main.ts"]
```

## Production considerations

Whichever option you choose, a few things carry across:

- **[Permissions](/runtime/fundamentals/security/).** Grant only the access your
  app needs (`--allow-net`, `--allow-read`, and friends) rather than running
  with all permissions.
- **[Environment variables](/runtime/reference/env_variables/).** Configure
  secrets and per-environment settings through the environment rather than
  hard-coding them.
- **[Observability](/runtime/fundamentals/open_telemetry/).** Ende has built-in
  OpenTelemetry support for traces, metrics, and logs.
- **[Continuous integration](/runtime/reference/continuous_integration/).** Run
  tests, linting, and formatting checks before you deploy.
