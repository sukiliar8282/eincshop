import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SchemaProps {
    /**
     * The ID of the policy store the schema belongs to. A store has at most one
     * schema. Changing the store replaces the schema.
     */
    policyStoreId: string;
    /**
     * The Cedar JSON schema document (as a JSON string). Defines the entity
     * types, actions, and the relationships between them used to validate
     * policies when the store's validation mode is `STRICT`. Mutable — updating
     * re-submits the schema via `PutSchema`.
     */
    cedarJson: string;
}
export interface Schema extends Resource<"AWS.VerifiedPermissions.Schema", SchemaProps, {
    /**
     * ID of the policy store the schema belongs to.
     */
    policyStoreId: string;
}, {}, Providers> {
}
/**
 * The Cedar schema for a Verified Permissions policy store. The schema
 * declares the entity types and actions your policies reference; with
 * `validationMode: "STRICT"` on the store, policies and templates are
 * validated against it at submission time.
 *
 * A policy store has at most one schema — `PutSchema` is an upsert that fully
 * replaces the previous schema.
 * ### Defining a Schema
 * **Example:** Photo App Schema
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {
 *   validationMode: "STRICT",
 * });
 *
 * yield* AWS.VerifiedPermissions.Schema("Schema", {
 *   policyStoreId: store.policyStoreId,
 *   cedarJson: JSON.stringify({
 *     PhotoApp: {
 *       entityTypes: {
 *         User: {},
 *         Photo: {},
 *       },
 *       actions: {
 *         viewPhoto: {
 *           appliesTo: {
 *             principalTypes: ["User"],
 *             resourceTypes: ["Photo"],
 *           },
 *         },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const Schema: import("../../Resource.ts").ResourceClass<Schema>;
export declare const SchemaProvider: () => import("effect/Layer").Layer<Provider.Provider<Schema>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Schema.d.ts.map