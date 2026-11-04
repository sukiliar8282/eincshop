import * as medialive from "@distilled.cloud/aws/medialive";
import * as Effect from "effect/Effect";
declare const MediaLiveResourcePending_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MediaLiveResourcePending";
} & Readonly<A>;
/**
 * Raised while a MediaLive resource is still transitioning (e.g. a channel
 * in `CREATING`); used as a typed retry signal, never surfaced on success.
 */
export declare class MediaLiveResourcePending extends MediaLiveResourcePending_base<{
    message: string;
}> {
}
/** Bounded wait (3s x 30 = 90s) while a resource is still transitioning. */
export declare const retryWhilePending: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry (3s x 10) on `ConflictException` — MediaLive rejects
 * deletes/updates while a dependent resource is still detaching.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
declare const MediaLiveIncompleteResponse_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MediaLiveIncompleteResponse";
} & Readonly<A>;
/**
 * Raised when a MediaLive API response omits a field the provider requires
 * (e.g. a create response without the resource body or its Id/Arn).
 */
export declare class MediaLiveIncompleteResponse extends MediaLiveIncompleteResponse_base<{
    message: string;
}> {
}
/** Narrow an optional wire field to defined with a typed failure. */
export declare const ensurePresent: <T>(value: T | undefined, what: string) => Effect.Effect<T, MediaLiveIncompleteResponse>;
/**
 * Narrow a MediaLive resource body to one whose server-assigned `Id`/`Arn`
 * are present, failing with a typed error otherwise.
 */
export declare const ensureIdentified: <T extends {
    Id?: string;
    Arn?: string;
}>(value: T | undefined, what: string) => Effect.Effect<T & {
    Id: string;
    Arn: string;
}, MediaLiveIncompleteResponse>;
/**
 * Coerce a MediaLive wire tag map (values are `string | undefined`) into a
 * plain `Record<string, string>`, dropping any undefined values.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of a MediaLive resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readMlTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a MediaLive resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta. MediaLive's `createTags` upserts
 * a tag map; `deleteTags` removes keys.
 */
export declare const syncMlTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, medialive.CreateTagsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=internal.d.ts.map