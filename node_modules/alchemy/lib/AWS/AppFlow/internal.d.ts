import * as appflow from "@distilled.cloud/aws/appflow";
import * as Effect from "effect/Effect";
/**
 * Coerce an AppFlow wire tag map (`Record<string, string | undefined>`) into
 * a plain `Record<string, string>`, dropping undefined values.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an AppFlow resource. Tag reads are best-effort.
 */
export declare const readAppFlowTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an AppFlow resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncAppFlowTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, appflow.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map