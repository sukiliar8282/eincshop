import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DelegatedAdministratorProps {
    /**
     * Member account registered as delegated administrator.
     */
    accountId: string;
    /**
     * Service principal delegated to the account.
     */
    servicePrincipal: string;
}
export interface DelegatedAdministrator extends Resource<"AWS.Organizations.DelegatedAdministrator", DelegatedAdministratorProps, {
    /**
     * 12-digit ID of the delegated administrator account.
     */
    accountId: string;
    /**
     * ARN of the delegated administrator account.
     */
    accountArn: string | undefined;
    /**
     * Friendly name of the delegated administrator account.
     */
    accountName: string | undefined;
    /**
     * Email address of the delegated administrator account.
     */
    accountEmail: string | undefined;
    /**
     * Service principal delegated to the account.
     */
    servicePrincipal: string;
    /**
     * When the delegation was enabled.
     */
    delegationEnabledDate: Date | undefined;
}, never, Providers> {
}
/**
 * Registers a member {@link Account} as the delegated administrator for a
 * trusted AWS service, letting that account manage the service org-wide
 * instead of the management account.
 *
 * Requires trusted access for the same service principal (see
 * {@link TrustedServiceAccess}). Existence-only resource: changing
 * `accountId` or `servicePrincipal` replaces the registration.
 * ### Delegating Administration
 * **Example:** Delegate GuardDuty to a Security Account
 * ```typescript
 * const security = yield* Account("Security", {
 *   name: "security",
 *   email: "aws-security@example.com",
 *   parentId: root.rootId,
 * });
 *
 * const guardDutyAccess = yield* TrustedServiceAccess("GuardDutyAccess", {
 *   servicePrincipal: "guardduty.amazonaws.com",
 * });
 *
 * yield* DelegatedAdministrator("GuardDutyAdmin", {
 *   accountId: security.accountId,
 *   servicePrincipal: guardDutyAccess.servicePrincipal,
 * });
 * ```
 *
 * @resource
 */
export declare const DelegatedAdministrator: import("../../Resource.ts").ResourceClass<DelegatedAdministrator>;
export declare const DelegatedAdministratorProvider: () => import("effect/Layer").Layer<Provider.Provider<DelegatedAdministrator>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DelegatedAdministrator.d.ts.map