import * as organizations from "@distilled.cloud/aws/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PolicyAttachmentProps {
    /**
     * Policy to attach.
     */
    policyId: string;
    /**
     * Target root, OU, or account ID.
     */
    targetId: string;
}
export interface PolicyAttachment extends Resource<"AWS.Organizations.PolicyAttachment", PolicyAttachmentProps, {
    /**
     * ID of the attached policy.
     */
    policyId: string;
    /**
     * ID of the root, OU, or account the policy is attached to.
     */
    targetId: string;
    /**
     * ARN of the attachment target.
     */
    targetArn: string | undefined;
    /**
     * Friendly name of the attachment target.
     */
    targetName: string | undefined;
    /**
     * Kind of the attachment target (`ROOT`, `ORGANIZATIONAL_UNIT`, or
     * `ACCOUNT`).
     */
    targetType: organizations.TargetType | undefined;
}, never, Providers> {
}
/**
 * Attaches an Organizations {@link Policy} to a root, OU, or account.
 *
 * Existence-only resource: changing either `policyId` or `targetId` replaces
 * the attachment. The policy's type must already be enabled on the root (see
 * {@link RootPolicyType}).
 * ### Attaching Policies
 * **Example:** Attach an SCP to an Organizational Unit
 * ```typescript
 * const workloads = yield* OrganizationalUnit("Workloads", {
 *   parentId: root.rootId,
 *   name: "workloads",
 * });
 *
 * const denyRegions = yield* Policy("DenyOtherRegions", {
 *   type: "SERVICE_CONTROL_POLICY",
 *   document: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Deny",
 *         NotAction: ["iam:*", "organizations:*", "sts:*"],
 *         Resource: "*",
 *         Condition: {
 *           StringNotEquals: { "aws:RequestedRegion": ["us-east-1", "us-west-2"] },
 *         },
 *       },
 *     ],
 *   },
 * });
 *
 * yield* PolicyAttachment("DenyRegionsOnWorkloads", {
 *   policyId: denyRegions.policyId,
 *   targetId: workloads.ouId,
 * });
 * ```
 *
 * **Example:** Attach a Policy to a Member Account
 * ```typescript
 * yield* PolicyAttachment("DenyRegionsOnDev", {
 *   policyId: denyRegions.policyId,
 *   targetId: devAccount.accountId,
 * });
 * ```
 *
 * @resource
 */
export declare const PolicyAttachment: import("../../Resource.ts").ResourceClass<PolicyAttachment>;
export declare const PolicyAttachmentProvider: () => import("effect/Layer").Layer<Provider.Provider<PolicyAttachment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PolicyAttachment.d.ts.map