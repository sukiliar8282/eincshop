import * as ds from "@distilled.cloud/aws/directory-service";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { readDirectoryTags, sameStringSet } from "./internal.js";
/**
 * An AWS Directory Service managed directory — either Simple AD (Samba) or
 * AWS Managed Microsoft AD.
 *
 * Directories are VPC-only and require two subnets in different Availability
 * Zones. Provisioning is SLOW: Simple AD takes roughly 10 minutes and
 * Microsoft AD 20-40 minutes, and directories bill hourly while they exist.
 * Destroy directories you are not using.
 * ### Creating a Directory
 * **Example:** Simple AD Directory
 * ```typescript
 * const directory = yield* Directory("Corp", {
 *   name: "corp.example.com",
 *   password: Redacted.make("SuperSecret123!"),
 *   size: "Small",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * **Example:** Managed Microsoft AD Directory
 * ```typescript
 * const directory = yield* Directory("Corp", {
 *   type: "MicrosoftAD",
 *   name: "corp.example.com",
 *   shortName: "CORP",
 *   password: Redacted.make("SuperSecret123!"),
 *   edition: "Standard",
 *   vpcId: vpc.vpcId,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * ### Using the Directory
 * **Example:** Read the DNS Addresses
 * ```typescript
 * const directory = yield* Directory("Corp", { ... });
 * // the directory-provided DNS servers, one per Availability Zone
 * const dns = directory.dnsIpAddrs;
 * ```
 *
 * @resource
 */
