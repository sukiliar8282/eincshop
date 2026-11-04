import type { Credentials } from "@distilled.cloud/aws/Credentials";
import type { Region } from "@distilled.cloud/aws/Region";
import * as ec2 from "@distilled.cloud/aws/ec2";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { InstanceId } from "./Instance.ts";
import type { VolumeId } from "./Volume.ts";
export interface VolumeAttachmentProps {
    /**
     * The ID of the EBS volume to attach. Required. Changing it replaces the
     * attachment.
     */
    volumeId: VolumeId;
    /**
     * The ID of the instance to attach the volume to. Required. Changing it
     * replaces the attachment.
     */
    instanceId: InstanceId;
    /**
     * The device name to expose to the instance, e.g. `/dev/sdf` (Linux) or
     * `xvdf`. Required. Changing it replaces the attachment.
     */
    device: string;
    /**
     * Whether to force-detach the volume on delete if a normal detach does not
     * complete. Forcing can corrupt data if the volume is still mounted — use
     * only when the instance is unresponsive.
     * @default true
     */
    forceDetach?: boolean;
}
export interface VolumeAttachment extends Resource<"AWS.EC2.VolumeAttachment", VolumeAttachmentProps, {
    /**
     * The ID of the attached volume.
     */
    volumeId: VolumeId;
    /**
     * The ID of the instance the volume is attached to.
     */
    instanceId: InstanceId;
    /**
     * The device name exposed to the instance.
     */
    device: string;
    /**
     * The attachment state.
     */
    state: ec2.VolumeAttachmentState;
}, never, Providers> {
}
/**
 * Attaches an EBS {@link Volume} to an EC2 {@link Instance} at a device name.
 * The volume and instance must be in the same Availability Zone. On delete the
 * volume is detached (and force-detached as a fallback) before the resource is
 * removed.
 *
 * This is an existence-style resource — its identity is the
 * `volumeId`/`instanceId`/`device` triple. Changing any of them replaces the
 * attachment.
 *
 * ### Attaching a Volume
 * **Example:** Attach a Volume to an Instance
 * ```typescript
 * const attachment = yield* AWS.EC2.VolumeAttachment("DataAttachment", {
 *   volumeId: volume.volumeId,
 *   instanceId: instance.instanceId,
 *   device: "/dev/sdf",
 * });
 * ```
 *
 * The volume appears to the instance as a block device at `device`. On modern
 * Linux AMIs the kernel may rename `/dev/sdf` to `/dev/xvdf` — check
 * `lsblk` inside the instance. The volume and instance must share an AZ.
 *
 * @resource
 */
export declare const VolumeAttachment: import("../../Resource.ts").ResourceClass<VolumeAttachment>;
export declare const VolumeAttachmentProvider: () => import("effect/Layer").Layer<Provider.Provider<VolumeAttachment>, never, Credentials | HttpClient | Region>;
//# sourceMappingURL=VolumeAttachment.d.ts.map