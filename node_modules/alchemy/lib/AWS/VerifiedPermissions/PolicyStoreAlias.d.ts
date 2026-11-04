import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PolicyStoreAliasProps {
    /**
     * The ID of the policy store the alias points at. There is no update API
     * for aliases — changing the store replaces the alias.
     */
    policyStoreId: string;
    /**
     * Name of the alias. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Changing the name replaces the alias.
     */
    aliasName?: string;
    /**
     * How the alias is deleted when the resource is destroyed. `SoftDelete`
     * keeps the alias name reserved in `PendingDeletion` state for a recovery
     * window; `HardDelete` frees the name immediately.
     * @default "HardDelete"
     */
    deletionMode?: "SoftDelete" | "HardDelete";
}
export interface PolicyStoreAlias extends Resource<"AWS.VerifiedPermissions.PolicyStoreAlias", PolicyStoreAliasProps, {
    /**
     * Name of the alias — usable in place of a policy store ID in
     * authorization requests.
     */
    aliasName: string;
    /**
     * ID of the policy store the alias points at.
     */
    policyStoreId: string;
    /**
     * ARN of the alias.
     */
    aliasArn: string;
}, {}, Providers> {
}
/**
 * A named alias for a Verified Permissions policy store. Aliases let callers
 * reference a policy store by a stable name (e.g. in `IsAuthorized`
 * requests) so the underlying store can be swapped without reconfiguring
 * clients.
 * ### Creating an Alias
 * **Example:** Alias with a Generated Name
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * const alias = yield* AWS.VerifiedPermissions.PolicyStoreAlias("Alias", {
 *   policyStoreId: store.policyStoreId,
 * });
 * ```
 *
 * **Example:** Named Alias with Hard Delete
 * ```typescript
 * yield* AWS.VerifiedPermissions.PolicyStoreAlias("Alias", {
 *   policyStoreId: store.policyStoreId,
 *   aliasName: "photo-app-prod",
 *   deletionMode: "HardDelete",
 * });
 * ```
 *
 * @resource
 */
export declare const PolicyStoreAlias: import("../../Resource.ts").ResourceClass<PolicyStoreAlias>;
export declare const PolicyStoreAliasProvider: () => import("effect/Layer").Layer<Provider.Provider<PolicyStoreAlias>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=PolicyStoreAlias.d.ts.map