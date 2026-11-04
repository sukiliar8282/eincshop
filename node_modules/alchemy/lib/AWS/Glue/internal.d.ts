import * as glue from "@distilled.cloud/aws/glue";
import * as Effect from "effect/Effect";
/** `arn:aws:glue:{region}:{account}:catalog` */
export declare const catalogArn: (region: string, accountId: string) => string;
/** `arn:aws:glue:{region}:{account}:database/{name}` */
export declare const databaseArn: (region: string, accountId: string, databaseName: string) => string;
/** `arn:aws:glue:{region}:{account}:table/{database}/{table}` */
export declare const tableArn: (region: string, accountId: string, databaseName: string, tableName: string) => string;
/** `arn:aws:glue:{region}:{account}:crawler/{name}` */
export declare const crawlerArn: (region: string, accountId: string, crawlerName: string) => string;
/** `arn:aws:glue:{region}:{account}:job/{name}` */
export declare const jobArn: (region: string, accountId: string, jobName: string) => string;
/** `arn:aws:glue:{region}:{account}:connection/{name}` */
export declare const connectionArn: (region: string, accountId: string, connectionName: string) => string;
/**
 * Fetch the observed Glue tags for a resource ARN as a plain record. Glue's
 * `GetTags` returns a `{ Tags: { key: value } }` map (not the array shape most
 * AWS services use). Tolerate a missing/untaggable resource as `{}`.
 */
export declare const fetchObservedTags: (resourceArn: string) => Effect.Effect<{
    [k: string]: string;
}, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync a Glue resource's tags: diff OBSERVED cloud tags against desired and
 * apply the delta via `TagResource` (map of adds/updates) / `UntagResource`
 * (list of removed keys).
 */
export declare const syncTags: (resourceArn: string, observed: Record<string, string>, desired: Record<string, string>) => Effect.Effect<void, glue.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Bounded retry through `CrawlerRunningException` — a crawler cannot be
 * updated or deleted while a crawl is in progress. Explicitly typed so the
 * conditional `Retry.Return` type does not leak into the provider's
 * declaration emit and widen `AWS.providers()` for downstream consumers.
 */
export declare const retryWhileCrawlerRunning: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through `ConcurrentModificationException` — Glue catalog
 * mutations occasionally race under concurrent reconciles. Explicitly typed
 * for the same declaration-emit reason as above.
 */
export declare const retryWhileConcurrentModification: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through `GlueRoleNotAssumable` — a freshly-created IAM role is
 * not yet assumable by the Glue service (IAM propagation), which surfaces as a
 * message-discriminated `InvalidInputException` (patched into a typed tag).
 * Explicitly typed for the same declaration-emit reason as above.
 */
export declare const retryWhileRoleNotAssumable: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Glue validates crawler S3 targets through a service credential that can lag
 * a newly-created bucket. Retry only the distilled synthetic tag for the
 * observed InvalidAccessKeyId propagation failure.
 */
export declare const retryWhileCrawlerTargetNotReady: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/** Bounded retry for transient states that prevent crawler deletion. */
export declare const retryCrawlerDelete: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/** Glue free-form parameter/label maps arrive with `undefined` values erased. */
export declare const cleanMap: (map: Record<string, string | undefined> | undefined) => Record<string, string>;
//# sourceMappingURL=internal.d.ts.map