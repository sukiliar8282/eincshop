import * as Effect from "effect/Effect";
import type { LicenseConfiguration } from "./LicenseConfiguration.ts";
/**
 * Shared HTTP scaffolding for the AWS License Manager runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action, and (for the
 * configuration-scoped builder) the injected ARN is boilerplate.
 *
 * Per the `license-manager` service authorization reference, only the
 * `license-configuration` resource type supports resource-level scoping;
 * every other action (the checkout data plane, license/grant reads, the
 * resource inventory) authorizes on `Resource: ["*"]`.
 */
/**
 * Build the impl Effect for an account-level License Manager operation (the
 * license checkout data plane, license/grant reads, resource inventory, and
 * license-specification operations — none of which are resource-scoped in
 * IAM).
 */
export declare const makeLicenseManagerHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"CheckoutLicense"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a License Manager operation scoped to one
 * {@link LicenseConfiguration}: the deploy-time half grants `iamActions` on
 * the bound configuration's ARN (the `license-configuration` resource type
 * supports resource-level authorization), and the runtime half injects the
 * configuration's ARN as the request's `LicenseConfigurationArn`.
 */
export declare const makeLicenseConfigurationHttpBinding: <I extends {
    LicenseConfigurationArn?: string;
}, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListUsageForLicenseConfiguration"`.
     */
    capability: string;
    /** IAM actions granted on the bound configuration's ARN. */
    iamActions: readonly string[];
    /** The distilled operation; `LicenseConfigurationArn` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(configuration: LicenseConfiguration) => Effect.Effect<(request?: Omit<I, "LicenseConfigurationArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map