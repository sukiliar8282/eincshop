import * as Effect from "effect/Effect";
import type { Domain } from "./Domain.ts";
import type { Environment } from "./Environment.ts";
/**
 * Shared scaffolding for Amazon DataZone HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate: DataZone authorizes every action on the domain resource, so
 * the deploy-time half always grants `actions` on the bound domain's ARN.
 */
/**
 * Build the impl Effect for a domain-scoped DataZone operation: the runtime
 * callable injects the bound {@link Domain}'s id as `domainIdentifier` into
 * every request, and the deploy-time half grants `actions` on the domain ARN.
 */
export declare const makeDataZoneDomainHttpBinding: <I extends {
    domainIdentifier: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataZone.Search`. */
    tag: string;
    /** The distilled operation; `domainIdentifier` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the domain ARN. */
    actions: readonly string[];
}) => Effect.Effect<(domain: Domain) => Effect.Effect<(request?: Omit<I, "domainIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an environment-scoped DataZone operation: the
 * runtime callable injects the bound {@link Environment}'s domain id and
 * environment id, and the deploy-time half grants `actions` on the parent
 * domain's ARN (DataZone authorizes every action on the domain resource).
 */
export declare const makeDataZoneEnvironmentHttpBinding: <I extends {
    domainIdentifier: string;
    environmentIdentifier: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataZone.GetEnvironmentCredentials`. */
    tag: string;
    /** The distilled operation; both identifiers are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the parent domain ARN. */
    actions: readonly string[];
}) => Effect.Effect<(environment: Environment) => Effect.Effect<(request?: Omit<I, "domainIdentifier" | "environmentIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map