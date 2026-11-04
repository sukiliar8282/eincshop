import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GroupMembershipProps {
    /**
     * Name of the IAM group to manage membership for.
     */
    groupName: Input<string>;
    /**
     * Exact set of user names that should be members of the group.
     */
    userNames: Input<string[]>;
}
export interface GroupMembership extends Resource<"AWS.IAM.GroupMembership", GroupMembershipProps, {
    /** The group whose membership is managed. */
    groupName: string;
    /** The user names currently in the group. */
    userNames: string[];
}, never, Providers> {
}
/**
 * An explicit IAM group membership resource that owns a group's managed users.
 *
 * `GroupMembership` models the exact set of users in a group, making membership
 * reconciliation explicit instead of spreading it across user or group resources.
 * ### Managing Group Membership
 * **Example:** Sync a Group's Members
 * ```typescript
 * const admins = yield* Group("Admins", {
 *   groupName: "admins",
 * });
 *
 * const alice = yield* User("Alice", {
 *   userName: "alice",
 * });
 *
 * const bob = yield* User("Bob", {
 *   userName: "bob",
 * });
 *
 * const membership = yield* GroupMembership("AdminsMembership", {
 *   groupName: admins.groupName,
 *   userNames: [alice.userName, bob.userName],
 * });
 * ```
 *
 * @resource
 */
export declare const GroupMembership: import("../../Resource.ts").ResourceClass<GroupMembership>;
export declare const GroupMembershipProvider: () => import("effect/Layer").Layer<Provider.Provider<GroupMembership>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GroupMembership.d.ts.map