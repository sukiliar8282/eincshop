import * as Effect from "effect/Effect";
import type { Instance } from "./Instance.ts";
/**
 * Shared scaffolding for the IAM Identity Center runtime bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate:
 *
 * - {@link makeIdentityStoreHttpBinding} — Identity Store data-plane
 *   operations (`identitystore:*` actions: user CRUD, group lookups,
 *   membership management). The runtime callable injects the bound
 *   {@link Instance}'s `IdentityStoreId`; the deploy-time half grants
 *   `actions` on the identity store ARN plus the region-less
 *   `user/*`/`group/*`/`membership/*` sub-resource ARNs the actions require.
 * - {@link makeIdentityCenterInstanceHttpBinding} — `sso:*` admin reads
 *   scoped to the bound {@link Instance} (account-assignment audit,
 *   permission set reads). The runtime callable injects the instance's
 *   `InstanceArn`; the deploy-time half grants `actions` on the instance ARN
 *   plus the region-less `permissionSet/*` and `account/*` ARNs.
 */
/**
 * Build the impl Effect for an Identity Store data-plane operation scoped to
 * one {@link Instance}: the deploy-time half grants `actions` on the
 * identity store ARN (`arn:aws:identitystore::{account}:identitystore/{id}`)
 * and the `user/*`/`group/*`/`membership/*` sub-resources, and the runtime
 * half injects the instance's `IdentityStoreId` into every request.
 */
export declare const makeIdentityStoreHttpBinding: <I extends {
    IdentityStoreId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IdentityCenter.DescribeUser`. */
    tag: string;
    /** The distilled operation; `IdentityStoreId` is injected from the instance. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the identity store + sub-resource ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(instance: Instance) => Effect.Effect<(request?: Omit<I, "IdentityStoreId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an `sso:*` admin operation scoped to one
 * {@link Instance}: the deploy-time half grants `actions` on the instance
 * ARN plus the region-less `permissionSet/*` and `account/*` ARNs, and the
 * runtime half injects the instance's `InstanceArn` into every request.
 */
export declare const makeIdentityCenterInstanceHttpBinding: <I extends {
    InstanceArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IdentityCenter.ListPermissionSets`. */
    tag: string;
    /** The distilled operation; `InstanceArn` is injected from the instance. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the instance / permission set / account ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(instance: Instance) => Effect.Effect<(request?: Omit<I, "InstanceArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map