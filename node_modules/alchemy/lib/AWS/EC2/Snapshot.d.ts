import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
import type { Providers } from "../Providers.ts";
import type { VolumeId } from "./Volume.ts";
export type SnapshotId<ID extends string = string> = `snap-${ID}`;
export declare const SnapshotId: <ID extends string>(id: ID) => ID & SnapshotId<ID>;
export type SnapshotArn = `arn:aws:ec2:${RegionID}:${AccountID}:snapshot/${SnapshotId}`;
export interface SnapshotProps {
    /**
     * The ID of the EBS volume to snapshot. Required. A snapshot is an immutable
     * point-in-time copy, so changing the source volume replaces the snapshot.
     */
    volumeId: VolumeId;
    /**
     * A description for the snapshot. Set at creation time only.
     */
    description?: string;
    /**
     * Tags to assign to the snapshot. Merged with alchemy auto-tags
     * (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface Snapshot extends Resource<"AWS.EC2.Snapshot", SnapshotProps, {
    /**
     * The ID of the snapshot.
     */
    snapshotId: SnapshotId;
    /**
     * The Amazon Resource Name (ARN) of the snapshot.
     */
    snapshotArn: SnapshotArn;
    /**
     * The ID of the volume the snapshot was created from.
     */
    volumeId: VolumeId;
    /**
     * The size of the volume, in GiB.
     */
    volumeSize: number;
    /**
     * The current state of the snapshot.
     */
    state: ec2.SnapshotState;
    /**
     * The progress of the snapshot, as a percentage (e.g. `"100%"`).
     */
    progress?: string;
    /**
     * Whether the snapshot is encrypted.
     */
    encrypted: boolean;
    /**
     * The KMS key used to protect the snapshot, if encrypted.
     */
    kmsKeyId?: string;
    /**
     * The ID of the AWS account that owns the snapshot.
     */
    ownerId?: string;
}, never, Providers> {
}
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
export declare const Snapshot: import("../../Resource.ts").ResourceClass<Snapshot>;
export declare const SnapshotProvider: () => import("effect/Layer").Layer<Provider.Provider<Snapshot>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Snapshot.d.ts.map