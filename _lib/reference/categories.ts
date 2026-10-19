// What each category of the API reference covers, by its `@category` name.
// Symbols without a category are listed under "Other"; the `Ende` members
// only desktop apps have are listed under "Desktop".

export const endeCategories: Record<string, string> = {
  "Cloud": "Schedule recurring tasks.\n\nEg {@linkcode Ende.cron}",
  "Desktop":
    "Windows, menus, the tray, the dock and updates for apps built with `ende desktop`. Only available in desktop apps.\n\nEg {@linkcode Ende.BrowserWindow}, {@linkcode Ende.Tray}",
  "Errors": "Error types raised by Ende APIs, for handling specific failures.\n\nEg {@linkcode Ende.errors.NotFound}",
  "FFI":
    "Foreign Function Interface. Call functions from shared libraries (e.g., C/C++) directly from Ende.\n\nUseful for integrating with existing native code or accessing low-level system functionality.\n\nEg {@linkcode Ende.dlopen}",
  "Fetch":
    "HTTP client options for `fetch`: proxies, certificates and connection settings.\n\nEg {@linkcode Ende.createHttpClient}",
  "File System":
    "File System APIs for working with files, directories, and file metadata. Includes functions for reading, writing, and manipulating file paths.\n\nEg {@linkcode Ende.readDir}, {@linkcode Ende.readTextFile}",
  "GPU":
    "GPU programming and rendering. Efficiently use a device’s graphics processing unit (GPU) for high-performance computations and complex image rendering.\n\nEg {@linkcode Ende.UnsafeWindowSurface}",
  "HTTP Server":
    "Handling HTTP requests, serving responses, and managing server behavior.\n\nEg {@linkcode Ende.serve}",
  "I/O":
    "Interfaces for reading, writing, seeking, and managing resources. For handling of data streams, file I/O, and console interactions.\n\nEg {@linkcode Ende.stdin}, {@linkcode Ende.inspect}",
  "Linter": "Interfaces and helpers for writing and testing custom lint rules.\n\nEg {@linkcode Ende.lint.Plugin}",
  "Network":
    "A wide range of networking tasks, from low-level connections to high-level server creation. Handle HTTP requests, WebSocket communication, and DNS resolution. Useful for building web servers, clients, and networking tools.\n\nEg {@linkcode Ende.connect}, {@linkcode Ende.listen}, {@linkcode Ende.resolveDns}",
  "Permissions":
    "Permission system controls access to resources (e.g., file system, network, environment variables).\n\nRequest permissions explicitly, enhancing security and user trust.\n\nEg {@linkcode Ende.permissions}",
  "Runtime":
    "System-related functionality, process management, and observability.\n\nEg {@linkcode Ende.mainModule}, {@linkcode Ende.exit}, {@linkcode Ende.cwd}",
  "Subprocess":
    "Spawn and manage child processes, execute commands, and collect output. Useful for executing external programs from Ende.\n\nEg {@linkcode Ende.Command}",
  "Telemetry":
    "OpenTelemetry observability integration tools.\n\nUseful for getting more visibility into your own programs.\n\nEg {@linkcode Ende.telemetry}",
  "Testing":
    "Robust testing and benchmarking capabilities to ensure code quality and performance.\n\nEg {@linkcode Ende.test}, {@linkcode Ende.bench}",
  "WebSockets": "Upgrade HTTP requests to WebSocket connections on the server.\n\nEg {@linkcode Ende.upgradeWebSocket}"
};

export const webCategories: Record<string, string> = {
  "Cache":
    "Tools for caching and managing data. Store and retrieve data from the cache, manage cache storage limits, and handle cache-related events.\n\nEg {@linkcode caches}",
  "Canvas": "Create, transform, and display images and graphics.\n\nEg {@linkcode createImageBitmap}",
  "Crypto":
    "Cryptographic functionality for secure communication, data protection, and key management. Generate secure random numbers, encrypt and decrypt data, and manage cryptographic keys.\n\nEg {@linkcode crypto}",
  "Encoding":
    "Handle character encoding, decoding, and binary data conversion.\n\nEg {@linkcode TextDecoder}, {@linkcode TextEncoder}",
  "Events":
    "Handle events and interactions. Listen for and respond to various events, including custom events, errors, progress, and promise rejections.\n\nEg {@linkcode addEventListener}",
  "Fetch":
    "HTTP client for fetching data across a network. Retrieve resources from servers, handle responses, and manage network requests.\n\nEg {@linkcode fetch}, {@linkcode Response}, {@linkcode Request}, {@linkcode Headers}",
  "File":
    "File and data manipulation tools. Handle files, read data and work with binary content.\n\nEg {@linkcode File}, {@linkcode Blob}",
  "Geometry Interfaces Module API":
    "Points, rectangles, quadrilaterals and matrices for 2D and 3D geometry.\n\nEg {@linkcode DOMMatrix}, {@linkcode DOMPoint}",
  "GPU":
    "GPU programming and rendering. Efficiently use a device’s graphics processing unit (GPU) for high-performance computations and complex image rendering.\n\nEg {@linkcode GPUDevice}",
  "I/O": "Interfaces for reading, writing and managing data in console interactions.\n\nEg {@linkcode console}",
  "Intl":
    "Tools for internationalization and localization. Create language-aware applications, handle date and time formatting, and adapt content for different locales.\n\nEg {@linkcode Intl}",
  "Messaging":
    "Facilitate communication between different parts of an application, allowing data exchange and coordination.\n\nEg {@linkcode BroadcastChannel}, {@linkcode MessageChannel}",
  "Performance": "Measure, analyze, and optimize application performance.\n\nEg {@linkcode performance}",
  "Platform":
    "Essential interfaces and functions for the runtime environment: scheduling and cancelling tasks, user prompts, and the global object.\n\nEg {@linkcode prompt}, {@linkcode setTimeout}",
  "Storage":
    "Store data locally. Manage session storage and local storage.\n\nEg {@linkcode sessionStorage}, {@linkcode localStorage}",
  "Streams":
    "Manage data streams, queuing strategies, and transformations. Handle data in chunks, process large datasets, and optimize memory usage.\n\nEg {@linkcode ReadableStream}, {@linkcode WritableStream}, {@linkcode TransformStream}",
  "URL": "Manipulate URLs, extract data from URLs and manage query parameters.\n\nEg {@linkcode URL}",
  "Wasm":
    "Efficiently execute computationally intensive tasks. Wasm module compilation, instantiation, memory management, and interaction with imports and exports.\n\nEg {@linkcode WebAssembly.instantiate}, {@linkcode WebAssembly.Module}, {@linkcode WebAssembly.Instance}",
  "WebSockets":
    "Enable real-time communication between clients and servers using WebSockets.\n\nEg {@linkcode WebSocket}",
  "Workers":
    "Run script operations in background threads. Manage worker threads, communicate with workers, and handle data transfer between workers and the main thread.\n\nEg {@linkcode Worker}"
};

/** The URL segment of a category: `File System` → `file-system`, `I/O` → `io`. */
export function categorySlug(category: string): string {
  return category.toLowerCase().replace("i/o", "io").replace(
    /[^a-z0-9]+/g,
    "-"
  ).replace(/^-|-$/g, "");
}
