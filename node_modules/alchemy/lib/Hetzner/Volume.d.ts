import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type VolumeFormat = "ext4" | "xfs";
export type VolumeStatus = "available" | "creating";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Server(...)` and `Server(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Server identity a Volume can attach to at create time. Accepts a
 * `Hetzner.Server` resource or a `{ serverId }` stub.
 */
export type VolumeServer = {
    readonly serverId: number;
};
export interface VolumeProps {
    /**
     * Size of the Volume in GB. Minimum 10, maximum 10240. Increasing size
     * updates in place (Hetzner cannot shrink a Volume — decreasing it
     * replaces).
     */
    size: number;
    /**
     * Filesystem to format on create. One of `ext4` or `xfs`. Cannot be
     * changed after creation — changing it replaces the Volume.
     */
    format?: VolumeFormat;
    /**
     * Location to create the Volume in (`nbg1`, `fsn1`, `hel1`, …). Required
     * unless `server` is set (the Volume is then created in the Server's
     * location). Cannot be changed after creation.
     *
     * @default "nbg1"
     */
    location?: string;
    /**
     * Volume name. Must be unique per project, 1–64 characters, alphanumeric
     * with dashes/underscores/dots, starting and ending alphanumeric. If
     * omitted, a unique name is generated from the stack, stage and logical
     * ID.
     */
    name?: string;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack` /
     * `alchemy.stage` / `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
    /**
     * Server to attach the Volume to at create time. Accepts a
     * `Hetzner.Server` or `{ serverId }`. Location may be omitted when this
     * is set. Subsequent attach/detach is reconciled from the observed
     * server.
     */
    server?: Ref<VolumeServer>;
    /**
     * Auto-mount the Volume after attach. Only used when `server` is set.
     *
     * @default false
     */
    automount?: boolean;
}
export type Volume = Resource<"Hetzner.Volume", VolumeProps, {
    /** Numeric Hetzner Volume ID. */
    id: number;
    /** Volume name (unique per project). */
    name: string;
    /** Size in GB. */
    size: number;
    /** Filesystem if formatted on creation. */
    format: VolumeFormat | undefined;
    /** Location name (`nbg1`, `fsn1`, …). */
    location: string;
    /** Numeric location ID. */
    locationId: number;
    /** Device path on the file system (e.g. `/dev/disk/by-id/scsi-…`). */
    linuxDevice: string;
    /** Volume status. */
    status: VolumeStatus;
    /** Attached Server ID, or `null` if unattached. */
    serverId: number | null;
    /** RFC3339 creation timestamp. */
    created: string;
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
}, never, Providers>;
/**
 * A Hetzner Cloud Volume — a network block device that can be attached to
 * a Server in the same Location. Unattached Volumes are valid; pass
 * `server` to attach at create time.
 *
 * Size can grow in place (min 10 GB). Format and location are immutable
 * (changing either replaces the Volume). Hetzner cannot shrink a Volume.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#volumes
 *
 * ### Creating a Volume
 * **Example:** Unattached Volume
 * ```typescript
 * const volume = yield* Hetzner.Volume("data", {
 *   size: 10,
 *   format: "ext4",
 *   location: "nbg1",
 * });
 * ```
 *
 * **Example:** Named Volume with labels
 * ```typescript
 * const volume = yield* Hetzner.Volume("data", {
 *   name: "app-data",
 *   size: 20,
 *   format: "xfs",
 *   location: "nbg1",
 *   labels: { role: "db" },
 * });
 * ```
 *
 * ### Attaching to a Server
 * **Example:** Create-time attach
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx22",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const volume = yield* Hetzner.Volume("data", {
 *   size: 10,
 *   format: "ext4",
 *   server,
 *   automount: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Volume: import("../Resource.ts").ResourceClass<Volume>;
export declare const VolumeProvider: () => import("effect/Layer").Layer<Provider.Provider<Volume>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Volume.d.ts.map