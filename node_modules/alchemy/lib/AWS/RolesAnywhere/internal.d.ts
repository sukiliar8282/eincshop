import * as rolesanywhere from "@distilled.cloud/aws/rolesanywhere";
import * as Effect from "effect/Effect";
/**
 * Convert a RolesAnywhere wire tag list (`{ key, value }[]`, values possibly
 * decoded as `Redacted`) into a plain record.
 */
export declare const toTagRecord: (tags: ReadonlyArray<rolesanywhere.Tag> | undefined) => Record<string, string>;
/**
 * Convert a desired tag record into the RolesAnywhere wire tag list for
 * create/import calls.
 */
export declare const toWireTags: (tags: Record<string, string>) => rolesanywhere.Tag[];
/**
 * Read the observed tags of a RolesAnywhere resource. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readRolesAnywhereTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a RolesAnywhere resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta.
 */
export declare const syncRolesAnywhereTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, rolesanywhere.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map