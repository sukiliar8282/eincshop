import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TrustedServiceAccessProps {
    /**
     * Service principal granted trusted access to the organization.
     */
    servicePrincipal: string;
}
export interface TrustedServiceAccess extends Resource<"AWS.Organizations.TrustedServiceAccess", TrustedServiceAccessProps, {
    /**
     * Service principal granted trusted access.
     */
    servicePrincipal: string;
    /**
     * When trusted access was enabled.
     */
    dateEnabled: Date | undefined;
}, never, Providers> {
}
/**
 * Enables trusted access for an AWS service principal, allowing that service
 * to operate across all accounts in the organization.
 *
 * Typically paired with a {@link DelegatedAdministrator} that hands day-to-day
 * administration of the service to a member account. Existence-only resource:
 * changing `servicePrincipal` replaces it.
 * ### Enabling Trusted Access
 * **Example:** Enable IAM Identity Center
 * ```typescript
 * yield* TrustedServiceAccess("SsoTrustedAccess", {
 *   servicePrincipal: "sso.amazonaws.com",
 * });
 * ```
 *
 * **Example:** Trusted Access Plus a Delegated Administrator
 * ```typescript
 * const guardDutyAccess = yield* TrustedServiceAccess("GuardDutyAccess", {
 *   servicePrincipal: "guardduty.amazonaws.com",
 * });
 *
 * yield* DelegatedAdministrator("GuardDutyAdmin", {
 *   accountId: securityAccount.accountId,
 *   servicePrincipal: guardDutyAccess.servicePrincipal,
 * });
 * ```
 *
 * @resource
 */
export declare const TrustedServiceAccess: import("../../Resource.ts").ResourceClass<TrustedServiceAccess>;
export declare const TrustedServiceAccessProvider: () => import("effect/Layer").Layer<Provider.Provider<TrustedServiceAccess>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TrustedServiceAccess.d.ts.map