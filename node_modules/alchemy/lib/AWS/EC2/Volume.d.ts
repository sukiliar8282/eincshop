import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
import type { Providers } from "../Providers.ts";
export type VolumeId<ID extends string = string> = `vol-${ID}`;
export declare const VolumeId: <ID extends string>(id: ID) => ID & VolumeId<ID>;
export type VolumeArn = `arn:aws:ec2:${RegionID}:${AccountID}:volume/${VolumeId}`;
export interface VolumeProps {
    /**
     * The Availability Zone in which to create the volume, e.g. `us-east-1a`.
     * Required. An EBS volume is bound to a single AZ; changing it replaces the
     * volume.
     */
    availabilityZone: string;
    /**
     * The size of the volume, in GiB. Required unless you create the volume from
     * a `snapshotId` (in which case it defaults to the snapshot size). The size
     * can be increased in place via `modifyVolume`; decreasing it replaces the
     * volume.
     */
    size?: number;
    /**
     * The volume type.
     * @default "gp3"
     */
    volumeType?: ec2.VolumeType;
    /**
     * The number of I/O operations per second (IOPS). Only valid for `io1`,
     * `io2`, and `gp3` volumes. Mutable in place via `modifyVolume`.
     */
    iops?: number;
    /**
     * The throughput to provision, in MiB/s. Only valid for `gp3` volumes.
     * Mutable in place via `modifyVolume`.
     */
    throughput?: number;
    /**
     * Whether the volume is encrypted. Changing this replaces the volume.
     * @default false
     */
    encrypted?: boolean;
    /**
     * The identifier of the KMS key to use for encryption. Can be a key ID, key
     * ARN, alias name (`alias/my-key`), or alias ARN. Implies `encrypted: true`.
     * Changing this replaces the volume.
     */
    kmsKeyId?: string;
    /**
     * The snapshot from which to create the volume. Changing this replaces the
     * volume.
     */
    snapshotId?: string;
    /**
     * Whether the volume can be attached to multiple instances (Multi-Attach).
     * Only valid for `io1`/`io2` volumes.
     * @default false
     */
    multiAttachEnabled?: boolean;
    /**
     * Tags to assign to the volume. Merged with alchemy auto-tags
     * (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface Volume extends Resource<"AWS.EC2.Volume", VolumeProps, {
    /**
     * The ID of the volume.
     */
    volumeId: VolumeId;
    /**
     * The Amazon Resource Name (ARN) of the volume.
     */
    volumeArn: VolumeArn;
    /**
     * The Availability Zone of the volume.
     */
    availabilityZone: string;
    /**
     * The size of the volume, in GiB.
     */
    size: number;
    /**
     * The volume type.
     */
    volumeType: ec2.VolumeType;
    /**
     * The number of IOPS provisioned for the volume.
     */
    iops?: number;
    /**
     * The throughput provisioned for the volume, in MiB/s.
     */
    throughput?: number;
    /**
     * Whether the volume is encrypted.
     */
    encrypted: boolean;
    /**
     * The KMS key used for encryption, if any.
     */
    kmsKeyId?: string;
    /**
     * The snapshot the volume was created from, if any.
     */
    snapshotId?: string;
    /**
     * Whether Multi-Attach is enabled.
     */
    multiAttachEnabled: boolean;
    /**
     * The current state of the volume.
     */
    state: ec2.VolumeState;
}, never, Providers> {
}
/**
 * An Elastic Block Store (EBS) volume — durable block storage you attach to an
 * EC2 instance via a {@link VolumeAttachment}. Volumes live in a single
 * Availability Zone and persist independently of any instance.
 *
 * Changing `availabilityZone`, `encrypted`, `kmsKeyId`, `snapshotId`, or
 * shrinking `size` replaces the volume. Growing `size` and changing `iops`,
 * `throughput`, or `volumeType` are applied in place via `modifyVolume` (note
 * AWS enforces a 6-hour cooldown between volume modifications).
 *
 * ### Creating a Volume
 * **Example:** Basic gp3 Volume
 * ```typescript
 * const volume = yield* AWS.EC2.Volume("DataVolume", {
 *   availabilityZone: "us-east-1a",
 *   size: 20,
 *   volumeType: "gp3",
 * });
 * ```
 *
 * The minimal volume: a 20 GiB general-purpose `gp3` volume in one AZ. It must
 * be in the same AZ as the instance you attach it to.
 *
 * ### Provisioned Performance
 * **Example:** gp3 with Provisioned IOPS and Throughput
 * ```typescript
 * const fast = yield* AWS.EC2.Volume("FastVolume", {
 *   availabilityZone: "us-east-1a",
 *   size: 100,
 *   volumeType: "gp3",
 *   iops: 6000,
 *   throughput: 250,
 * });
 * ```
 *
 * `gp3` decouples IOPS and throughput from size, so you can provision up to
 * 16,000 IOPS and 1,000 MiB/s independently. Use `io2` for the highest
 * durability and IOPS ceilings.
 *
 * ### Encryption
 * **Example:** Encrypted Volume with a KMS Key
 * ```typescript
 * const secure = yield* AWS.EC2.Volume("SecureVolume", {
 *   availabilityZone: "us-east-1a",
 *   size: 20,
 *   encrypted: true,
 *   kmsKeyId: "alias/my-app-key",
 * });
 * ```
 *
 * Setting `kmsKeyId` implies encryption. Omit it while setting `encrypted:
 * true` to use the account's default EBS KMS key.
 *
 * ### Creating from a Snapshot
 * **Example:** Restore a Volume from a Snapshot
 * ```typescript
 * const restored = yield* AWS.EC2.Volume("RestoredVolume", {
 *   availabilityZone: "us-east-1a",
 *   snapshotId: snapshot.snapshotId,
 * });
 * ```
 *
 * When you create a volume from a snapshot, `size` defaults to the snapshot's
 * size and can only be grown, never shrunk.
 *
 * @resource
 */
export declare const Volume: import("../../Resource.ts").ResourceClass<Volume>;
export declare const VolumeProvider: () => import("effect/Layer").Layer<Provider.Provider<Volume>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Volume.d.ts.map