export const Directory = Resource("AWS.DirectoryService.Directory");
const DEFAULT_SIZE = "Small";
const DEFAULT_EDITION = "Standard";
/** Stages from which a directory can never come back. */
const isTerminalStage = (stage) => stage === "Deleting" || stage === "Deleted" || stage === "Failed";
class DirectoryNotReady extends Data.TaggedError("DirectoryNotReady") {
}
class DirectoryProvisioningFailed extends Data.TaggedError("DirectoryProvisioningFailed") {
}
// Directory provisioning is slow (Simple AD ~10 min, Microsoft AD 20-40
// min); poll every 30s with a ~50 min budget. Only DirectoryNotReady is
// retried — a Failed/Deleted stage aborts immediately.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "DirectoryNotReady",
    schedule: Schedule.max([
        Schedule.fixed("30 seconds"),
        Schedule.recurs(100),
    ]),
});
export const DirectoryProvider = () => Provider.effect(Directory, Effect.gen(function* () {
    const getById = Effect.fn(function* (directoryId) {
        const response = yield* ds
            .describeDirectories({ DirectoryIds: [directoryId] })
            .pipe(Effect.catchTag("EntityDoesNotExistException", () => Effect.succeed(undefined)));
        return response?.DirectoryDescriptions?.[0];
    });
    // Best-effort fallback for lost state: scan the account's directories
    // for a live one with the desired domain name.
    const findByName = Effect.fn(function* (name) {
        if (name === undefined)
            return undefined;
        const matches = yield* ds.describeDirectories.items({}).pipe(Stream.filter((d) => d.Name === name && !isTerminalStage(d.Stage)), Stream.take(1), Stream.runCollect);
        return Array.from(matches)[0];
    });
    const observe = Effect.fn(function* (directoryId, name) {
        const found = directoryId
            ? yield* getById(directoryId)
            : yield* findByName(name);
        return found !== undefined && !isTerminalStage(found.Stage)
            ? found
            : undefined;
    });
    const waitForActive = (directoryId) => Effect.gen(function* () {
        const directory = yield* getById(directoryId);
        if (directory === undefined || isTerminalStage(directory.Stage)) {
            return yield* new DirectoryProvisioningFailed({
                directoryId,
                stage: directory?.Stage,
                reason: directory?.StageReason,
            });
        }
        if (directory.Stage !== "Active") {
            return yield* new DirectoryNotReady({
                directoryId,
                stage: directory.Stage,
            });
        }
        return directory;
    }).pipe(retryWhileNotReady);
    // Wait for a directory to leave a transitional stage before deleting.
    // Ends when the directory is in a steady stage, already deleting, or
    // gone.
    const waitUntilSettled = Effect.fn(function* (directoryId) {
        return yield* getById(directoryId).pipe(Effect.flatMap((directory) => {
            if (directory !== undefined &&
                (directory.Stage === "Requested" ||
                    directory.Stage === "Creating" ||
                    directory.Stage === "Created" ||
                    directory.Stage === "Restoring" ||
                    directory.Stage === "Updating")) {
                return Effect.fail(new DirectoryNotReady({
                    directoryId,
                    stage: directory.Stage,
                }));
            }
            return Effect.succeed(directory);
        }), retryWhileNotReady);
    });
    const toAttrs = Effect.fn(function* (directory) {
        if (!directory.DirectoryId || !directory.Name) {
            return yield* Effect.fail(new Error(`directory '${directory.DirectoryId}' is missing its id or name`));
        }
        const { accountId, region } = yield* AWSEnvironment.current;
        return {
            directoryId: directory.DirectoryId,
            directoryArn: `arn:aws:ds:${region}:${accountId}:directory/${directory.DirectoryId}`,
            directoryName: directory.Name,
            type: directory.Type ?? "SimpleAD",
            stage: directory.Stage ?? "Active",
            size: directory.Size,
            edition: directory.Edition,
            alias: directory.Alias,
            accessUrl: directory.AccessUrl,
            dnsIpAddrs: [...(directory.DnsIpAddrs ?? [])],
            securityGroupId: directory.VpcSettings?.SecurityGroupId,
            vpcId: directory.VpcSettings?.VpcId,
            subnetIds: [...(directory.VpcSettings?.SubnetIds ?? [])],
            availabilityZones: [
                ...(directory.VpcSettings?.AvailabilityZones ?? []),
            ],
            tags: yield* readDirectoryTags(directory.DirectoryId),
        };
    });
    return {
        stables: ["directoryId", "directoryName"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            const n = news;
            const o = olds;
            if (o === undefined || n === undefined)
                return undefined;
            // Every launch property is create-only — there is no update API
            // for the directory itself; only tags mutate in place.
            const type = (p) => p.type ?? "SimpleAD";
            if (type(n) !== type(o))
                return { action: "replace" };
            if (n.name !== o.name)
                return { action: "replace" };
            if (n.shortName !== o.shortName) {
                return { action: "replace" };
            }
            if (Redacted.value(n.password) !== Redacted.value(o.password)) {
                return { action: "replace" };
            }
            if (n.description !== o.description) {
                return { action: "replace" };
            }
            if (type(n) === "SimpleAD" &&
                (n.size ?? DEFAULT_SIZE) !== (o.size ?? DEFAULT_SIZE)) {
                return { action: "replace" };
            }
            if (type(n) === "MicrosoftAD" &&
                (n.edition ?? DEFAULT_EDITION) !== (o.edition ?? DEFAULT_EDITION)) {
                return { action: "replace" };
            }
            if (n.vpcId !== o.vpcId)
                return { action: "replace" };
            if (!sameStringSet(n.subnetIds, o.subnetIds)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const directory = yield* observe(output?.directoryId, olds?.name);
            if (directory === undefined)
                return undefined;
            const attrs = yield* toAttrs(directory);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news;
            const type = props.type ?? "SimpleAD";
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            // 1. Observe — cloud state is authoritative; output only caches
            //    the directory id.
            const observed = yield* observe(output?.directoryId, props.name);
            // 2. Ensure — create if missing.
            let directoryId = observed?.DirectoryId;
            if (directoryId === undefined) {
                const tagList = Object.entries(desiredTags).map(([Key, Value]) => ({
                    Key,
                    Value,
                }));
                const created = type === "MicrosoftAD"
                    ? yield* ds.createMicrosoftAD({
                        Name: props.name,
                        ShortName: props.shortName,
                        Password: props.password,
                        Description: props.description,
                        Edition: props.edition ?? DEFAULT_EDITION,
                        VpcSettings: {
                            VpcId: props.vpcId,
                            SubnetIds: props.subnetIds,
                        },
                        Tags: tagList,
                    })
                    : yield* ds.createDirectory({
                        Name: props.name,
                        ShortName: props.shortName,
                        Password: props.password,
                        Description: props.description,
                        Size: props.size ?? DEFAULT_SIZE,
                        VpcSettings: {
                            VpcId: props.vpcId,
                            SubnetIds: props.subnetIds,
                        },
                        Tags: tagList,
                    });
                if (created.DirectoryId === undefined) {
                    return yield* Effect.fail(new Error(`Create${type} for '${props.name}' returned no DirectoryId`));
                }
                directoryId = created.DirectoryId;
            }
            // Provisioning is slow (Simple AD ~10 min, Microsoft AD 20-40
            // min); wait (bounded) for the directory to become Active so the
            // returned attributes (DNS addresses, security group) are real.
            const active = yield* waitForActive(directoryId);
            // 3. Sync tags — diff against OBSERVED cloud tags.
            const observedTags = yield* readDirectoryTags(directoryId);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* ds.addTagsToResource({
                    ResourceId: directoryId,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* ds.removeTagsFromResource({
                    ResourceId: directoryId,
                    TagKeys: removed,
                });
            }
            yield* session.note(directoryId);
            return yield* toAttrs(active);
        }),
        delete: Effect.fn(function* ({ output }) {
            const directoryId = output.directoryId;
            // A directory mid-create rejects deletion — wait (bounded) for it
            // to settle first. Already deleting (or gone) is success.
            const settled = yield* waitUntilSettled(directoryId).pipe(Effect.catch(() => Effect.succeed(undefined)));
            if (settled === undefined ||
                settled.Stage === "Deleting" ||
                settled.Stage === "Deleted") {
                return;
            }
            yield* ds
                .deleteDirectory({ DirectoryId: directoryId })
                .pipe(Effect.catchTag("EntityDoesNotExistException", () => Effect.void));
        }),
        list: () => ds.describeDirectories.items({}).pipe(Stream.runCollect, Effect.flatMap((directories) => Effect.forEach(Array.from(directories).filter((d) => d.DirectoryId !== undefined &&
            d.Name !== undefined &&
            !isTerminalStage(d.Stage)), (d) => toAttrs(d), { concurrency: 4 }))),
    };
}));
//# sourceMappingURL=Directory.js.map