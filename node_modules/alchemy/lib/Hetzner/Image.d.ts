import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type ImageType = "snapshot" | "backup";
export type ImageStatus = "available" | "creating" | "unavailable";
export type ImageArchitecture = "x86" | "arm";
export type ImageOsFlavor = "ubuntu" | "centos" | "debian" | "fedora" | "rocky" | "alma" | "opensuse" | "unknown";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Server(...)` and `Server(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Server identity an Image is snapshotted from. Accepts a `Hetzner.Server`
 * resource or a `{ serverId }` stub. Stock (system/app) Images are not
 * managed here — look those up with `Hetzner.findImage`.
 */
export type ImageServer = {
    readonly serverId: number;
};
export interface ImageProps {
    /**
     * Server to snapshot. Required on create. Changing the source Server
     * replaces the Image (Hetzner cannot re-snapshot onto an existing Image).
     * Accepts a `Hetzner.Server` or `{ serverId }`.
     */
    server: Ref<ImageServer>;
    /**
     * Human-readable description. Snapshots have no unique `name` (that
     * field is only set on system Images). If omitted, a unique description
     * is generated from the stack, stage and logical ID.
     */
    description?: string;
    /**
     * Image type. Snapshots are independent of the source Server and billed
     * per GB. Backups are bound to the Server (and deleted with it) and
     * require backups to be enabled. Convert a backup to a snapshot in
     * place; snapshot → backup replaces.
     *
     * @default "snapshot"
     */
    type?: ImageType;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack` /
     * `alchemy.stage` / `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
    /**
     * Prevent the Image from being deleted via the API. Only valid on
     * snapshots.
     *
     * @default false
     */
    deleteProtection?: boolean;
}
export type Image = Resource<"Hetzner.Image", ImageProps, {
    /** Numeric Hetzner Image ID. */
    id: number;
    /** Image type (`snapshot` or `backup`). */
    type: ImageType;
    /** Image status. */
    status: ImageStatus;
    /**
     * Unique identifier. Only set for system Images — snapshots and
     * backups are `null`.
     */
    name: string | null;
    /** Human-readable description. */
    description: string;
    /**
     * Size of the Image file in Hetzner storage in GB. Relevant for
     * snapshot billing. `null` while the Image is still creating.
     */
    imageSize: number | null;
    /** Size of the disk contained in the Image in GB. */
    diskSize: number;
    /** RFC3339 creation timestamp. */
    created: string;
    /** ID of the Server this Image was created from, or `null`. */
    createdFromId: number | null;
    /** Server name at snapshot time, or `null`. */
    createdFromName: string | null;
    /**
     * Server ID this Image is bound to. Only set for `backup` Images.
     */
    boundTo: number | null;
    /** Flavor of operating system contained in the Image. */
    osFlavor: ImageOsFlavor;
    /** Operating system version, or `null`. */
    osVersion: string | null;
    /** Whether rapid deploy of the Image is available. */
    rapidDeploy: boolean | undefined;
    /** Whether delete protection is enabled. */
    deleteProtection: boolean;
    /** RFC3339 deprecation timestamp, or `null`. */
    deprecated: string | null;
    /** CPU architecture compatible with the Image. */
    architecture: ImageArchitecture;
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
}, never, Providers>;
/**
 * A Hetzner Cloud custom Image — a snapshot (or backup) of a Server's
 * disk. Stock system/app Images (`ubuntu-24.04`, …) are Catalog lookups
 * via `Hetzner.findImage`, not this resource.
 *
 * Snapshots are created with `POST /servers/{id}/actions/create_image`
 * and billed per GB. Description, labels, delete protection, and
 * backup→snapshot conversion update in place. Changing the source Server
 * replaces the Image.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#images
 *
 * ### Creating a Snapshot
 * **Example:** Snapshot from a Server
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx22",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const image = yield* Hetzner.Image("golden", {
 *   server,
 *   description: "golden-web",
 *   labels: { role: "golden" },
 * });
 * ```
 *
 * **Example:** Snapshot with generated description
 * ```typescript
 * const image = yield* Hetzner.Image("backup", {
 *   server: { serverId: 42 },
 * });
 * ```
 *
 * ### Updating a Snapshot
 * **Example:** Description, labels, and protection
 * ```typescript
 * const image = yield* Hetzner.Image("golden", {
 *   server,
 *   description: "golden-web-v2",
 *   labels: { role: "golden", env: "prod" },
 *   deleteProtection: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Image: import("../Resource.ts").ResourceClass<Image>;
export declare const ImageProvider: () => import("effect/Layer").Layer<Provider.Provider<Image>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Image.d.ts.map