import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { App } from "./App.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* App(...)` and `App(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
export interface VolumeSnapshotProps {
    /**
     * Parent Fly App. Changing it replaces the snapshot (a new snapshot is
     * created on the new App's Volume). There is no delete API for the old
     * snapshot — it follows Volume `snapshot_retention`.
     */
    app: Ref<App>;
    /**
     * Fly Volume id to snapshot (`vol_…`). Changing it replaces the
     * snapshot. Identity is the snapshot `id` returned by a subsequent
     * `listVolumeSnapshots`.
     */
    volumeId: string;
}
export type VolumeSnapshot = Resource<"Fly.VolumeSnapshot", VolumeSnapshotProps, {
    /** Parent Fly App name. */
    appName: string;
    /** Fly Volume id this snapshot belongs to. */
    volumeId: string;
    /** Fly snapshot id (`vs_…`). Identity of the resource. */
    snapshotId: string;
    /** Observed snapshot status, if the API returned one. */
    status: string | undefined;
    /** Content digest of the snapshot. */
    digest: string | undefined;
    /** Snapshot size in bytes, if the API returned one. */
    size: number | undefined;
    /** Source volume size in GB at snapshot time. */
    volumeSize: number | undefined;
    /** Retention in days. */
    retentionDays: number | undefined;
    /** RFC3339 creation timestamp. */
    createdAt: string | undefined;
}, never, Providers>;
/**
 * A Fly.VolumeSnapshot is an on-demand snapshot of a mounted disk.
 *
 * Create is fire-and-forget. Identity is the snapshot id from a
 * subsequent list. Destroy is a no-op. Snapshots follow Volume
 * retention. `nuke` skips this type.
 *
 * @see https://fly.io/docs/machines/api/volumes-resource/
 *
 * ### Create a snapshot
 * Point it at a Volume id from the parent {@link Machine} or
 * {@link Service} (`mounts[0].volumeId`).
 *
 * **Example:** Snapshot a mounted disk
 * ```typescript
 * const box = yield* Fly.Machine("Box", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   mounts: [{ path: "/data", sizeGb: 1 }],
 * });
 *
 * export const Nightly = Fly.VolumeSnapshot("Nightly", {
 *   app: Site,
 *   volumeId: box.mounts[0].volumeId,
 * });
 * ```
 *
 * :::caution[Changing `app` or `volumeId` replaces the snapshot]
 * A new snapshot is created. There is no delete API for the old one.
 * It follows Volume `snapshot_retention`.
 * :::
 *
 * ### Restore
 * Restore into a new disk with `snapshotId` on the mount. Create-only.
 * The new Machine gets a copy. The original Volume is unchanged.
 *
 * **Example:** Restore onto a Machine
 * ```typescript
 * const restored = yield* Fly.Machine("Restored", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   mounts: [{ path: "/data", sizeGb: 1, snapshotId: Nightly.snapshotId }],
 * });
 * ```
 *
 * ### Restore into a Service
 * Pass `snapshotId` on {@link MountVolume}. Same create-only rule.
 *
 * **Example:** Restore onto a Service
 * ```typescript
 * export default class Api extends Fly.Service<Api>()(
 *   "Api",
 *   { app: Site, main: import.meta.url, region: "iad", port: 3000 },
 *   Effect.gen(function* () {
 *     const disk = yield* Fly.MountVolume({
 *       path: "/data",
 *       sizeGb: 1,
 *       snapshotId: Nightly.snapshotId,
 *     });
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.text(disk.path)),
 *     };
 *   }).pipe(Effect.provide(Fly.MountVolumeLive)),
 * ) {}
 * ```
 *
 * @resource
 */
export declare const VolumeSnapshot: import("../Resource.ts").ResourceClass<VolumeSnapshot>;
declare const VolumeSnapshotNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.VolumeSnapshotNotCreated";
} & Readonly<A>;
export declare class VolumeSnapshotNotCreated extends VolumeSnapshotNotCreated_base<{
    appName: string;
    volumeId: string;
}> {
}
declare const VolumeSnapshotRefsMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.VolumeSnapshotRefsMissing";
} & Readonly<A>;
export declare class VolumeSnapshotRefsMissing extends VolumeSnapshotRefsMissing_base<{
    message: string;
}> {
}
export declare const VolumeSnapshotProvider: () => import("effect/Layer").Layer<Provider.Provider<VolumeSnapshot>, never, machines.FlyIoOpContext>;
export {};
//# sourceMappingURL=VolumeSnapshot.d.ts.map