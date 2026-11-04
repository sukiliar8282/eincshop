import * as cip from "@distilled.cloud/aws/cognito-identity-provider";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
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
export const Group = Resource("AWS.Cognito.Group");
export const GroupProvider = () => Provider.effect(Group, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.groupName ?? (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const getGroup = Effect.fn(function* (userPoolId, groupName) {
        return yield* cip
            .getGroup({ UserPoolId: userPoolId, GroupName: groupName })
            .pipe(Effect.map((r) => r.Group), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return Group.Provider.of({
        stables: ["groupName", "userPoolId"],
        // Sub-resource keyed entirely by its user pool (userPoolId) with no global
        // enumeration API of its own — nuke reaches it through the parent's
        // deletion, so enumeration returns empty per the ProviderService
        // doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const userPoolId = output?.userPoolId ?? olds?.userPoolId;
            if (userPoolId === undefined)
                return undefined;
            const name = output?.groupName ?? (yield* createName(id, olds ?? {}));
            const observed = yield* getGroup(userPoolId, name);
            return observed === undefined
                ? undefined
                : { groupName: name, userPoolId };
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName || olds?.userPoolId !== news?.userPoolId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const groupName = output?.groupName ?? (yield* createName(id, news));
            const userPoolId = news.userPoolId;
            // 1. OBSERVE
            let observed = yield* getGroup(userPoolId, groupName);
            // 2. ENSURE — tolerate the create race.
            if (observed === undefined) {
                observed = yield* cip
                    .createGroup({
                    UserPoolId: userPoolId,
                    GroupName: groupName,
                    Description: news.description,
                    RoleArn: news.roleArn,
                    Precedence: news.precedence,
                })
                    .pipe(Effect.map((r) => r.Group), Effect.catchTag("GroupExistsException", () => getGroup(userPoolId, groupName)));
            }
            else {
                // 3. SYNC — description/role/precedence are mutable in place.
                const drift = (news.description !== undefined &&
                    observed.Description !== news.description) ||
                    (news.roleArn !== undefined &&
                        observed.RoleArn !== news.roleArn) ||
                    (news.precedence !== undefined &&
                        observed.Precedence !== news.precedence) ||
                    (news.description === undefined &&
                        observed.Description !== undefined) ||
                    (news.roleArn === undefined && observed.RoleArn !== undefined) ||
                    (news.precedence === undefined &&
                        observed.Precedence !== undefined);
                if (drift) {
                    yield* cip.updateGroup({
                        UserPoolId: userPoolId,
                        GroupName: groupName,
                        Description: news.description,
                        RoleArn: news.roleArn,
                        Precedence: news.precedence,
                    });
                }
            }
            yield* session.note(groupName);
            return { groupName, userPoolId };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* cip
                .deleteGroup({
                UserPoolId: output.userPoolId,
                GroupName: output.groupName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Group.js.map