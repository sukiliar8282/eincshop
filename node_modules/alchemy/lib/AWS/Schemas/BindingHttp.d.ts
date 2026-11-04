import * as Effect from "effect/Effect";
import type { Discoverer } from "./Discoverer.ts";
import type { Registry } from "./Registry.ts";
import type { Schema } from "./Schema.ts";
/**
 * Shared scaffolding for EventBridge Schemas HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the identifier resolver, and the
 * IAM action list is boilerplate.
 */
/**
 * Build the impl Effect for a Schemas operation scoped to a {@link Schema}:
 * the deploy-time half grants `actions` on the bound schema's ARN, and the
 * runtime half injects the schema's `RegistryName` + `SchemaName` into every
 * request.
 */
export declare const makeSchemasSchemaHttpBinding: <I extends {
    RegistryName: string;
    SchemaName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Schemas.DescribeSchema`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the schema ARN. */
    actions: readonly string[];
}) => Effect.Effect<(schema: Schema) => Effect.Effect<(request?: Omit<I, "RegistryName" | "SchemaName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Schemas operation scoped to a {@link Registry}:
 * the deploy-time half grants `actions` on the registry ARN and on the
 * registry's schema-type ARN (`…:schema/{registryName}*` — the resource
 * `schemas:SearchSchemas` authorizes against), and the runtime half injects
 * the registry's `RegistryName` into every request.
 */
export declare const makeSchemasRegistryHttpBinding: <I extends {
    RegistryName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Schemas.SearchSchemas`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the registry ARN. */
    actions: readonly string[];
}) => Effect.Effect<(registry: Registry) => Effect.Effect<(request?: Omit<I, "RegistryName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Schemas operation scoped to a
 * {@link Discoverer}: the deploy-time half grants `actions` on the bound
 * discoverer's ARN (plus `ruleActions` on the discoverer's managed
 * EventBridge rule, which Start/StopDiscoverer flip behind the scenes), and
 * the runtime half injects the `DiscovererId` into every request.
 */
export declare const makeSchemasDiscovererHttpBinding: <I extends {
    DiscovererId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Schemas.StartDiscoverer`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the discoverer ARN. */
    actions: readonly string[];
    /**
     * EventBridge actions granted on the discoverer's managed rule
     * (`rule/{busName}/Schemas-{discovererId}`). StartDiscoverer enables the
     * rule and StopDiscoverer disables it, so they additionally require
     * `events:EnableRule` / `events:DisableRule`.
     */
    ruleActions?: readonly string[];
}) => Effect.Effect<(discoverer: Discoverer) => Effect.Effect<(request?: Omit<I, "DiscovererId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Schemas operation (e.g.
 * `GetDiscoveredSchema`, which infers a schema from sample events and is not
 * scoped to any registry or schema resource). The deploy-time half grants
 * `actions` on `*`.
 */
export declare const makeSchemasAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Schemas.GetDiscoveredSchema`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map