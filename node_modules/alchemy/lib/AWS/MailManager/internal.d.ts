import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Effect from "effect/Effect";
/**
 * Read the observed tags for any Mail Manager resource ARN. Tag reads are
 * best-effort — a race with deletion (or a missing-tags edge) degrades to an
 * empty record rather than failing the lifecycle operation.
 */
export declare const readMailManagerTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converge the tags on a Mail Manager resource to `desired`, diffing against
 * the OBSERVED cloud tags so adoption converges.
 */
export declare const syncMailManagerTags: (arn: string, desired: Record<string, string>) => Effect.Effect<void, mm.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Retry an operation while Mail Manager reports a ConflictException — e.g.
 * deleting an ingress point that is still PROVISIONING. Explicitly typed so
 * `Retry.Return`'s conditional type never leaks into declaration emit.
 */
export declare const retryWhileMailManagerConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Repeat a poll until `done` holds (bounded). Explicitly typed for the same
 * declaration-emit reason as above.
 */
export declare const repeatUntilMailManagerStable: <A, E, R>(self: Effect.Effect<A, E, R>, done: (a: A) => boolean, times?: number) => Effect.Effect<A, E, R>;
export declare const sameShape: (l: unknown, r: unknown) => boolean;
//# sourceMappingURL=internal.d.ts.map