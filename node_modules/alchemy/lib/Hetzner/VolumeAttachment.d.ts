import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Volume(...)` and `Volume(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Volume identity. A `Hetzner.Volume` resource satisfies this via `id`.
 */
export type VolumeAttachmentVolume = {
    readonly id: number;
};
/**
 * Server identity. A `Hetzner.Server` resource satisfies this via
 * `serverId`.
 */
export type VolumeAttachmentServer = {
    readonly serverId: number;
};
export interface VolumeAttachmentProps {
    /**
     * Volume to attach. Accepts a `Hetzner.Volume` or `{ id }`. Changing
     * the Volume replaces the attachment.
     */
    volume: Ref<VolumeAttachmentVolume>;
    /**
     * Server to attach the Volume to. Accepts a `Hetzner.Server` or
     * `{ serverId }`. Changing the Server replaces the attachment.
     */
    server: Ref<VolumeAttachmentServer>;
    /**
     * Auto-mount the Volume after attach. Updating this detaches and
     * re-attaches the Volume so the new value is applied.
     *
     * @default false
     */
    automount?: boolean;
}
export type VolumeAttachment = Resource<"Hetzner.VolumeAttachment", VolumeAttachmentProps, {
    /** Numeric Hetzner Volume ID. */
    volumeId: number;
    /** Numeric Hetzner Server ID the Volume is attached to. */
    serverId: number;
    /**
     * Last-applied automount flag. Hetzner does not expose the live
     * automount state, so this is the desired value from the last
     * successful reconcile.
     */
    automount: boolean;
    /** Device path on the file system (e.g. `/dev/disk/by-id/scsi-…`). */
    linuxDevice: string;
}, never, Providers>;
/**
 * Attaches a Hetzner Cloud Volume to a Server in the same Location.
 * The Volume and Server must already exist. Deleting the attachment
 * detaches the Volume; it does not delete the Volume or the Server.
 *
 * This is an existence-style resource — its identity is the
 * `volume`/`server` pair. Changing either replaces the attachment.
 * `automount` updates in place (detach + re-attach).
 *
 * @see https://docs.hetzner.cloud/reference/cloud#volume-actions-attach-volume-to-a-server
 *
 * ### Attaching a Volume
 * **Example:** Attach a Volume to a Server
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx23",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const volume = yield* Hetzner.Volume("data", {
 *   size: 10,
 *   format: "ext4",
 *   location: "nbg1",
 * });
 * const attachment = yield* Hetzner.VolumeAttachment("data-attach", {
 *   volume,
 *   server,
 * });
 * ```
 *
 * **Example:** Attach with automount
 * ```typescript
 * const attachment = yield* Hetzner.VolumeAttachment("data-attach", {
 *   volume,
 *   server,
 *   automount: true,
 * });
 * ```
 *
 * @resource
 */
export declare const VolumeAttachment: import("../Resource.ts").ResourceClass<VolumeAttachment>;
export declare const VolumeAttachmentProvider: () => import("effect/Layer").Layer<Provider.Provider<VolumeAttachment>, never, Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=VolumeAttachment.d.ts.map