import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Effect from "effect/Effect";
/**
 * Bounded retry through `ConcurrentModificationException` — Lake Formation
 * serializes grant/revoke/settings mutations and rejects concurrent writers.
 * Explicitly typed so declaration emit does not widen the provider layer (see
 * PATTERNS §7 on inlined `Effect.retry`).
 */
export declare const retryWhileConcurrentModification: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through `InvalidLakeFormationPrincipal` — a freshly-created
 * IAM role/user takes ~10s to propagate before Lake Formation accepts it as a
 * principal ("Invalid principal, arn: ..." surfaced as a typed synthetic
 * error via the distilled patch). Explicitly typed for the same
 * declaration-emit reason as above.
 */
export declare const retryWhileInvalidPrincipal: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Observe the permissions a specific principal holds on a resource.
 *
 * IMPORTANT: this deliberately lists by `Resource` only and filters entries
 * client-side by exact principal identifier. Listing with a `Principal`
 * filter makes Lake Formation fold the `IAM_ALLOWED_PRINCIPALS` group grant
 * (typically `ALL`) into the principal's effective permissions, which would
 * make the reconciler believe `ALL` was granted directly (verified live).
 */
export declare const observePrincipalPermissions: (principal: string, resource: lf.Resource, catalogId: string | undefined) => Effect.Effect<{
    permissions: lf.Permission[];
    permissionsWithGrantOption: lf.Permission[];
}, lf.ListPermissionsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map