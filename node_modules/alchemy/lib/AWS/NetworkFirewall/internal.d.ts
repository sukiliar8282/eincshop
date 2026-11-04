import type * as NFW from "@distilled.cloud/aws/network-firewall";
import * as Effect from "effect/Effect";
/** Convert a Network Firewall `Tag[]` list into a plain record. */
export declare const nfwTagsToRecord: (tags: readonly NFW.Tag[] | undefined) => Record<string, string>;
/** Convert a plain record into a Network Firewall `Tag[]` list. */
export declare const recordToNfwTags: (record: Record<string, string>) => NFW.Tag[];
/**
 * Network Firewall rejects deletion of a rule group / firewall policy that is
 * still referenced (or was referenced moments ago) with
 * `InvalidOperationException`. Dependents are deleted first by the engine,
 * but the service releases the reference asynchronously — retry through a
 * short window.
 */
export declare const retryWhileNfwInUse: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * A freshly-created rule group / policy can transiently return
 * `ResourceNotFoundException` from a follow-up describe. Bounded retry
 * through the eventual-consistency window.
 */
export declare const retryWhileNfwNotFound: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map