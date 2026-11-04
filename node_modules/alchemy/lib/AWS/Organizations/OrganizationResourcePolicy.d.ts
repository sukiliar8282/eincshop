import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
export interface OrganizationResourcePolicyProps {
    /**
     * Typed resource policy document for the organization.
     */
    document: PolicyDocument;
}
export interface OrganizationResourcePolicy extends Resource<"AWS.Organizations.OrganizationResourcePolicy", OrganizationResourcePolicyProps, {
    /**
     * ID of the resource policy.
     */
    resourcePolicyId: string;
    /**
     * ARN of the resource policy.
     */
    resourcePolicyArn: string;
    /**
     * Parsed resource policy document as stored by AWS Organizations.
     */
    document: PolicyDocument;
}, never, Providers> {
}
/**
 * The singleton AWS Organizations resource policy — an org-level
 * resource-based policy that grants other principals (typically delegated
 * administrator accounts) permission to call Organizations APIs.
 *
 * There is at most one per organization; Alchemy adopts and reconciles the
 * existing policy if one is already in place.
 * ### Setting the Resource Policy
 * **Example:** Allow a Member Account to Describe the Organization
 * ```typescript
 * const security = yield* Account("Security", {
 *   name: "security",
 *   email: "aws-security@example.com",
 *   parentId: root.rootId,
 * });
 *
 * yield* OrganizationResourcePolicy("OrgResourcePolicy", {
 *   document: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: security.accountId },
 *         Action: [
 *           "organizations:DescribeOrganization",
 *           "organizations:ListAccounts",
 *         ],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const OrganizationResourcePolicy: import("../../Resource.ts").ResourceClass<OrganizationResourcePolicy>;
export declare const OrganizationResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<OrganizationResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=OrganizationResourcePolicy.d.ts.map