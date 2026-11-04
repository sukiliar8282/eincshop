import * as glacier from "@distilled.cloud/aws/glacier";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
// Glacier's REST API takes the AWS account ID as a path segment; `-` means
// "the account that signed the request".
const ACCOUNT = "-";
/**
 * An Amazon S3 Glacier vault — a container for archives in the original
 * (vault-based) S3 Glacier service.
 *
 * Vault creation is idempotent and free; storage is billed per archive.
 * A vault must be empty to be deleted, which is always the case for vaults
 * that only ever held configuration.
 * ### Creating Vaults
 * **Example:** Basic Vault
 * ```typescript
 * import * as Glacier from "alchemy/AWS/Glacier";
 *
 * const vault = yield* Glacier.Vault("Backups");
 * ```
 *
 * **Example:** Vault with Tags
 * ```typescript
 * const vault = yield* Glacier.Vault("Backups", {
 *   tags: { team: "storage" },
 * });
 * ```
 *
 * ### Notifications
 * **Example:** Publish job-completion events to SNS
 * ```typescript
 * const topic = yield* SNS.Topic("VaultEvents");
 * const vault = yield* Glacier.Vault("Backups", {
 *   notificationConfig: {
 *     snsTopic: topic.topicArn,
 *     events: ["ArchiveRetrievalCompleted", "InventoryRetrievalCompleted"],
 *   },
 * });
 * ```
 *
 * ### Access Control
 * **Example:** Vault access policy
 * ```typescript
 * const vault = yield* Glacier.Vault("Backups", {
 *   accessPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Sid: "deny-archive-deletes",
 *       Effect: "Deny",
 *       Principal: "*",
 *       Action: ["glacier:DeleteArchive"],
 *       Resource: ["arn:aws:glacier:us-east-1:123456789012:vaults/backups"],
 *     }],
 *   },
 * });
 * ```
 *
 * **Example:** Vault lock policy (left in-progress, never completed)
 * ```typescript
 * const vault = yield* Glacier.Vault("Compliance", {
 *   lockPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Sid: "deny-archive-deletes",
 *       Effect: "Deny",
 *       Principal: "*",
 *       Action: ["glacier:DeleteArchive"],
 *       Resource: ["arn:aws:glacier:us-east-1:123456789012:vaults/compliance"],
 *     }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Vault = Resource("AWS.Glacier.Vault");
/**
 * Raised when the desired `lockPolicy` differs from (or removes) a vault
 * lock that is already in the `Locked` state. A locked vault lock policy is
 * immutable — it can never be changed or removed.
 */
export class GlacierVaultLockImmutable extends Data.TaggedError("GlacierVaultLockImmutable") {
}
/**
 * Raised when DescribeVault returns a vault record missing its ARN or
 * creation date — never expected from the live API.
 */
export class GlacierVaultIncomplete extends Data.TaggedError("GlacierVaultIncomplete") {
}
// Explicitly-typed pipeable retry helper. Inlining `Effect.retry` in a
// provider lifecycle op leaks `Retry.Return`'s conditional into declaration
// emit and widens the provider layer to `unknown` R for every consumer of
// `AWS.providers()`.
const retryWhileVaultNotFound = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ResourceNotFoundException",
    schedule: Schedule.max([Schedule.fixed(1000), Schedule.recurs(10)]),
});
const toPolicyString = (policy) => policy === undefined
    ? undefined
    : typeof policy === "string"
        ? policy
        : JSON.stringify(policy);
