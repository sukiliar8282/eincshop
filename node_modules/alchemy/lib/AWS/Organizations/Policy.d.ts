import * as organizations from "@distilled.cloud/aws/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { ServiceControlPolicyDocument } from "../IAM/Policy.ts";
export type PolicyId = string;
export type PolicyArn = string;
export interface PolicyProps {
    /**
     * Policy name. If omitted, Alchemy generates one.
     */
    name?: string;
    /**
     * Policy description.
     * @default ""
     */
    description?: string;
    /**
     * Organizations policy type.
     */
    type: organizations.PolicyType;
    /**
     * Policy content. For `SERVICE_CONTROL_POLICY` / `RESOURCE_CONTROL_POLICY`
     * pass a typed {@link ServiceControlPolicyDocument} (the SCP-legal IAM
     * dialect — no `Principal`/`NotPrincipal`). Other policy types (tag,
     * backup, AI-services opt-out, ...) use their own JSON grammars — pass
     * them as a raw JSON `string`. The string form also serves as the
     * escape hatch for adopted or hand-authored documents.
     */
    document: ServiceControlPolicyDocument | string;
    /**
     * Optional tags applied to the policy.
     */
    tags?: Record<string, string>;
}
export interface Policy extends Resource<"AWS.Organizations.Policy", PolicyProps, {
    /**
     * ID of the policy (e.g. `p-examplepolicyid`).
     */
    policyId: PolicyId;
    /**
     * ARN of the policy.
     */
    policyArn: PolicyArn;
    /**
     * Policy name.
     */
    name: string;
    /**
     * Policy description.
     */
    description: string | undefined;
    /**
     * Organizations policy type.
     */
    type: organizations.PolicyType | undefined;
    /**
     * Whether the policy is an AWS-managed policy (e.g. `FullAWSAccess`).
     */
    awsManaged: boolean | undefined;
    /**
     * Parsed policy document as currently stored by AWS Organizations.
     */
    document: ServiceControlPolicyDocument;
    /**
     * Tags on the policy.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Organizations policy such as an SCP or tag policy.
 *
 * Attach it to a root, OU, or account with {@link PolicyAttachment}. Changing
 * `type` or `name` replaces the policy; document and description changes
 * update in place.
 * ### Creating Policies
 * **Example:** Service Control Policy (Typed Document)
 * ```typescript
 * const denyLeaveOrg = yield* Policy("DenyLeaveOrg", {
 *   type: "SERVICE_CONTROL_POLICY",
 *   description: "Prevent member accounts from leaving the organization",
 *   document: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Deny",
 *         Action: ["organizations:LeaveOrganization"],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Tag Policy (Raw JSON)
 * ```typescript
 * const tagPolicy = yield* Policy("RequireEnvTag", {
 *   type: "TAG_POLICY",
 *   document: JSON.stringify({
 *     tags: {
 *       environment: {
 *         tag_key: { "@@assign": "environment" },
 *         tag_value: { "@@assign": ["dev", "staging", "prod"] },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * ### Attaching Policies
 * **Example:** Attach an SCP to the Organization Root
 * ```typescript
 * const root = yield* Root("Root", {});
 *
 * const scpEnabled = yield* RootPolicyType("ScpEnabled", {
 *   rootId: root.rootId,
 *   policyType: "SERVICE_CONTROL_POLICY",
 * });
 *
 * yield* PolicyAttachment("DenyLeaveOrgOnRoot", {
 *   policyId: denyLeaveOrg.policyId,
 *   targetId: scpEnabled.rootId,
 * });
 * ```
 *
 * @resource
 */
export declare const Policy: import("../../Resource.ts").ResourceClass<Policy>;
export declare const PolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<Policy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Policy.d.ts.map