import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ContactInformationProps {
    /** Full name of the primary contact. */
    fullName: string;
    /** First line of the primary contact's mailing address. */
    addressLine1: string;
    /** Second line of the mailing address, if any. */
    addressLine2?: string;
    /** Third line of the mailing address, if any. */
    addressLine3?: string;
    /** City of the primary contact address. */
    city: string;
    /** State or region of the primary contact address, if applicable. */
    stateOrRegion?: string;
    /** District or county of the primary contact address, if applicable. */
    districtOrCounty?: string;
    /** Postal code of the primary contact address. */
    postalCode: string;
    /** ISO-3166 two-letter country code of the primary contact address. */
    countryCode: string;
    /** Phone number of the primary contact. */
    phoneNumber: string;
    /** Company name associated with the primary contact, if any. */
    companyName?: string;
    /** Website URL associated with the primary contact, if any. */
    websiteUrl?: string;
    /**
     * Account ID to operate on. Only usable from an Organizations management or
     * delegated-admin account with trusted access enabled; omit to target the
     * calling account.
     */
    accountId?: string;
}
export interface ContactInformation extends Resource<"AWS.Account.ContactInformation", ContactInformationProps, {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    city: string;
    stateOrRegion?: string;
    districtOrCounty?: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    companyName?: string;
    websiteUrl?: string;
}, never, Providers> {
}
/**
 * The primary contact information of an AWS account — the account-global
 * mailing address and phone number AWS uses to reach the account owner. Every
 * account has exactly one primary contact; this resource upserts it via
 * `account:PutContactInformation`. AWS does not allow deleting the primary
 * contact, so destroying the resource stops managing it and leaves the last
 * value in place.
 *
 * ### Setting the Primary Contact
 * **Example:** Primary Contact for the Calling Account
 * ```typescript
 * const contact = yield* ContactInformation("PrimaryContact", {
 *   fullName: "Jane Doe",
 *   addressLine1: "123 Any Street",
 *   city: "Seattle",
 *   stateOrRegion: "WA",
 *   postalCode: "98101",
 *   countryCode: "US",
 *   phoneNumber: "+12065551234",
 *   companyName: "Acme Corp",
 *   websiteUrl: "https://acme.example.com",
 * });
 * ```
 *
 * **Example:** Primary Contact for an Organizations Member Account
 * ```typescript
 * const contact = yield* ContactInformation("MemberContact", {
 *   fullName: "Acme Ops",
 *   addressLine1: "123 Any Street",
 *   city: "Seattle",
 *   postalCode: "98101",
 *   countryCode: "US",
 *   phoneNumber: "+12065551234",
 *   accountId: "123456789012",
 * });
 * ```
 *
 * @resource
 */
export declare const ContactInformation: import("../../Resource.ts").ResourceClass<ContactInformation>;
export declare const ContactInformationProvider: () => import("effect/Layer").Layer<Provider.Provider<ContactInformation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ContactInformation.d.ts.map