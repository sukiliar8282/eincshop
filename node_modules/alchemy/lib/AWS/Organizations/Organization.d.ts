import * as organizations from "@distilled.cloud/aws/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type OrganizationId = string;
export type OrganizationArn = string;
export interface OrganizationProps {
    /**
     * Organization feature set.
     * `ALL` unlocks the full AWS Organizations feature set.
     * @default "ALL"
     */
    featureSet?: organizations.OrganizationFeatureSet;
}
export interface Organization extends Resource<"AWS.Organizations.Organization", OrganizationProps, {
    /**
     * ID of the organization (e.g. `o-exampleorgid`).
     */
    organizationId: OrganizationId;
    /**
     * ARN of the organization.
     */
    organizationArn: OrganizationArn;
    /**
     * Feature set enabled on the organization (`ALL` or
     * `CONSOLIDATED_BILLING`).
     */
    featureSet: organizations.OrganizationFeatureSet | undefined;
    /**
     * ARN of the management account.
     */
    managementAccountArn: string | undefined;
    /**
     * 12-digit ID of the management account.
     */
    managementAccountId: string | undefined;
    /**
     * Email address of the management account.
     */
    managementAccountEmail: string | undefined;
    /**
     * Policy types available to the organization.
     */
    availablePolicyTypes: organizations.PolicyTypeSummary[];
}, never, Providers> {
}
/**
 * The AWS Organization for the current management account.
 *
 * This is a singleton-style resource. If an organization already exists,
 * Alchemy adopts and reconciles it instead of creating a second one.
 * ### Creating An Organization
 * **Example:** Full Features Organization
 * ```typescript
 * const organization = yield* Organization("Org", {
 *   featureSet: "ALL",
 * });
 * ```
 *
 * @resource
 */
export declare const Organization: import("../../Resource.ts").ResourceClass<Organization>;
export declare const OrganizationProvider: () => import("effect/Layer").Layer<Provider.Provider<Organization>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Organization.d.ts.map