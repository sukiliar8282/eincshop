import * as pageShield from "@distilled.cloud/cloudflare/page-shield";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.PageShield.Policy";
type TypeId = typeof TypeId;
/**
 * Action a Page Shield policy takes when its expression matches:
 * `allow` blocks everything not covered by the CSP, `log` only reports
 * violations, and `add_reporting_directives` injects report-to /
 * report-uri directives.
 */
export type PolicyAction = "allow" | "log" | "add_reporting_directives";
export interface PolicyProps {
    /**
     * Zone the policy belongs to. Stable — changing the zone triggers a
     * replacement.
     */
    zoneId: string;
    /**
     * Human readable description of the policy. Page Shield policies have
     * no `name` field, so the description doubles as the resource's
     * identity for cold-state recovery. If omitted, a deterministic name
     * is generated from the app, stage, and logical ID. Mutable.
     * @default ${app}-${stage}-${id}
     */
    description?: string;
    /**
     * The action to take when `expression` matches: `allow` (enforce the
     * CSP), `log` (report only), or `add_reporting_directives`. Mutable.
     */
    action: PolicyAction;
    /**
     * Whether the policy is enabled. Mutable.
     * @default true
     */
    enabled?: boolean;
    /**
     * The expression that must match for the policy to be applied, in
     * Cloudflare's Firewall rule expression syntax (e.g.
     * `http.host eq "example.com"`). Mutable.
     */
    expression: string;
    /**
     * The Content Security Policy to apply (e.g. `script-src 'self'`).
     * Mutable.
     */
    value: string;
}
export interface PolicyAttributes {
    /** Auto-assigned identifier of the policy. */
    policyId: string;
    /** Zone the policy belongs to. */
    zoneId: string;
    /** The action taken when the expression matches. */
    action: PolicyAction;
    /** Human readable description of the policy. */
    description: string;
    /** Whether the policy is enabled. */
    enabled: boolean;
    /** The expression that must match for the policy to be applied. */
    expression: string;
    /** The Content Security Policy applied by this policy. */
    value: string;
}
export type Policy = Resource<TypeId, PolicyProps, PolicyAttributes, never, Providers>;
/**
 * A Page Shield policy — a Content Security Policy rule
 * (`/zones/{zone_id}/page_shield/policies`) that is applied when its
 * expression matches a request.
 *
 * Policies let you enforce (or log violations of) a CSP at the edge,
 * positively blocking resources Page Shield hasn't approved. All fields
 * are mutable in place; only the zone forces a replacement.
 *
 * **Entitlement-gated**: CSP policies are an Enterprise add-on. On
 * non-entitled zones, creation fails with the typed `PolicyQuotaExceeded`
 * error ("exceeded the maximum number of rules in the phase
 * http_response_page_shield: 1 out of 0"). Page Shield itself should be
 * enabled on the zone first — see `Cloudflare.PageShield.Settings`.
 * ### Creating a Policy
 * **Example:** Log-only CSP policy
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 * });
 *
 * yield* Cloudflare.PageShield.Policy("LogScripts", {
 *   zoneId: zone.zoneId,
 *   action: "log",
 *   expression: 'http.host eq "example.com"',
 *   value: "script-src 'self'",
 * });
 * ```
 *
 * **Example:** Enforcing CSP policy with a description
 * ```typescript
 * yield* Cloudflare.PageShield.Policy("EnforceScripts", {
 *   zoneId: zone.zoneId,
 *   description: "block third-party scripts on checkout",
 *   action: "allow",
 *   expression: 'starts_with(http.request.uri.path, "/checkout")',
 *   value: "script-src 'self' https://js.stripe.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/page-shield/policies/
 *
 * @resource
 * @product Page Shield
 * @category Application Security
 */
export declare const Policy: import("../../Resource.ts").ResourceClass<Policy>;
/**
 * Returns true if the given value is a Policy resource.
 */
export declare const isPolicy: (value: unknown) => value is Policy;
export declare const PolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<Policy>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | pageShield.CloudflareOpContext>;
export {};
//# sourceMappingURL=Policy.d.ts.map