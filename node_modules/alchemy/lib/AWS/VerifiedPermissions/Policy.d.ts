import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Identifies a Cedar entity, e.g.
 * `{ entityType: "PhotoApp::User", entityId: "alice" }`.
 */
export interface EntityIdentifier {
    /** The Cedar entity type, e.g. `PhotoApp::User`. */
    entityType: string;
    /** The entity ID, e.g. `alice`. */
    entityId: string;
}
export interface PolicyProps {
    /**
     * The ID of the policy store the policy belongs to. Changing the store
     * replaces the policy.
     */
    policyStoreId: string;
    /**
     * The Cedar policy statement for a **static** policy, e.g.
     * `permit(principal, action == Action::"view", resource);`. Mutable —
     * updating re-submits the statement via `UpdatePolicy` (only annotations
     * and conditions may change; the principal/resource scope is fixed).
     *
     * Exactly one of `statement` (static) or `templateId` (template-linked)
     * must be provided.
     */
    statement?: string;
    /**
     * An optional description stored alongside a static policy statement.
     */
    description?: string;
    /**
     * The ID of a {@link PolicyTemplate} to instantiate as a
     * **template-linked** policy. Template-linked policies cannot be updated
     * in place — changing `templateId`, `principal`, or `resource` replaces
     * the policy (the template itself is the mutable part).
     */
    templateId?: string;
    /**
     * The principal to fill into the template's `?principal` placeholder.
     * Only valid with `templateId`.
     */
    principal?: EntityIdentifier;
    /**
     * The resource to fill into the template's `?resource` placeholder.
     * Only valid with `templateId`.
     */
    resource?: EntityIdentifier;
}
export interface Policy extends Resource<"AWS.VerifiedPermissions.Policy", PolicyProps, {
    /**
     * ID of the policy store the policy belongs to.
     */
    policyStoreId: string;
    /**
     * Service-assigned unique ID of the policy within the store.
     */
    policyId: string;
}, {}, Providers> {
}
/**
 * A static Cedar policy in a Verified Permissions policy store. Static
 * policies contain a complete Cedar statement and are evaluated for every
 * matching authorization request.
 * ### Creating Policies
 * **Example:** Permit a Specific Principal
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * yield* AWS.VerifiedPermissions.Policy("AllowAlice", {
 *   policyStoreId: store.policyStoreId,
 *   statement: `permit(
 *     principal == PhotoApp::User::"alice",
 *     action == PhotoApp::Action::"viewPhoto",
 *     resource
 *   );`,
 *   description: "Alice can view any photo",
 * });
 * ```
 *
 * ### Template-Linked Policies
 * **Example:** Instantiate a Policy Template for a Principal
 * ```typescript
 * const template = yield* AWS.VerifiedPermissions.PolicyTemplate("ViewPhoto", {
 *   policyStoreId: store.policyStoreId,
 *   statement: `permit(
 *     principal == ?principal,
 *     action == PhotoApp::Action::"viewPhoto",
 *     resource
 *   );`,
 * });
 *
 * yield* AWS.VerifiedPermissions.Policy("AliceCanView", {
 *   policyStoreId: store.policyStoreId,
 *   templateId: template.policyTemplateId,
 *   principal: { entityType: "PhotoApp::User", entityId: "alice" },
 * });
 * ```
 *
 * @resource
 */
export declare const Policy: import("../../Resource.ts").ResourceClass<Policy>;
export declare const PolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<Policy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Policy.d.ts.map