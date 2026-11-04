import * as organizations from "@distilled.cloud/aws/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RootPolicyTypeProps {
    /**
     * Root that owns the enabled policy type.
     */
    rootId: string;
    /**
     * Policy type to enable on the root.
     */
    policyType: organizations.PolicyType;
}
export interface RootPolicyType extends Resource<"AWS.Organizations.RootPolicyType", RootPolicyTypeProps, {
    /**
     * ID of the root the policy type is enabled on.
     */
    rootId: string;
    /**
     * ARN of the root.
     */
    rootArn: string | undefined;
    /**
     * The enabled policy type.
     */
    policyType: organizations.PolicyType;
    /**
     * Enablement status (`ENABLED`, `PENDING_ENABLE`, or `PENDING_DISABLE`).
     */
    status: organizations.PolicyTypeStatus | undefined;
}, never, Providers> {
}
/**
 * Enables a policy type on an organization root.
 *
 * A policy type (SCP, tag policy, ...) must be enabled on the root before any
 * {@link Policy} of that type can be attached via {@link PolicyAttachment}.
 * Existence-only resource: changing `rootId` or `policyType` replaces it.
 * ### Enabling Policy Types
 * **Example:** Enable Service Control Policies
 * ```typescript
 * const root = yield* Root("Root", {});
 *
 * const scpEnabled = yield* RootPolicyType("ScpEnabled", {
 *   rootId: root.rootId,
 *   policyType: "SERVICE_CONTROL_POLICY",
 * });
 * ```
 *
 * **Example:** Enable Tag Policies Before Attaching One
 * ```typescript
 * const tagPoliciesEnabled = yield* RootPolicyType("TagPoliciesEnabled", {
 *   rootId: root.rootId,
 *   policyType: "TAG_POLICY",
 * });
 *
 * yield* PolicyAttachment("RequireEnvTagOnRoot", {
 *   policyId: tagPolicy.policyId,
 *   // depend on the enablement so attachment happens after it
 *   targetId: tagPoliciesEnabled.rootId,
 * });
 * ```
 *
 * @resource
 */
export declare const RootPolicyType: import("../../Resource.ts").ResourceClass<RootPolicyType>;
export declare const RootPolicyTypeProvider: () => import("effect/Layer").Layer<Provider.Provider<RootPolicyType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=RootPolicyType.d.ts.map