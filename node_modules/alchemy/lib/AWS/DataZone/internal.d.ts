import * as datazone from "@distilled.cloud/aws/datazone";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/**
 * Unwrap a DataZone `SensitiveString` (decoded as `Redacted`) to its plain
 * string value. `String(redacted)` would yield `"<redacted>"`, not the value.
 */
export declare const unredact: (value: string | Redacted.Redacted<string>) => string;
/**
 * Coerce a DataZone wire tag map (values may be `undefined` on the wire) into
 * a plain `Record<string, string>`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Sync tags on a DataZone resource by ARN: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncDataZoneTags: (resourceArn: string, observedTags: Record<string, string>, desiredTags: Record<string, string>) => Effect.Effect<void, datazone.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map