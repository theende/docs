/**
 * @title RSASSA-PKCS1-v1_5 Signature and Verification
 * @difficulty intermediate
 * @tags cli, web
 * @run <url>
 * @group Cryptography
 *
 * This example demonstrates RSA signature and verification using Ende’s built-in SubtleCrypto API.
 */

// Convert the text to a `Uint8Array` using `TextEncoder` (required for signing).
const data = new TextEncoder().encode("Hello, Ende!");

const { privateKey, publicKey } = await crypto.subtle.generateKey(
  {
    hash: { name: "SHA-256" },
    modulusLength: 2048, // 2048-bit key for strong security
    name: "RSASSA-PKCS1-v1_5",
    publicExponent: new Uint8Array([1, 0, 1]) // Public exponent: 65537
  },
  true,
  ["verify", "sign"]
);

// Sign the data using the private key.
const signature = await crypto.subtle.sign(
  { name: "RSASSA-PKCS1-v1_5" },
  privateKey,
  data
);

// Log the signature as a byte array.
console.log("Signature:", new Uint8Array(signature));

// Verify the signature using the public key.
const verification = await crypto.subtle.verify(
  { name: "RSASSA-PKCS1-v1_5" },
  publicKey,
  signature,
  data
);

console.log("Verification:", verification);
