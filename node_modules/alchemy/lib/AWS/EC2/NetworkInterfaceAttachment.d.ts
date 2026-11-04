import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { InstanceId } from "./Instance.ts";
import type { NetworkInterfaceId } from "./NetworkInterface.ts";
export type NetworkInterfaceAttachmentId<ID extends string = string> = `eni-attach-${ID}`;
export interface NetworkInterfaceAttachmentProps {
    /**
     * The ID of the network interface to attach. Required. Changing it replaces
     * the attachment.
     */
    networkInterfaceId: NetworkInterfaceId;
    /**
     * The ID of the instance to attach the interface to. Required. Changing it
     * replaces the attachment.
     */
    instanceId: InstanceId;
    /**
     * The device index for the interface on the instance (0 is the primary
     * interface). Required. Changing it replaces the attachment.
     */
    deviceIndex: number;
    /**
     * Whether to force-detach the interface on delete if a normal detach does
     * not complete.
     * @default true
     */
    forceDetach?: boolean;
}
export interface NetworkInterfaceAttachment extends Resource<"AWS.EC2.NetworkInterfaceAttachment", NetworkInterfaceAttachmentProps, {
    /**
     * The ID of the attachment.
     */
    attachmentId: NetworkInterfaceAttachmentId;
    /**
     * The ID of the attached network interface.
     */
    networkInterfaceId: NetworkInterfaceId;
    /**
     * The ID of the instance the interface is attached to.
     */
    instanceId: InstanceId;
    /**
     * The device index of the interface on the instance.
     */
    deviceIndex: number;
    /**
     * The attachment status.
     */
    status: ec2.AttachmentStatus;
}, never, Providers> {
}
/**
 * Attaches an {@link NetworkInterface} (ENI) to an EC2 {@link Instance} at a
 * device index. The interface and instance must be in the same Availability
 * Zone. On delete the interface is detached (force-detached as a fallback)
 * before the resource is removed.
 *
 * This is an existence-style resource — its identity is the
 * `networkInterfaceId`/`instanceId`/`deviceIndex` triple. Changing any of them
 * replaces the attachment.
 *
 * ### Attaching a Network Interface
 * **Example:** Attach a Secondary ENI to an Instance
 * ```typescript
 * const attachment = yield* AWS.EC2.NetworkInterfaceAttachment("SecondaryEni", {
 *   networkInterfaceId: eni.networkInterfaceId,
 *   instanceId: instance.instanceId,
 *   deviceIndex: 1,
 * });
 * ```
 *
 * Device index 0 is the instance's primary interface, so secondary interfaces
 * use index 1 and up. The ENI's IPs and security groups now apply to the
 * instance on that interface.
 *
 * @resource
 */
export declare const NetworkInterfaceAttachment: import("../../Resource.ts").ResourceClass<NetworkInterfaceAttachment>;
export declare const NetworkInterfaceAttachmentProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkInterfaceAttachment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=NetworkInterfaceAttachment.d.ts.map