// Structural comparison for policy documents: AWS may re-serialize the
// stored policy, so compare parsed shapes rather than raw strings. Falls
// back to raw string equality if either side is not valid JSON.
const samePolicy = (left, right) => {
    if (left === right)
        return true;
    try {
        return (JSON.stringify(JSON.parse(left)) === JSON.stringify(JSON.parse(right)));
    }
    catch {
        return false;
    }
};
const sameStringSet = (left, right) => {
    if (left.length !== right.length)
        return false;
    const sortedLeft = [...left].sort();
    const sortedRight = [...right].sort();
    return sortedLeft.every((value, i) => value === sortedRight[i]);
};
export const VaultProvider = () => Provider.effect(Vault, Effect.gen(function* () {
    const createVaultName = Effect.fn(function* (id, props) {
        return (props.vaultName ?? (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    const describeVault = (vaultName) => glacier
        .describeVault({ accountId: ACCOUNT, vaultName })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const readVaultTags = (vaultName) => glacier.listTagsForVault({ accountId: ACCOUNT, vaultName }).pipe(Effect.map((r) => (r.Tags ?? {})), Effect.catch(() => Effect.succeed({})));
    return Vault.Provider.of({
        stables: ["vaultName", "vaultArn", "creationDate"],
        // Enumerate every vault in the ambient account/region. Vaults whose
        // list entry is missing identifying fields (never expected from the
        // live API) are dropped.
        list: () => Effect.gen(function* () {
            const pages = yield* glacier.listVaults
                .pages({ accountId: ACCOUNT })
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.VaultList ?? [])
                .flatMap((vault) => vault.VaultName !== undefined &&
                vault.VaultARN !== undefined &&
                vault.CreationDate !== undefined
                ? [
                    {
                        vaultName: vault.VaultName,
                        vaultArn: vault.VaultARN,
                        creationDate: vault.CreationDate,
                    },
                ]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const vaultName = output?.vaultName ?? (yield* createVaultName(id, olds ?? {}));
            const found = yield* describeVault(vaultName);
            if (found?.VaultARN === undefined)
                return undefined;
            const attrs = {
                vaultName,
                vaultArn: found.VaultARN,
                creationDate: found.CreationDate ?? "",
            };
            const tags = yield* readVaultTags(vaultName);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createVaultName(id, olds ?? {});
            const newName = yield* createVaultName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // undefined → default update path (reconcile syncs the rest)
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news ?? {};
            const vaultName = output?.vaultName ?? (yield* createVaultName(id, props));
            const internalTags = yield* createInternalTags(id);
            // 1. OBSERVE — cloud state is authoritative; output is only a
            //    name cache.
            let live = yield* describeVault(vaultName);
            // 2. ENSURE — CreateVault is an idempotent PUT; re-observe for the
            //    full record (create only returns a Location header). A brief
            //    bounded retry covers read-after-create consistency.
            if (live === undefined) {
                yield* glacier.createVault({ accountId: ACCOUNT, vaultName });
                live = yield* glacier
                    .describeVault({ accountId: ACCOUNT, vaultName })
                    .pipe(retryWhileVaultNotFound);
            }
            if (live.VaultARN === undefined || live.CreationDate === undefined) {
                return yield* Effect.fail(new GlacierVaultIncomplete({
                    message: `DescribeVault for '${vaultName}' returned no VaultARN/CreationDate`,
                }));
            }
            // 3a. SYNC notification configuration — observed vs desired.
            const observedNotifications = yield* glacier
                .getVaultNotifications({ accountId: ACCOUNT, vaultName })
                .pipe(Effect.map((r) => r.vaultNotificationConfig), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            const desiredNotifications = props.notificationConfig;
            if (desiredNotifications !== undefined) {
                const inSync = observedNotifications !== undefined &&
                    observedNotifications.SNSTopic ===
                        desiredNotifications.snsTopic &&
                    sameStringSet(observedNotifications.Events ?? [], desiredNotifications.events);
                if (!inSync) {
                    yield* glacier.setVaultNotifications({
                        accountId: ACCOUNT,
                        vaultName,
                        vaultNotificationConfig: {
                            SNSTopic: desiredNotifications.snsTopic,
                            Events: desiredNotifications.events,
                        },
                    });
                }
            }
            else if (observedNotifications !== undefined) {
                yield* glacier
                    .deleteVaultNotifications({ accountId: ACCOUNT, vaultName })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
            // 3b. SYNC access policy — observed vs desired.
            const observedPolicy = yield* glacier
                .getVaultAccessPolicy({ accountId: ACCOUNT, vaultName })
                .pipe(Effect.map((r) => r.policy?.Policy), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            const desiredPolicy = toPolicyString(props.accessPolicy);
            if (desiredPolicy !== undefined) {
                if (observedPolicy === undefined ||
                    !samePolicy(observedPolicy, desiredPolicy)) {
                    yield* glacier.setVaultAccessPolicy({
                        accountId: ACCOUNT,
                        vaultName,
                        policy: { Policy: desiredPolicy },
                    });
                }
            }
            else if (observedPolicy !== undefined) {
                yield* glacier
                    .deleteVaultAccessPolicy({ accountId: ACCOUNT, vaultName })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
            // 3c. SYNC vault lock — observed vs desired. An `InProgress` lock
            //     can be aborted and re-initiated; a `Locked` lock is immutable
            //     forever, so any drift from the desired state is surfaced as a
            //     typed failure rather than silently ignored.
            const observedLock = yield* glacier
                .getVaultLock({ accountId: ACCOUNT, vaultName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            const desiredLock = toPolicyString(props.lockPolicy);
            if (desiredLock !== undefined) {
                if (observedLock === undefined) {
                    yield* glacier.initiateVaultLock({
                        accountId: ACCOUNT,
                        vaultName,
                        policy: { Policy: desiredLock },
                    });
                }
                else if (observedLock.Policy === undefined ||
                    !samePolicy(observedLock.Policy, desiredLock)) {
                    if (observedLock.State === "Locked") {
                        return yield* Effect.fail(new GlacierVaultLockImmutable({
                            message: `Vault '${vaultName}' lock is in the Locked state; its lock policy can never be changed.`,
                        }));
                    }
                    // InProgress with a different policy: abort and re-initiate.
                    yield* glacier
                        .abortVaultLock({ accountId: ACCOUNT, vaultName })
                        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                    yield* glacier.initiateVaultLock({
                        accountId: ACCOUNT,
                        vaultName,
                        policy: { Policy: desiredLock },
                    });
                }
            }
            else if (observedLock !== undefined) {
                if (observedLock.State === "Locked") {
                    return yield* Effect.fail(new GlacierVaultLockImmutable({
                        message: `Vault '${vaultName}' lock is in the Locked state; it can never be removed.`,
                    }));
                }
                yield* glacier
                    .abortVaultLock({ accountId: ACCOUNT, vaultName })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
            // 3d. SYNC tags — diff against OBSERVED cloud tags so adoption
            //     converges.
            const observedTags = yield* readVaultTags(vaultName);
            const desiredTags = {
                ...props.tags,
                ...internalTags,
            };
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* glacier.addTagsToVault({
                    accountId: ACCOUNT,
                    vaultName,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* glacier.removeTagsFromVault({
                    accountId: ACCOUNT,
                    vaultName,
                    TagKeys: removed,
                });
            }
            // 4. RETURN fresh Attributes.
            yield* session.note(vaultName);
            return {
                vaultName,
                vaultArn: live.VaultARN,
                creationDate: live.CreationDate,
            };
        }),
        // Idempotent delete. An in-progress vault lock is aborted first so a
        // lock policy that denies deletes cannot strand the vault; deleting
        // an already-deleted vault is not an error.
        delete: Effect.fn(function* ({ output }) {
            const lock = yield* glacier
                .getVaultLock({
                accountId: ACCOUNT,
                vaultName: output.vaultName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (lock !== undefined && lock.State !== "Locked") {
                yield* glacier
                    .abortVaultLock({
                    accountId: ACCOUNT,
                    vaultName: output.vaultName,
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
            yield* glacier
                .deleteVault({ accountId: ACCOUNT, vaultName: output.vaultName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Vault.js.map