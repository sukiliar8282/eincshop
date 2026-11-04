/**
 * Encode bytes into RFC4648 Base32 (no padding), lowercase.
 *
 * Performance notes:
 * - O(n) single pass, no big-int
 * - Avoids per-byte string concatenation by using a char array
 */
export declare function base32(bytes: Uint8Array): string;
//# sourceMappingURL=base32.d.ts.map