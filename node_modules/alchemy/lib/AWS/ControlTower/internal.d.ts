import * as controltower from "@distilled.cloud/aws/controltower";
import * as Effect from "effect/Effect";
/**
 * Reads the observed tags on a Control Tower resource (landing zone,
 * enabled control, or enabled baseline). Tag reads are best-effort — any
 * failure degrades to an empty map so ownership checks and tag syncs never
 * block the main lifecycle flow.
 */
export declare const observeControlTowerTags: (resourceArn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converges the tags on a Control Tower resource to the union of the
 * internal Alchemy ownership tags and the user's desired tags, diffing
 * against OBSERVED cloud tags (never olds/output) so adoption converges.
 */
export declare const syncControlTowerTags: (resourceArn: string, id: string, userTags: Record<string, string> | undefined) => Effect.Effect<void, controltower.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
/**
 * Key-order-insensitive JSON serialization, used to diff manifest and
 * parameter documents that round-trip through the Control Tower API (which
 * may reorder object keys).
 */
export declare const canonicalJson: (value: unknown) => string;
/**
 * Canonical comparison form for `{ key, value }` parameter lists: sorted by
 * key, order-insensitive values.
 */
export declare const canonicalParameters: (parameters: readonly {
    key: string;
    value: any;
}[] | undefined) => string;
//# sourceMappingURL=internal.d.ts.map