import * as Effect from "effect/Effect";
type Input = ArrayBuffer | Uint8Array | string;
export declare const sha256: (input: Input) => Effect.Effect<string, never, never>;
export declare const sha256Object: (input: object) => Effect.Effect<string, never, never>;
/**
 * Stable sha256 hex digest of a resolved Task input. Unlike
 * {@link sha256Object} this does not stabilize key ordering — it hashes the
 * raw `JSON.stringify(input ?? null)` so identical inputs map to identical
 * hashes for caching/equality checks.
 */
export declare const hashInput: (input: unknown) => Effect.Effect<string>;
export {};
//# sourceMappingURL=sha256.d.ts.map