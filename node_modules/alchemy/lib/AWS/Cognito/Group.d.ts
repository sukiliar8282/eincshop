import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GroupProps {
    /**
     * The ID of the user pool the group belongs to. Changing this triggers a
     * replacement.
     */
    userPoolId: string;
    /**
     * Name of the group. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing this triggers a
     * replacement.
     */
    groupName?: string;
    /**
     * Description of the group (up to 2048 characters).
     */
    description?: string;
    /**
     * ARN of an IAM role associated with the group. Users in the group can
     * assume this role via an identity pool (`cognito:roles` /
     * `cognito:preferred_role` claims).
     */
    roleArn?: string;
    /**
     * Non-negative precedence; lower values take priority when a user belongs
     * to multiple groups with role ARNs.
     */
    precedence?: number;
}
export interface Group extends Resource<"AWS.Cognito.Group", GroupProps, {
    /** The name of the group. */
    groupName: string;
    /** The ID of the user pool the group belongs to. */
    userPoolId: string;
}, never, Providers> {
}
/**
 * A group within an Amazon Cognito user pool. Groups organize users, appear
 * in the `cognito:groups` token claim, and can carry an IAM role for
 * identity-pool federation.
 * ### Creating Groups
 * **Example:** Basic Group
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const admins = yield* Cognito.Group("Admins", {
 *   userPoolId: pool.userPoolId,
 *   description: "Administrators",
 * });
 * ```
 *
 * **Example:** Group with Role and Precedence
 * ```typescript
 * const admins = yield* Cognito.Group("Admins", {
 *   userPoolId: pool.userPoolId,
 *   roleArn: role.roleArn,
 *   precedence: 1,
 * });
 * ```
 *
 * @resource
 */
export declare const Group: import("../../Resource.ts").ResourceClass<Group>;
export declare const GroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Group>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Group.d.ts.map