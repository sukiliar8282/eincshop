import type * as s3files from "@distilled.cloud/aws/s3files";
import * as Effect from "effect/Effect";
declare const S3FilesNotConverged_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "S3FilesNotConverged";
} & Readonly<A>;
/**
 * Raised when an S3 Files file system or access point fails to settle into
 * `available` within the bounded polling budget, or when the API returns a
 * structurally incomplete description.
 */
export declare class S3FilesNotConverged extends S3FilesNotConverged_base<{
    readonly resource: string;
    readonly status: string | undefined;
}> {
}
/**
 * Bounded retry through transient `ConflictException` states — e.g. deleting
 * a file system or access point whose previous lifecycle transition is still
 * settling.
 *
 * Expressed as an explicitly-typed module-scope helper: inlining
 * `Effect.retry` in lifecycle code leaves its conditional return type
 * unresolved in the provider's declaration emit, which widens the
 * `AWS.providers()` layer type for every downstream consumer.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Repeat an observe poll until `done` holds (bounded — file systems and
 * access points typically become `available` within seconds). Explicitly
 * typed for the declaration-emit reason above.
 */
export declare const untilSettled: <A, E, R>(self: Effect.Effect<A, E, R>, done: (a: A) => boolean) => Effect.Effect<A, E, R>;
/**
 * Convert the wire tag list (`[{ key, value }]`) into a plain record for
 * diffing with `diffTags`.
 */
export declare const toTagRecord: (tags: readonly s3files.Tag[] | undefined) => Record<string, string>;
/**
 * Convert a plain tag record into the wire tag list shape.
 */
export declare const toTagList: (tags: Record<string, string>) => s3files.Tag[];
export {};
//# sourceMappingURL=internal.d.ts.map