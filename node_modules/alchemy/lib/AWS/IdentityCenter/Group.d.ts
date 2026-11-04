import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GroupProps {
    /**
     * Explicit identity store ID.
     * If omitted, Alchemy resolves it from the selected Identity Center instance.
     */
    identityStoreId?: string;
    /**
     * Optional instance ARN used to discover the identity store ID.
     */
    instanceArn?: string;
    /**
     * Group display name.
     */
    displayName: string;
    /**
     * Optional group description.
     */
    description?: string;
}
export interface Group extends Resource<"AWS.IdentityCenter.Group", GroupProps, {
    /** The identity store containing the group. */
    identityStoreId: string;
    /** The unique ID of the group. */
    groupId: string;
    /** The display name of the group. */
    displayName: string | undefined;
    /** The description of the group. */
    description: string | undefined;
    /** When the group was created. */
    createdAt: Date | undefined;
    /** When the group was last updated. */
    updatedAt: Date | undefined;
}, never, Providers> {
}
/**
 * A group in the IAM Identity Center identity store.
 * ### Creating Groups
 * **Example:** Platform Engineers
 * ```typescript
 * const engineers = yield* Group("PlatformEngineers", {
 *   displayName: "platform-engineers",
 *   description: "Platform engineering team",
 * });
 * ```
 *
 * @resource
 */
export declare const Group: import("../../Resource.ts").ResourceClass<Group>;
export declare const GroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Group>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Group.d.ts.map