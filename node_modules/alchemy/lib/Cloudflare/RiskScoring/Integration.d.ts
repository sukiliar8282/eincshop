import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.RiskScoring.Integration";
type TypeId = typeof TypeId;
export interface IntegrationProps {
    /**
     * The third-party SOAR/SSF consumer of risk-score changes. Only
     * `Okta` is supported by the API today.
     * @default "Okta"
     */
    integrationType?: "Okta";
    /**
     * The base URL of the tenant that receives risk-score changes, e.g.
     * `https://tenant.okta.com`. Mutable — updated in place via PUT.
     */
    tenantUrl: string;
    /**
     * A reference id supplied by the client. Cloudflare recommends setting
     * it to the Access-Okta identity provider ID (a UUIDv4) so the
     * integration can be recalled by that secondary asset.
     */
    referenceId?: string;
    /**
     * Whether the integration exports risk-score changes to the
     * third-party. Only togglable after create (the create API always
     * provisions an active integration).
     * @default true
     */
    active?: boolean;
}
export type IntegrationAttributes = {
    /** API UUID of the integration. */
    integrationId: string;
    /** Account that owns the integration. */
    accountId: string;
    /** The third-party consumer of risk-score changes. */
    integrationType: "Okta" | (string & {});
    /** Observed tenant base URL. */
    tenantUrl: string;
    /** Observed client-supplied reference id. */
    referenceId: string;
    /** Whether risk-score changes are exported. */
    active: boolean;
    /** The Shared Signals Framework configuration URL. */
    wellKnownUrl: string;
    /** RFC 3339 timestamp of when the integration was created. */
    createdAt: string;
};
export type Integration = Resource<TypeId, IntegrationProps, IntegrationAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **risk scoring integration** — a Shared
 * Signals Framework (SSF) push integration that exports user risk-score
 * changes to a third-party tenant (currently Okta) so the IdP can react
 * to risky behavior detected by Zero Trust.
 *
 * Requires the Zero Trust risk-scoring entitlement (an Enterprise
 * feature); accounts without it receive the typed `Forbidden` error on
 * all writes.
 * ### Creating a risk scoring integration
 * **Example:** Push risk scores to an Okta tenant
 * ```typescript
 * const okta = yield* Cloudflare.RiskScoring.Integration("OktaSsf", {
 *   tenantUrl: "https://tenant.okta.com",
 *   referenceId: oktaIdp.identityProviderId,
 * });
 * ```
 *
 * **Example:** Pause exporting without deleting
 * ```typescript
 * const okta = yield* Cloudflare.RiskScoring.Integration("OktaSsf", {
 *   tenantUrl: "https://tenant.okta.com",
 *   active: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/insights/risk-score/
 *
 * @resource
 * @product Risk Scoring
 * @category Cloudflare One (Zero Trust)
 */
export declare const Integration: import("../../Resource.ts").ResourceClass<Integration>;
/**
 * Returns true if the given value is a Integration resource.
 */
export declare const isIntegration: (value: unknown) => value is Integration;
export declare const IntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<Integration>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Integration.d.ts.map