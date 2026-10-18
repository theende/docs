/**
 * @title Call C functions with FFI
 * @difficulty intermediate
 * @tags cli
 * @run --allow-ffi <url>
 * @resource {https://docs.ende.sh/api/ende/~/Ende.dlopen} Doc: Ende.dlopen
 * @resource {https://docs.ende.sh/api/ende/~/Ende.UnsafeCallback} Doc: Ende.UnsafeCallback
 * @resource {https://docs.ende.sh/runtime/fundamentals/ffi/} FFI in the Ende manual
 * @group System
 *
 * The Foreign Function Interface lets Ende call functions in native shared
 * libraries directly, with no glue code or build step. Ende.dlopen opens a
 * library, you describe the signatures of the symbols you need, and they
 * become callable JavaScript functions. This example calls into the C
 * standard library, which is already present on every system.
 */

// Every platform ships a C library under a different name. The C standard
// library is a convenient demo target because it requires no installation,
// but the same approach works for any shared library, including ones you
// build yourself.
const libNames: Partial<Record<typeof Ende.build.os, string>> = {
  darwin: "/usr/lib/libSystem.B.dylib",
  linux: "libc.so.6",
  windows: "msvcrt.dll",
};
const libName = libNames[Ende.build.os];
if (!libName) throw new Error(`Unsupported OS: ${Ende.build.os}`);

// Open the library and declare the symbols to bind. Each entry gives the
// parameter types and result type in C terms: buffer accepts a TypedArray
// and passes a pointer to its bytes, usize is an unsigned size_t, and
// function accepts a pointer to a callback.
const libc = Ende.dlopen(libName, {
  strlen: { parameters: ["buffer"], result: "usize" },
  qsort: {
    parameters: ["buffer", "usize", "usize", "function"],
    result: "void",
  },
});

// Call strlen with a NUL-terminated byte buffer. C strings end with a zero
// byte, so we append one explicitly. Results of type usize come back as
// BigInt because size_t can exceed the safe integer range.
const message = new TextEncoder().encode("Hello from C\0");
console.log(libc.symbols.strlen(message)); // 12n

// Native code can also call back into JavaScript. Ende.UnsafeCallback wraps
// a JavaScript function in a native function pointer. Here we build a
// comparator for the C qsort function. The arguments arrive as raw
// pointers, and UnsafePointerView reads typed values from them.
const comparator = new Ende.UnsafeCallback(
  { parameters: ["pointer", "pointer"], result: "i32" },
  (a, b) => {
    const x = new Ende.UnsafePointerView(a!).getInt32();
    const y = new Ende.UnsafePointerView(b!).getInt32();
    return x - y;
  },
);

// Sort an Int32Array in place by handing qsort the buffer, the element
// count, the element size in bytes, and our comparator pointer.
const numbers = new Int32Array([42, 7, 19, 1, 88]);
libc.symbols.qsort(numbers, BigInt(numbers.length), 4n, comparator.pointer);
console.log([...numbers]); // [ 1, 7, 19, 42, 88 ]

// Close the callback and the library when you are done with them so the
// process can release the native resources.
comparator.close();
libc.close();
