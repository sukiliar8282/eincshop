import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The category of alternate contact. Each account has at most one contact of
 * each type.
 */
export type AlternateContactType = "BILLING" | "OPERATIONS" | "SECURITY";
export interface AlternateContactProps {
    /**
     * Which alternate contact slot to set: `BILLING`, `OPERATIONS`, or
     * `SECURITY`. Each account holds at most one contact per type; changing the
     * type replaces the resource.
     */
    alternateContactType: AlternateContactType;
    /** Name of the alternate contact. */
    name: string;
    /** Title of the alternate contact. */
    title: string;
    /** Email address of the alternate contact. */
    emailAddress: string;
    /** Phone number of the alternate contact. */
    phoneNumber: string;
    /**
     * Account ID to operate on. Only usable from an Organizations management or
     * delegated-admin account with trusted access enabled; omit to target the
     * calling account.
     */
    accountId?: string;
}
export interface AlternateContact extends Resource<"AWS.Account.AlternateContact", AlternateContactProps, {
    alternateContactType: AlternateContactType;
    name: string;
    title: string;
    emailAddress: string;
    phoneNumber: string;
}, never, Providers> {
}
/**
 * An alternate contact for an AWS account. AWS accounts support one alternate
 * contact for each of the `BILLING`, `OPERATIONS`, and `SECURITY` categories.
 * These are account-global singletons: setting one overwrites any existing
 * contact of the same type, and deleting removes it entirely.
 *
 * ### Setting an Alternate Contact
 * **Example:** Operations Contact
 * ```typescript
 * const contact = yield* AlternateContact("OpsContact", {
 *   alternateContactType: "OPERATIONS",
 *   name: "Ops Team",
 *   title: "On-Call Engineer",
 *   emailAddress: "ops@example.com",
 *   phoneNumber: "+15555550123",
 * });
 * ```
 *
 * **Example:** Billing Contact for an Organizations Member Account
 * ```typescript
 * const contact = yield* AlternateContact("BillingContact", {
 *   alternateContactType: "BILLING",
 *   name: "Finance",
 *   title: "AP Clerk",
 *   emailAddress: "ap@example.com",
 *   phoneNumber: "+15555550124",
 *   accountId: "123456789012",
 * });
 * ```
 *
 * @resource
 */
export declare const AlternateContact: import("../../Resource.ts").ResourceClass<AlternateContact>;
export declare const AlternateContactProvider: () => import("effect/Layer").Layer<Provider.Provider<AlternateContact>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AlternateContact.d.ts.map