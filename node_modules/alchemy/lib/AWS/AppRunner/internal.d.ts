import * as apprunner from "@distilled.cloud/aws/apprunner";
import * as Effect from "effect/Effect";
/**
 * App Runner documents configuration statuses as `ACTIVE`/`INACTIVE` but
 * the wire returns lowercase `active`/`inactive` (observed live for auto
 * scaling configurations and VPC connectors) — compare case-insensitively.
 */
export declare const isActiveStatus: (status: string | undefined) => boolean;
/**
 * Convert an App Runner wire tag list into a plain record, dropping
 * malformed entries.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags of an App Runner resource. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readAppRunnerTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an App Runner resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncAppRunnerTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, apprunner.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Convert a desired tag record into the wire tag list for create calls.
 */
export declare const toWireTags: (tags: Record<string, string>) => apprunner.Tag[];
//# sourceMappingURL=internal.d.ts.map