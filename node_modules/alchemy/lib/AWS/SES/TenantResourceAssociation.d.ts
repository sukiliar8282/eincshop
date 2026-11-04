import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TenantResourceAssociationProps {
    /**
     * Name of the tenant to associate the resource with. Typically the
     * `tenantName` output of a `SES.Tenant`. Changing it replaces the
     * association.
     */
    tenantName: string;
    /**
     * ARN of the resource to associate — an email identity, configuration set,
     * or email template. Changing it replaces the association.
     */
    resourceArn: string;
}
export interface TenantResourceAssociation extends Resource<"AWS.SES.TenantResourceAssociation", TenantResourceAssociationProps, {
    /** Name of the tenant. */
    tenantName: string;
    /** ARN of the associated resource. */
    resourceArn: string;
}, never, Providers> {
}
/**
 * An association between an Amazon SES v2 tenant and a resource — an email
 * identity, configuration set, or email template. Once associated, the
 * resource can be used when sending email on behalf of the tenant. A single
 * resource can be associated with multiple tenants.
 *
 * This is an existence-only link with no mutable properties: changing either
 * the tenant or the resource replaces the association.
 * ### Associating Resources
 * **Example:** Associate an Email Identity with a Tenant
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const tenant = yield* SES.Tenant("CustomerA", {});
 * const identity = yield* SES.EmailIdentity("Sender", {
 *   emailIdentity: "sender@example.com",
 * });
 * const association = yield* SES.TenantResourceAssociation("SenderLink", {
 *   tenantName: tenant.tenantName,
 *   resourceArn: identity.identityArn,
 * });
 * ```
 *
 * **Example:** Associate a Configuration Set
 * ```typescript
 * const configSet = yield* SES.ConfigurationSet("AcmeTracking", {});
 * yield* SES.TenantResourceAssociation("ConfigSetLink", {
 *   tenantName: tenant.tenantName,
 *   resourceArn: configSet.configurationSetArn,
 * });
 * ```
 *
 * **Example:** Associate an Email Template
 * ```typescript
 * const template = yield* SES.EmailTemplate("Welcome", {
 *   subject: "Welcome, {{name}}!",
 *   text: "Thanks for signing up, {{name}}.",
 * });
 * yield* SES.TenantResourceAssociation("TemplateLink", {
 *   tenantName: tenant.tenantName,
 *   resourceArn: template.templateArn,
 * });
 * ```
 *
 * **Example:** Share One Identity Across Two Tenants
 * ```typescript
 * // A resource can belong to any number of tenants.
 * const acme = yield* SES.Tenant("Acme", {});
 * const globex = yield* SES.Tenant("Globex", {});
 *
 * yield* SES.TenantResourceAssociation("AcmeSender", {
 *   tenantName: acme.tenantName,
 *   resourceArn: identity.identityArn,
 * });
 * yield* SES.TenantResourceAssociation("GlobexSender", {
 *   tenantName: globex.tenantName,
 *   resourceArn: identity.identityArn,
 * });
 * ```
 *
 * @resource
 */
export declare const TenantResourceAssociation: import("../../Resource.ts").ResourceClass<TenantResourceAssociation>;
export declare const TenantResourceAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<TenantResourceAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TenantResourceAssociation.d.ts.map