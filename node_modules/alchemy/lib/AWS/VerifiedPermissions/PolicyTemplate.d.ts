import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PolicyTemplateProps {
    /**
     * The ID of the policy store the template belongs to. Changing the store
     * replaces the template.
     */
    policyStoreId: string;
    /**
     * The Cedar policy-template statement. Templates use the `?principal` and
     * `?resource` placeholders which are filled in when a template-linked
     * policy is created, e.g.
     * `permit(principal == ?principal, action == PhotoApp::Action::"viewPhoto", resource);`.
     * Mutable — updating re-submits the statement via `UpdatePolicyTemplate`.
     */
    statement: string;
    /**
     * An optional description stored alongside the template statement.
     */
    description?: string;
}
export interface PolicyTemplate extends Resource<"AWS.VerifiedPermissions.PolicyTemplate", PolicyTemplateProps, {
    /**
     * ID of the policy store the template belongs to.
     */
    policyStoreId: string;
    /**
     * Service-assigned unique ID of the policy template within the store —
     * pass it as the `templateId` of a template-linked {@link Policy}.
     */
    policyTemplateId: string;
}, {}, Providers> {
}
/**
 * A Cedar policy template in a Verified Permissions policy store. Templates
 * contain `?principal` / `?resource` placeholders; template-linked policies
 * instantiate the template for a concrete principal and resource, and every
 * linked policy automatically picks up template updates.
 * ### Creating Policy Templates
 * **Example:** Template with a Principal Placeholder
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * const template = yield* AWS.VerifiedPermissions.PolicyTemplate("ViewPhoto", {
 *   policyStoreId: store.policyStoreId,
 *   statement: `permit(
 *     principal == ?principal,
 *     action == PhotoApp::Action::"viewPhoto",
 *     resource
 *   );`,
 *   description: "Grant a user access to view photos",
 * });
 * ```
 *
 * **Example:** Link a Policy to the Template
 * ```typescript
 * yield* AWS.VerifiedPermissions.Policy("AliceCanView", {
 *   policyStoreId: store.policyStoreId,
 *   templateId: template.policyTemplateId,
 *   principal: { entityType: "PhotoApp::User", entityId: "alice" },
 * });
 * ```
 *
 * @resource
 */
export declare const PolicyTemplate: import("../../Resource.ts").ResourceClass<PolicyTemplate>;
export declare const PolicyTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<PolicyTemplate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PolicyTemplate.d.ts.map