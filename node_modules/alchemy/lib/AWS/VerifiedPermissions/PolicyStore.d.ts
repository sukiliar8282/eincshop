import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Schema-validation strictness applied to Cedar policies and templates
 * submitted to the store.
 *
 * - `OFF` — no schema validation.
 * - `STRICT` — policies must reference entity types and actions declared in
 *   the store's schema (requires a schema to be present).
 */
export type ValidationMode = "OFF" | "STRICT";
export interface PolicyStoreProps {
    /**
     * The schema-validation mode for the policy store.
     * @default "OFF"
     */
    validationMode?: ValidationMode;
    /**
     * A human-readable description for the policy store.
     */
    description?: string;
    /**
     * When `ENABLED`, the store cannot be deleted until protection is disabled.
     * Leave `DISABLED` for ephemeral / test stores.
     * @default "DISABLED"
     */
    deletionProtection?: "ENABLED" | "DISABLED";
    /**
     * Tags to apply to the policy store. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface PolicyStore extends Resource<"AWS.VerifiedPermissions.PolicyStore", PolicyStoreProps, {
    /**
     * Service-assigned unique ID of the policy store — pass it to
     * {@link Policy}, {@link Schema}, and `IsAuthorized`.
     */
    policyStoreId: string;
    /**
     * ARN of the policy store.
     */
    policyStoreArn: string;
}, {}, Providers> {
}
/**
 * An Amazon Verified Permissions policy store — the container for Cedar
 * policies, policy templates, and a schema. Authorization requests
 * (`IsAuthorized`) are evaluated against all policies in a store.
 * ### Creating a Policy Store
 * **Example:** Basic Policy Store
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {
 *   validationMode: "OFF",
 * });
 * ```
 *
 * **Example:** Strict Validation with a Schema
 * ```typescript
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {
 *   validationMode: "STRICT",
 *   description: "Photo app authorization",
 * });
 *
 * yield* AWS.VerifiedPermissions.Schema("Schema", {
 *   policyStoreId: store.policyStoreId,
 *   cedarJson: JSON.stringify({
 *     PhotoApp: {
 *       entityTypes: { User: {}, Photo: {} },
 *       actions: { viewPhoto: { appliesTo: { principalTypes: ["User"], resourceTypes: ["Photo"] } } },
 *     },
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const PolicyStore: import("../../Resource.ts").ResourceClass<PolicyStore>;
export declare const PolicyStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<PolicyStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PolicyStore.d.ts.map