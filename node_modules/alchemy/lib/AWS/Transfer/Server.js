import * as transfer from "@distilled.cloud/aws/transfer";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An AWS Transfer Family server — a managed SFTP/FTPS/FTP/AS2 endpoint in
 * front of S3 or EFS storage. A running server is billed hourly (plus data
 * transfer), so create it only when needed and destroy it promptly.
 * ### Creating a Server
 * **Example:** Public SFTP Server (Service-Managed Users)
 * ```typescript
 * const server = yield* Server("Sftp", {
 *   protocols: ["SFTP"],
 *   domain: "S3",
 *   endpointType: "PUBLIC",
 *   identityProviderType: "SERVICE_MANAGED",
 * });
 * ```
 *
 * ### Adding Users
 * **Example:** SFTP Server with a Service-Managed User
 * ```typescript
 * const server = yield* Server("Sftp", {
 *   protocols: ["SFTP"],
 *   identityProviderType: "SERVICE_MANAGED",
 * });
 *
 * // Role Transfer Family assumes to access the S3 storage backend
 * const role = yield* AWS.IAM.Role("TransferUserRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "transfer.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 *   inlinePolicies: {
 *     s3: {
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Action: ["s3:ListBucket", "s3:GetObject", "s3:PutObject"],
 *           Resource: [bucket.bucketArn, Output.interpolate`${bucket.bucketArn}/*`],
 *         },
 *       ],
 *     },
 *   },
 * });
 *
 * const user = yield* User("Alice", {
 *   serverId: server.serverId,
 *   userName: "alice",
 *   role: role.roleArn,
 *   homeDirectory: Output.interpolate`/${bucket.bucketName}/alice`,
 *   sshPublicKeyBody: "ssh-ed25519 AAAA...",
 * });
 * ```
 *
 * @resource
 */
export const Server = Resource("AWS.Transfer.Server");
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
export const ServerProvider = () => Provider.effect(Server, Effect.gen(function* () {
    const describe = Effect.fn(function* (serverId) {
        const response = yield* transfer
            .describeServer({ ServerId: serverId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.Server;
    });
    const readTags = Effect.fn(function* (arn) {
        const response = yield* transfer
            .listTagsForResource({ Arn: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        return toTagRecord(response?.Tags);
    });
    // Servers transition through STARTING before ONLINE; updateServer and
    // deleteServer require a settled state. Budget ~7 minutes (10s x 42).
    const waitUntilSettled = Effect.fn(function* (serverId) {
        const settlePolicy = Schedule.max([
            Schedule.fixed("10 seconds"),
            Schedule.recurs(42),
        ]);
        return yield* describe(serverId).pipe(Effect.flatMap((server) => {
            if (server !== undefined &&
                (server.State === "STARTING" || server.State === "STOPPING")) {
                return Effect.fail(new Error(`Transfer server '${serverId}' still settling (state: ${server.State})`));
            }
            return Effect.succeed(server);
        }), Effect.retry({ schedule: settlePolicy }));
    });
    const toAttrs = Effect.fn(function* (server) {
        if (!server.ServerId) {
            return yield* Effect.fail(new Error("Transfer server is missing its ServerId"));
        }
        return {
            serverId: server.ServerId,
            arn: server.Arn,
            endpointType: server.EndpointType ?? "PUBLIC",
            domain: server.Domain ?? "S3",
            identityProviderType: server.IdentityProviderType ?? "SERVICE_MANAGED",
            protocols: [...(server.Protocols ?? [])],
            state: server.State,
            tags: yield* readTags(server.Arn),
        };
    });
    return {
        stables: ["serverId", "arn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // Domain and identity-provider type are create-only.
            if ((news.domain ?? "S3") !== (olds?.domain ?? "S3") ||
                (news.identityProviderType ?? "SERVICE_MANAGED") !==
                    (olds?.identityProviderType ?? "SERVICE_MANAGED")) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, output }) {
            // ServerId is AWS-assigned, so a server can only be found via a
            // previously-persisted output (like an auto-id VPC).
            if (!output?.serverId)
                return undefined;
            const server = yield* describe(output.serverId);
            if (!server?.ServerId)
                return undefined;
            const attrs = yield* toAttrs(server);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative (via the id cache).
            let serverId = output?.serverId;
            let observed = serverId ? yield* describe(serverId) : undefined;
            // 2. Ensure — create if missing.
            if (observed === undefined) {
                const created = yield* transfer.createServer({
                    Protocols: news.protocols ?? ["SFTP"],
                    Domain: news.domain,
                    EndpointType: news.endpointType,
                    EndpointDetails: news.endpointDetails,
                    IdentityProviderType: news.identityProviderType,
                    IdentityProviderDetails: news.identityProviderDetails,
                    LoggingRole: news.loggingRole,
                    SecurityPolicyName: news.securityPolicyName,
                    PreAuthenticationLoginBanner: news.preAuthenticationLoginBanner,
                    PostAuthenticationLoginBanner: news.postAuthenticationLoginBanner,
                    ProtocolDetails: news.protocolDetails,
                    S3StorageOptions: news.s3StorageOptions,
                    WorkflowDetails: news.workflowDetails,
                    StructuredLogDestinations: news.structuredLogDestinations,
                    IpAddressType: news.ipAddressType,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                });
                serverId = created.ServerId;
            }
            else {
                // 3. Sync — push mutable configuration. updateServer requires a
                //    settled server state.
                yield* waitUntilSettled(serverId);
                yield* transfer.updateServer({
                    ServerId: serverId,
                    Protocols: news.protocols,
                    EndpointType: news.endpointType,
                    EndpointDetails: news.endpointDetails,
                    IdentityProviderDetails: news.identityProviderDetails,
                    LoggingRole: news.loggingRole,
                    SecurityPolicyName: news.securityPolicyName,
                    PreAuthenticationLoginBanner: news.preAuthenticationLoginBanner,
                    PostAuthenticationLoginBanner: news.postAuthenticationLoginBanner,
                    ProtocolDetails: news.protocolDetails,
                    S3StorageOptions: news.s3StorageOptions,
                    WorkflowDetails: news.workflowDetails,
                    StructuredLogDestinations: news.structuredLogDestinations,
                    IpAddressType: news.ipAddressType,
                });
            }
            // Wait for the server to settle so downstream User creation and the
            // returned state are stable.
            observed = yield* waitUntilSettled(serverId);
            if (!observed?.ServerId || !observed.Arn) {
                return yield* Effect.fail(new Error(`Transfer server '${serverId}' not found after reconcile`));
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
            yield* session.note(observed.ServerId);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* transfer
                .deleteServer({ ServerId: output.serverId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => transfer.listServers.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Servers ?? []).filter((server) => server.ServerId !== undefined))), Effect.flatMap(Effect.forEach((server) => toAttrs({
            Arn: server.Arn,
            ServerId: server.ServerId,
            Domain: server.Domain,
            EndpointType: server.EndpointType,
            IdentityProviderType: server.IdentityProviderType,
            State: server.State,
            LoggingRole: server.LoggingRole,
        }), { concurrency: 4 }))),
    };
}));
//# sourceMappingURL=Server.js.map