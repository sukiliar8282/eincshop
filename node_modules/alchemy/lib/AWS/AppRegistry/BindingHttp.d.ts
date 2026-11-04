import * as Effect from "effect/Effect";
import type { Application } from "./Application.ts";
import type { AttributeGroup } from "./AttributeGroup.ts";
/**
 * Shared scaffolding for AppRegistry HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the three
 * builders below. Everything except the operation, the IAM action list, and
 * the injected identifier is boilerplate.
 *
 * AppRegistry IAM actions live under the `servicecatalog:` service prefix.
 */
/**
 * Build the impl Effect for an application-scoped operation: the runtime
 * callable injects the bound {@link Application}'s ID as `application` and
 * the deploy-time half grants `actions` on the application ARN.
 */
export declare const makeApplicationScopedHttpBinding: <I extends {
    application: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AppRegistry.GetApplication`. */
    tag: string;
    /** The distilled operation; `application` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the application ARN. */
    actions: readonly string[];
}) => Effect.Effect<(application: Application) => Effect.Effect<(request?: Omit<I, "application"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an attribute-group-scoped operation: the runtime
 * callable injects the bound {@link AttributeGroup}'s ID as `attributeGroup`
 * and the deploy-time half grants `actions` on the attribute group ARN.
 */
export declare const makeAttributeGroupScopedHttpBinding: <I extends {
    attributeGroup: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AppRegistry.GetAttributeGroup`. */
    tag: string;
    /** The distilled operation; `attributeGroup` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the attribute group ARN. */
    actions: readonly string[];
}) => Effect.Effect<(attributeGroup: AttributeGroup) => Effect.Effect<(request?: Omit<I, "attributeGroup"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (no target resource).
 * The deploy-time half grants `actions` on `*`.
 */
export declare const makeAppRegistryAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.AppRegistry.SyncResource`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map