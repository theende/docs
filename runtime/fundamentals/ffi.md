---
last_modified: 2026-10-20
title: "Foreign Function Interface (FFI)"
description: "Learn how to use Ende's Foreign Function Interface (FFI) to call native libraries directly from JavaScript or TypeScript. Includes examples, best practices, and security considerations."
---

Ende's Foreign Function Interface (FFI) allows JavaScript and TypeScript code to
call functions in dynamic libraries written in languages like C, C++, or Rust.
This enables you to integrate native code performance and capabilities directly
into your Ende applications.

<a href="/api/ende/ffi/" class="docs-cta runtime-cta">Ende FFI Reference
Docs</a>

## Introduction to FFI

FFI provides a bridge between Ende's JavaScript runtime and native code. This
allows you to:

- Use existing native libraries within your Ende applications
- Implement performance-critical code in languages like Rust or C
- Access operating system APIs and hardware features not directly available in
  JavaScript

Ende's FFI implementation is based on the
[`Ende.dlopen`](/api/ende/~/Ende.dlopen/) API, which loads dynamic libraries and
creates JavaScript bindings to the functions they export.

## Security considerations

FFI requires explicit permission using the
[`--allow-ffi`](/runtime/reference/permissions/#ffi-foreign-function-interface)
flag, as native code runs outside of Ende's security sandbox:

```sh
ende run --allow-ffi my_ffi_script.ts
```

> [!NOTE]
> <strong>Important security warning</strong>: Unlike JavaScript code running in
> the Ende sandbox, native libraries loaded via FFI have the same access level
> as the Ende process itself. This means they can:
>
> - Access the filesystem
> - Make network connections
> - Access environment variables
> - Execute system commands
>
> Always ensure you trust the native libraries you're loading through FFI.

## Basic usage

The basic pattern for using FFI in Ende involves:

1. Defining the interface for the native functions you want to call
2. Loading the dynamic library using [`Ende.dlopen()`](/api/ende/~/Ende.dlopen/)
3. Calling the loaded functions

Here's a simple example loading a C library:

```ts
const dylib = Ende.dlopen("libexample.so", {
  add: { parameters: ["i32", "i32"], result: "i32" }
});

console.log(dylib.symbols.add(5, 3)); // 8

dylib.close();
```

## Loading libraries

The first argument to [`Ende.dlopen()`](/api/ende/~/Ende.dlopen/) is the path to
the dynamic library. Ende hands this path to the operating system's dynamic
loader (`dlopen` on Linux and macOS, `LoadLibrary` on Windows), so the way the
file is located follows the OS rules, not Ende's module resolution.

There are two ways to specify the library:

- **A path with a separator** (for example `"./libexample.so"` or
  `"/usr/lib/libexample.so"`) is opened from that exact location. A _relative_
  path like `"./libexample.so"` is resolved against the **current working
  directory of the process**, not against the location of your `.ts` file. This
  is a common source of "could not open library" errors: running the same script
  from a different directory changes where Ende looks.
- **A bare name** with no separator (for example `"libexample.so"`) is left to
  the OS to find on its standard search path. On Linux that means
  `LD_LIBRARY_PATH` and the system cache (such as `/usr/lib`); on macOS the
  `DYLD_*` paths; on Windows the executable's directory, the system directories,
  and `PATH`. Use this form for libraries that are already installed
  system-wide.

### Resolving the path relative to your module

To load a library that ships next to your source file regardless of the current
working directory, resolve the path against `import.meta.url` instead of using a
bare relative string:

```ts
// Always points at libexample.so sitting next to this module.
const path = new URL("./libexample.so", import.meta.url).pathname;

const dylib = Ende.dlopen(
  path,
  {
    add: { parameters: ["i32", "i32"], result: "i32" }
  } as const
);
```

This pattern also works inside an executable produced by
[`ende compile`](/runtime/reference/cli/compile/) (see below).

### Bundling a library with `ende compile`

[`Ende.dlopen`](/api/ende/~/Ende.dlopen/) needs a real file on disk, so a
dynamic library is not embedded in a compiled binary automatically. Include it
explicitly with the `--include` flag:

```sh
ende compile --allow-ffi --include libexample.so main.ts
```

At runtime Ende unpacks the included library to a temporary directory and points
`import.meta.url` at it, so a module that resolves its path with
`new URL("./libexample.so", import.meta.url).pathname` (as shown above) finds
the bundled copy and the resulting binary runs on a machine that does not have
the library installed. If you do not bundle the library, ship it alongside the
executable and load it by a path relative to the binary, or rely on the system
search path described above.

### Handling load failures

[`Ende.dlopen`](/api/ende/~/Ende.dlopen/) throws synchronously when the library
cannot be loaded or when a declared symbol is missing, so wrap the call in a
`try`/`catch` to fail gracefully:

```ts
let dylib;
try {
  dylib = Ende.dlopen(
    "./libexample.so",
    {
      add: { parameters: ["i32", "i32"], result: "i32" }
    } as const
  );
} catch (err) {
  // A missing or unreadable file reports "Could not open library: ...".
  // A missing function reports "Failed to register symbol <name>: ...".
  console.error("Failed to load native library:", err.message);
  Ende.exit(1);
}
```

The error message distinguishes the two common cases: the file itself could not
be opened (wrong path, missing file, or an architecture mismatch), or the file
loaded but one of the symbols you declared was not found in it.

## Supported types

Ende's FFI supports a variety of data types for parameters and return values:

| FFI Type               | Ende                 | C                        | Rust                      |
| ---------------------- | -------------------- | ------------------------ | ------------------------- |
| `i8`                   | `number`             | `char` / `signed char`   | `i8`                      |
| `u8`                   | `number`             | `unsigned char`          | `u8`                      |
| `i16`                  | `number`             | `short int`              | `i16`                     |
| `u16`                  | `number`             | `unsigned short int`     | `u16`                     |
| `i32`                  | `number`             | `int` / `signed int`     | `i32`                     |
| `u32`                  | `number`             | `unsigned int`           | `u32`                     |
| `i64`                  | `bigint`             | `long long int`          | `i64`                     |
| `u64`                  | `bigint`             | `unsigned long long int` | `u64`                     |
| `usize`                | `bigint`             | `size_t`                 | `usize`                   |
| `isize`                | `bigint`             | `size_t`                 | `isize`                   |
| `f32`                  | `number`             | `float`                  | `f32`                     |
| `f64`                  | `number`             | `double`                 | `f64`                     |
| `void`[1]              | `undefined`          | `void`                   | `()`                      |
| `pointer`              | `{} \| null`         | `void *`                 | `*mut c_void`             |
| `buffer`[2]            | `TypedArray \| null` | `uint8_t *`              | `*mut u8`                 |
| `function`[3]          | `{} \| null`         | `void (*fun)()`          | `Option<extern "C" fn()>` |
| `{ struct: [...] }`[4] | `TypedArray`         | `struct MyStruct`        | `MyStruct`                |

The `pointer` type has been split into a `pointer` and a `buffer` type to ensure
users take advantage of optimizations for Typed Arrays, and the JavaScript
representation of `pointer` has become an opaque pointer object or `null` for
null pointers.

- [1] `void` type can only be used as a result type.
- [2] `buffer` type accepts TypedArrays as parameter, but it always returns a
  pointer object or `null` when used as result type like the `pointer` type.
- [3] `function` type works exactly the same as the `pointer` type as a
  parameter and result type.
- [4] `struct` type is for passing and returning C structs by value (copy). The
  `struct` array must enumerate each of the struct's fields' type in order. The
  structs are padded automatically: Packed structs can be defined by using an
  appropriate amount of `u8` fields to avoid padding. Only TypedArrays are
  supported as structs, and structs are always returned as `Uint8Array`s.

## Working with structs

To pass or return a C struct by value, describe its layout with
`{ struct: [...] }` — an array that lists each field's FFI type in declaration
order. Struct values are passed as a `TypedArray` whose bytes match the C
layout, and structs returned by value come back as a `Uint8Array` of the right
length. The `struct` array in the type table earlier on this page is the
authoritative shape.

Suppose you have this small C library that operates on a 2D `Point`:

```c title="point.c"
typedef struct {
  double x;
  double y;
} Point;

double distance(Point a, Point b) {
  double dx = a.x - b.x;
  double dy = a.y - b.y;
  return __builtin_sqrt(dx * dx + dy * dy);
}

Point midpoint(Point a, Point b) {
  Point m;
  m.x = (a.x + b.x) / 2.0;
  m.y = (a.y + b.y) / 2.0;
  return m;
}
```

Build it as a shared library. The compiler flags and output filename vary by
platform:

<ende-tabs group-id="operating-systems">
<ende-tab value="linux" label="Linux" default>

```sh
cc -shared -fPIC -O2 -o libpoint.so point.c
```

</ende-tab>
<ende-tab value="mac" label="macOS">

```sh
cc -dynamiclib -O2 -o libpoint.dylib point.c
```

</ende-tab>
<ende-tab value="windows" label="Windows">

```sh
cl /LD /O2 point.c /Fe:point.dll
```

</ende-tab>
</ende-tabs>

Then call into it from Ende, using the filename for your platform in
[`Ende.dlopen`](/api/ende/~/Ende.dlopen/). Note that the `struct` definition is
an _array of field types_ in declaration order, not an object with named fields:

```ts title="point.ts"
// `Point` mirrors the C `struct Point { double x; double y; }`.
const Point = { struct: ["f64", "f64"] } as const;

const lib = Ende.dlopen(
  "./libpoint.so",
  {
    distance: { parameters: [Point, Point], result: "f64" },
    midpoint: { parameters: [Point, Point], result: Point }
  } as const
);

// Build struct values as a TypedArray whose bytes match the C layout.
// Two f64 fields → two slots in a Float64Array.
const a = new Float64Array([1.0, 2.0]); // Point { x: 1.0, y: 2.0 }
const b = new Float64Array([4.0, 6.0]); // Point { x: 4.0, y: 6.0 }

// FFI reads the underlying bytes, so pass the buffer as a Uint8Array view.
const aBytes = new Uint8Array(a.buffer);
const bBytes = new Uint8Array(b.buffer);

console.log("distance =", lib.symbols.distance(aBytes, bBytes));

// A struct returned by value comes back as a Uint8Array sized to the struct.
// Wrap it in a Float64Array to read the fields back out.
const midBytes = lib.symbols.midpoint(aBytes, bBytes);
const mid = new Float64Array(midBytes.buffer);
console.log("midpoint =", { x: mid[0], y: mid[1] });

lib.close();
```

Run it with the `--allow-ffi` permission:

```sh
ende run --allow-ffi point.ts
```

You should see:

```console
distance = 5
midpoint = { x: 2.5, y: 4 }
```

A few things to keep in mind when working with structs:

- **Layout matches the C compiler.** Ende pads struct fields the same way your C
  compiler does. If you need a packed struct, pad it explicitly with `u8`
  fields, as noted in the type table above.
- **Field order is positional.** The `struct` array is just types, in
  declaration order — there are no field names on the JavaScript side. The
  TypedArray you pass must lay the fields out in the same order.
- **Returned structs are bytes.** A struct result is always a `Uint8Array`; view
  it through the appropriate `TypedArray` (or a `DataView`) to read the fields.

## Working with callbacks

You can pass JavaScript functions as callbacks to native code:

```ts
const signatures = {
  setCallback: {
    parameters: ["function"],
    result: "void"
  },
  runCallback: {
    parameters: [],
    result: "void"
  }
} as const;

// Create a callback function
const callback = new Ende.UnsafeCallback(
  { parameters: ["i32"], result: "void" } as const,
  (value) => {
    console.log("Callback received:", value);
  }
);

// Pass the callback to the native library
dylib.symbols.setCallback(callback.pointer);

// Later, this will trigger our JavaScript function
dylib.symbols.runCallback();

// Always clean up when done
callback.close();
```

## Best practices with FFI

1. Always close resources. Close libraries with `dylib.close()` and callbacks
   with `callback.close()` when done.

2. Prefer TypeScript. Use TypeScript for better type-checking when working with
   FFI.

3. Wrap FFI calls in try/catch blocks to handle errors gracefully.

4. Be extremely careful when using FFI, as native code can bypass Ende's
   security sandbox.

5. Keep the FFI interface as small as possible to reduce the attack surface.

## Examples

### Using a Rust library

Here's an example of creating and using a Rust library with Ende:

First, create a Rust library:

```rust
// lib.rs
#[unsafe(no_mangle)]
pub extern "C" fn fibonacci(n: u32) -> u32 {
  if n <= 1 {
    return n;
  }
  fibonacci(n - 1) + fibonacci(n - 2)
}
```

Compile it as a dynamic library:

```sh
rustc --crate-type cdylib lib.rs
```

Then use it from Ende:

```ts
const libName = {
  windows: "./lib.dll",
  linux: "./liblib.so",
  darwin: "./liblib.dylib"
}[Ende.build.os];

const dylib = Ende.dlopen(
  libName,
  {
    fibonacci: { parameters: ["u32"], result: "u32" }
  } as const
);

// Calculate the 10th Fibonacci number
const result = dylib.symbols.fibonacci(10);
console.log(`Fibonacci(10) = ${result}`); // 55

dylib.close();
```

### Examples

- [Netsaur](https://github.com/denosaurs/netsaur/blob/c1efc3e2df6e2aaf4a1672590a404143203885a6/packages/core/src/backends/cpu/mod.ts)
- [WebView_deno](https://github.com/webview/webview_deno/blob/main/src/ffi.ts)
- [Deno_sdl2](https://github.com/littledivy/deno_sdl2/blob/main/mod.ts)
- [Ende FFI examples repository](https://github.com/denoffi/denoffi_examples)

These community-maintained repos includes working examples of FFI integrations
with various native libraries across different operating systems.

## Related Approaches to Native Code Integration

While Ende's FFI provides a direct way to call native functions, there are other
approaches to integrate native code:

## Alternatives to FFI

Before using FFI, consider these alternatives:

- [WebAssembly](/runtime/reference/wasm/), for portable native code that runs
  within Ende's sandbox.
- Use [`Ende.Command`](/api/ende/~/Ende.Command/) to execute external binaries
  and subprocesses with controlled permissions.
- Check whether [Ende's native APIs](/api/ende/) already provide the
  functionality you need.

Ende's FFI capabilities provide powerful integration with native code, enabling
performance optimizations and access to system-level functionality. However,
this power comes with significant security considerations. Always be cautious
when working with FFI and ensure you trust the native libraries you're using.
