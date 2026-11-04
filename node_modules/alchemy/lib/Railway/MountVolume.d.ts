import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../Binding.ts";
import type { Resource } from "../Resource.ts";
import type { Volume } from "./Volume.ts";
export interface MountVolumeOptions {
    /**
     * Absolute path inside the container the Volume is mounted at
     * (e.g. `/data`).
     */
    path: string;
}
/**
 * Runtime view of a Volume mounted into a {@link Service} or
 * `Railway.Function`: the path inside the container.
 */
export interface MountedVolume {
    /** Mount path inside the container (same value as {@link MountVolumeOptions.path}). */
    path: string;
}
/**
 * A volume mount injected onto a {@link Service} via {@link MountVolume}.
 * Service reconcile attaches it with `volumeInstanceUpdate`.
 */
export interface MountSpec {
    /** Railway volume id (not the instance id). */
    volumeId: string;
    /** Absolute path inside the container. */
    path: string;
}
/**
 * True for a Railway compute host that accepts {@link ServiceBinding}
 * (`Railway.Service` or {@link Function}).
 */
export declare const isRailwayHost: (value: unknown) => value is Resource<string, any, any, ServiceBinding>;
/**
 * Binding contract accepted by {@link Service} and
 * `Railway.Function` for mounted volumes and injected env.
 */
export interface ServiceBinding {
    env?: Record<string, any>;
    mounts?: MountSpec[];
}
declare const MultipleVolumes_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.MultipleVolumes";
} & Readonly<A>;
/**
 * Railway allows one volume per service. Two `MountVolume`s, or a
 * second {@link Volume} attached via `service`, is this error.
 */
export declare class MultipleVolumes extends MultipleVolumes_base<{
    name: string;
    paths: readonly string[];
    volumeIds: readonly string[];
}> {
}
/** At most one volume on a host. */
export declare const assertHostDisk: (input: {
    name: string;
    mounts: readonly MountSpec[];
}) => Effect.Effect<void, MultipleVolumes>;
/**
 * Mount a Railway.Volume into a {@link Service} or `Railway.Function`.
 *
 * `yield* Railway.MountVolume(volume, { path: "/data" })` inside a
 * Service/Function impl registers `{ mounts: [{ volumeId, path }] }` on
 * the host. Reconcile attaches the volume via `volumeInstanceUpdate`.
 *
 * Railway allows **one volume per service**. A second mount is
 * `Railway.MultipleVolumes`. Railway does not give each replica its
 * own disk.
 *
 *
 * ### Mount into a Service
 * Yield `MountVolume` inside init. Provide {@link MountVolumeLive}.
 * At runtime you get `disk.path`.
 *
 * **Example:** Bind a path
 * ```typescript
 * export default class Api extends Railway.Service<Api>()(
 *   "Api",
 *   { project: Site, main: import.meta.url },
 *   Effect.gen(function* () {
 *     const disk = yield* Railway.MountVolume(Data, { path: "/data" });
 *     const fs = yield* FileSystem.FileSystem;
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const text = yield* fs.readFileString(`${disk.path}/hello.txt`);
 *         return HttpServerResponse.text(text);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Railway.MountVolumeLive)),
 * ) {}
 * ```
 *
 * :::caution[One volume per service]
 * Railway does not attach a disk per replica. Two {@link MountVolume}s
 * on one host fail with {@link MultipleVolumes}.
 * :::
 *
 * @binding
 */
export interface MountVolume extends Binding.Service<MountVolume, "Railway.MountVolume", (volume: Volume, options: MountVolumeOptions) => Effect.Effect<MountedVolume>> {
}
export declare const MountVolume: MountVolume;
export declare const MountVolumeLive: Layer.Layer<MountVolume, never, never>;
export {};
//# sourceMappingURL=MountVolume.d.ts.map