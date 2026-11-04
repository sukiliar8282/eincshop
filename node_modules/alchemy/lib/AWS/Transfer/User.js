import * as transfer from "@distilled.cloud/aws/transfer";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * A user of an AWS Transfer Family server (service-managed identity
 * provider). Users are free configuration objects attached to a
 * {@link Server}; the server itself is what incurs hourly cost.
 * ### Creating a User
 * **Example:** Service-Managed SFTP User
 * ```typescript
 * const user = yield* User("Alice", {
 *   serverId: server.serverId,
 *   userName: "alice",
 *   role: transferRole.roleArn,
 *   homeDirectory: "/my-bucket/alice",
 *   sshPublicKeyBody: "ssh-ed25519 AAAA...",
 * });
 * ```
 *
 * @resource
 */
export const User = Resource("AWS.Transfer.User");
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
export const UserProvider = () => Provider.effect(User, Effect.gen(function* () {
    const describe = Effect.fn(function* (serverId, userName) {
        const response = yield* transfer
            .describeUser({ ServerId: serverId, UserName: userName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.User;
    });
    const readTags = Effect.fn(function* (arn) {
        const response = yield* transfer
            .listTagsForResource({ Arn: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        return toTagRecord(response?.Tags);
    });
    const toAttrs = Effect.fn(function* (serverId, user) {
        if (!user.UserName) {
            return yield* Effect.fail(new Error("Transfer user is missing its UserName"));
        }
        return {
            userName: user.UserName,
            serverId,
            arn: user.Arn,
            role: user.Role,
            homeDirectory: user.HomeDirectory,
            tags: yield* readTags(user.Arn),
        };
    });
    return {
        stables: ["userName", "serverId", "arn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // ServerId and UserName are the resource identity.
            if (news.serverId !== olds?.serverId ||
                news.userName !== olds?.userName) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const serverId = output?.serverId ?? olds?.serverId;
            const userName = output?.userName ?? olds?.userName;
            if (!serverId || !userName)
                return undefined;
            const user = yield* describe(serverId, userName);
            if (!user?.UserName)
                return undefined;
            const attrs = yield* toAttrs(serverId, user);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* describe(news.serverId, news.userName);
            // 2. Ensure — create if missing; tolerate AlreadyExists as a race.
            if (observed === undefined) {
                yield* transfer
                    .createUser({
                    ServerId: news.serverId,
                    UserName: news.userName,
                    Role: news.role,
                    HomeDirectory: news.homeDirectory,
                    HomeDirectoryType: news.homeDirectoryType,
                    HomeDirectoryMappings: news.homeDirectoryMappings,
                    Policy: news.policy,
                    PosixProfile: news.posixProfile,
                    SshPublicKeyBody: news.sshPublicKeyBody,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("ResourceExistsException", () => Effect.void));
            }
            else {
                // 3. Sync — push mutable configuration.
                yield* transfer.updateUser({
                    ServerId: news.serverId,
                    UserName: news.userName,
                    Role: news.role,
                    HomeDirectory: news.homeDirectory,
                    HomeDirectoryType: news.homeDirectoryType,
                    HomeDirectoryMappings: news.homeDirectoryMappings,
                    Policy: news.policy,
                    PosixProfile: news.posixProfile,
                });
            }
            observed = yield* describe(news.serverId, news.userName);
            if (!observed?.UserName) {
                return yield* Effect.fail(new Error(`Transfer user '${news.userName}' not found after reconcile`));
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const arn = observed.Arn;
            const observedTags = yield* readTags(arn);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* transfer.tagResource({ Arn: arn, Tags: upsert });
            }
            if (removed.length > 0) {
                yield* transfer.untagResource({ Arn: arn, TagKeys: removed });
            }
            yield* session.note(`${news.serverId}/${news.userName}`);
            return yield* toAttrs(news.serverId, observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* transfer
                .deleteUser({
                ServerId: output.serverId,
                UserName: output.userName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        // Users are sub-resources keyed by their parent server; there is no
        // account-wide enumeration without a server id.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=User.js.map