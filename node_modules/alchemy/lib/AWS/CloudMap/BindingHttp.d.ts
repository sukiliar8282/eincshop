import * as Effect from "effect/Effect";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Service } from "./Service.ts";
/**
 * Shared scaffolding for AWS Cloud Map HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the three
 * builders below. Everything except the operation, the IAM action list, and
 * the injected identifier is boilerplate.
 */
/**
 * Build the impl Effect for a service-scoped control/data operation. The
 * runtime callable injects the bound {@link Service}'s id as the request's
 * `ServiceId`; the deploy-time half grants `actions` on the service ARN
 * plus any `extraStatements` (e.g. the Route 53 record management Cloud Map
 * performs on the caller's behalf for DNS services).
 */
export declare const makeCloudMapServiceHttpBinding: <I extends {
    ServiceId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CloudMap.GetInstance`. */
    tag: string;
    /** The distilled operation; `ServiceId` is injected from the service. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the service ARN. */
    actions: readonly string[];
    /** Additional statements granted alongside the service-scoped one. */
    extraStatements?: readonly PolicyStatement[];
}) => Effect.Effect<(service: Service) => Effect.Effect<(request?: Omit<I, "ServiceId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a discovery data-plane operation
 * (`DiscoverInstances` / `DiscoverInstancesRevision`). The runtime callable
 * injects the bound {@link Service}'s namespace and service names; the
 * deploy-time half grants `actions` on `*` — the discovery data-plane
 * actions do not support resource-level IAM permissions.
 */
export declare const makeCloudMapDiscoveryHttpBinding: <I extends {
    NamespaceName: string;
    ServiceName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CloudMap.DiscoverInstances`. */
    tag: string;
    /** The distilled operation; the names are injected from the service. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*` (no resource-level scoping). */
    actions: readonly string[];
}) => Effect.Effect<(service: Service) => Effect.Effect<(request?: Omit<I, "NamespaceName" | "ServiceName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (`GetOperation`).
 * The deploy-time half grants `actions` on `*` — these actions do not
 * support resource-level IAM permissions.
 */
export declare const makeCloudMapAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CloudMap.GetOperation`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map