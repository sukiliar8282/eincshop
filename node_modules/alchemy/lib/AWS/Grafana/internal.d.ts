import * as grafana from "@distilled.cloud/aws/grafana";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/** Unwrap a possibly-redacted string field returned by the Grafana API. */
export declare const unredact: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
/**
 * Coerce a Grafana wire tag map (values are `string | undefined`) into a
 * plain `Record<string, string>`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/** Read the observed tags of a Grafana resource by ARN (best-effort). */
export declare const readGrafanaTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a Grafana resource: diff OBSERVED cloud tags against the
 * desired set and apply only the delta. Grafana's `tagResource` takes a tag
 * map, so the `upsert` delta is folded back into a record.
 */
export declare const syncGrafanaTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, grafana.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map