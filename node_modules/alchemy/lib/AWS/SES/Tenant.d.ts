import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { SuppressionListReason } from "./ConfigurationSet.ts";
/**
 * The scope of the tenant's suppression list: `ACCOUNT` shares the
 * account-level suppression list, `TENANT` maintains a separate list scoped to
 * this tenant.
 */
export type SuppressionListScope = sesv2.SuppressionListScope;
export interface TenantSuppressionSettings {
    /**
     * The bounce/complaint reasons for which SES adds destinations to the
     * tenant's suppression list.
     */
    reasons: SuppressionListReason[];
    /**
     * Whether the tenant uses the account-level suppression list (`ACCOUNT`) or
     * maintains its own tenant-scoped list (`TENANT`).
     */
    scope: SuppressionListScope;
}
export interface TenantProps {
    /**
     * Name of the tenant. If omitted, a deterministic physical name is generated
     * from the app, stage, and logical ID. Changing the name replaces the
     * tenant.
     */
    tenantName?: string;
    /**
     * The tenant's suppression list configuration, synced in place via
     * `putTenantSuppressionAttributes`. Leave undefined to keep SES's current
     * setting.
     *
     * `reasons` and `scope` are both required together: SES rejects a
     * suppression update carrying only one of them
     * (`BadRequestException: SuppressedReasons cannot be specified without
     * SuppressionScope`, and vice versa).
     */
    suppression?: TenantSuppressionSettings;
    /**
     * Tags to apply to the tenant. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Tenant extends Resource<"AWS.SES.Tenant", TenantProps, {
    /** Name of the tenant. */
    tenantName: string;
    /** Opaque tenant identifier assigned by SES. */
    tenantId: string;
    /** ARN of the tenant. */
    tenantArn: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 tenant — a logical container that groups related SES
 * resources (email identities, configuration sets, templates) together, each
 * with its own reputation metrics, sending status, and optional
 * tenant-scoped suppression list. Useful for isolating email sending across
 * customers or business units within a single SES account.
 *
 * Associate resources with a tenant using `SES.TenantResourceAssociation`.
 * Deleting the tenant removes its resource associations but leaves the
 * underlying resources in place.
 * ### Creating Tenants
 * **Example:** Basic Tenant
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const tenant = yield* SES.Tenant("CustomerA", {});
 * ```
 *
 * **Example:** Tenant with a Scoped Suppression List
 * ```typescript
 * // SES requires the reasons and the scope together, so they travel as one
 * // prop rather than two independently-optional ones.
 * const tenant = yield* SES.Tenant("CustomerA", {
 *   suppression: { reasons: ["BOUNCE", "COMPLAINT"], scope: "TENANT" },
 * });
 * ```
 *
 * **Example:** Tenant with Tags
 * ```typescript
 * const tenant = yield* SES.Tenant("CustomerA", {
 *   tags: { Customer: "acme", CostCenter: "growth" },
 * });
 * ```
 *
 * ### Associating Resources
 * **Example:** Give the Tenant an Identity, Config Set, and Template
 * ```typescript
 * const tenant = yield* SES.Tenant("CustomerA", {});
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "mail.acme.example.com",
 * });
 * const configSet = yield* SES.ConfigurationSet("AcmeTracking", {});
 *
 * // A resource must be associated before the tenant can send with it.
 * yield* SES.TenantResourceAssociation("AcmeIdentity", {
 *   tenantName: tenant.tenantName,
 *   resourceArn: identity.identityArn,
 * });
 * yield* SES.TenantResourceAssociation("AcmeConfigSet", {
 *   tenantName: tenant.tenantName,
 *   resourceArn: configSet.configurationSetArn,
 * });
 * ```
 *
 * ### Tenant Suppression Lists
 * **Example:** Read and Write the Tenant's Own Suppression List
 * ```typescript
 * // With scope "TENANT" the list is separate from the account's.
 * const tenant = yield* SES.Tenant("CustomerA", {
 *   suppression: { reasons: ["BOUNCE", "COMPLAINT"], scope: "TENANT" },
 * });
 *
 * // init — account-level bindings, scoped per call via TenantName
 * const suppress = yield* SES.PutSuppressedDestination();
 * const listSuppressed = yield* SES.ListSuppressedDestinations();
 *
 * // runtime
 * yield* suppress({
 *   EmailAddress: "hard-bounce@example.com",
 *   Reason: "BOUNCE",
 *   TenantName: yield* tenant.tenantName,
 * });
 * const { SuppressedDestinationSummaries } = yield* listSuppressed({
 *   TenantName: yield* tenant.tenantName,
 * });
 * ```
 *
 * @resource
 */
export declare const Tenant: import("../../Resource.ts").ResourceClass<Tenant>;
export declare const TenantProvider: () => import("effect/Layer").Layer<Provider.Provider<Tenant>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Tenant.d.ts.map