import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const SnapshotId = (id) => `snap-${id}`;
/**
 * A point-in-time backup of an EBS {@link Volume}, stored in S3. Snapshots are
 * incremental and immutable — you create new {@link Volume}s from them via
 * `snapshotId`.
 *
 * A snapshot is immutable once created; changing the source `volumeId` replaces
 * it. Creation is asynchronous — the resource waits for the snapshot to reach
 * the `completed` state before returning.
 *
 * ### Creating a Snapshot
 * **Example:** Snapshot a Volume
 * ```typescript
 * const snapshot = yield* AWS.EC2.Snapshot("DailyBackup", {
 *   volumeId: volume.volumeId,
 *   description: "nightly backup of the data volume",
 * });
 * ```
 *
 * The snapshot captures the volume's state at creation time. Because snapshots
 * are incremental, only blocks changed since the previous snapshot of the same
 * volume are stored.
 *
 * ### Restoring from a Snapshot
 * **Example:** Create a Volume from a Snapshot
 * ```typescript
 * const restored = yield* AWS.EC2.Volume("Restored", {
 *   availabilityZone: "us-east-1a",
 *   snapshotId: snapshot.snapshotId,
 * });
 * ```
 *
 * Pass a snapshot's `snapshotId` to {@link Volume} to provision a new volume
 * pre-populated with the snapshot's data — the standard backup/restore and
 * clone-across-AZ pattern.
 *
 * @resource
 */
export const Snapshot = Resource("AWS.EC2.Snapshot");
export const SnapshotProvider = () => Provider.effect(Snapshot, Effect.gen(function* () {
    return {
        stables: [
            "snapshotId",
            "snapshotArn",
            "volumeId",
            "volumeSize",
            "encrypted",
            "kmsKeyId",
            "ownerId",
        ],
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            // A snapshot is an immutable copy of one volume — changing the source
            // volume requires a fresh snapshot.
            if (olds.volumeId !== news.volumeId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const alchemyTags = yield* createInternalTags(id);
            const desiredTags = { ...alchemyTags, ...news.tags };
            // 1. OBSERVE — output is only an id cache.
            let snapshot;
            if (output?.snapshotId) {
                const lookup = yield* ec2
                    .describeSnapshots({ SnapshotIds: [output.snapshotId] })
                    .pipe(Effect.catchTag("InvalidSnapshot.NotFound", () => Effect.succeed({ Snapshots: [] })));
                snapshot = lookup.Snapshots?.[0];
            }
            // 2. ENSURE — create the snapshot when missing, then wait until it is
            //    completed.
            if (snapshot === undefined) {
                const created = yield* ec2.createSnapshot({
                    VolumeId: news.volumeId,
                    Description: news.description,
                    TagSpecifications: [
                        {
                            ResourceType: "snapshot",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                    DryRun: false,
                });
                const snapshotId = created.SnapshotId;
                yield* session.note(`Snapshot created: ${snapshotId}`);
                snapshot = yield* waitForSnapshotCompleted(snapshotId, session);
            }
            const snapshotId = snapshot.SnapshotId;
            // 3. SYNC TAGS — diff against observed cloud tags.
            const currentTags = Object.fromEntries((snapshot.Tags ?? []).map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [snapshotId],
                    Tags: removed.map((key) => ({ Key: key })),
                    DryRun: false,
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({
                    Resources: [snapshotId],
                    Tags: upsert,
                    DryRun: false,
                });
            }
            return toSnapshotAttributes(snapshot, region, accountId);
        }),
        // Enumerate every snapshot owned by this account (never public/shared
        // snapshots — scope to "self").
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const chunk = yield* ec2.describeSnapshots
                .pages({ OwnerIds: ["self"] })
                .pipe(Stream.runCollect);
            return Array.from(chunk).flatMap((page) => (page.Snapshots ?? []).map((s) => toSnapshotAttributes(s, region, accountId)));
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const snapshotId = output.snapshotId;
            yield* session.note(`Deleting snapshot: ${snapshotId}`);
            yield* ec2
                .deleteSnapshot({ SnapshotId: snapshotId, DryRun: false })
                .pipe(Effect.tapError(Effect.logDebug), Effect.catchTag("InvalidSnapshot.NotFound", () => Effect.void));
            yield* session.note(`Snapshot ${snapshotId} deleted successfully`);
        }),
    };
}));
const toSnapshotAttributes = (snapshot, region, accountId) => {
    const snapshotId = snapshot.SnapshotId;
    return {
        snapshotId,
        snapshotArn: `arn:aws:ec2:${region}:${accountId}:snapshot/${snapshotId}`,
        volumeId: snapshot.VolumeId,
        volumeSize: snapshot.VolumeSize ?? 0,
        state: snapshot.State ?? "pending",
        progress: snapshot.Progress,
        encrypted: snapshot.Encrypted ?? false,
        kmsKeyId: snapshot.KmsKeyId,
        ownerId: snapshot.OwnerId,
    };
};
class SnapshotPending extends Data.TaggedError("SnapshotPending") {
}
/**
 * Wait for the snapshot to reach the `completed` state. Bounded so a slow
 * snapshot fails fast rather than hanging the deploy.
 */
const waitForSnapshotCompleted = (snapshotId, session) => Effect.gen(function* () {
    const result = yield* ec2.describeSnapshots({
        SnapshotIds: [snapshotId],
    });
    const snapshot = result.Snapshots?.[0];
    if (!snapshot) {
        return yield* Effect.fail(new Error(`Snapshot ${snapshotId} not found`));
    }
    if (snapshot.State === "completed") {
        return snapshot;
    }
    if (snapshot.State === "error") {
        return yield* Effect.fail(new Error(`Snapshot ${snapshotId} entered error state: ${snapshot.StateMessage}`));
    }
    return yield* new SnapshotPending({
        snapshotId,
        state: snapshot.State,
        progress: snapshot.Progress,
    });
}).pipe(Effect.retry({
    while: (e) => e instanceof SnapshotPending,
    schedule: Schedule.max([
        Schedule.fixed(3000),
        Schedule.recurs(30), // max ~90s
    ]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for snapshot to complete... (${(attempt + 1) * 3}s)`)
        : Effect.void)),
}));
//# sourceMappingURL=Snapshot.js.map