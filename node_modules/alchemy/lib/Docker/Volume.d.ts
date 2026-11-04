import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { Docker } from "./Docker.ts";
import type { Providers } from "./Providers.ts";
export interface VolumeLabel {
    /** Label name. */
    name: string;
    /** Label value. */
    value: string;
}
export interface VolumeProps {
    /**
     * Docker volume name.
     *
     * @default Generated from stack, stage, logical id, and instance id.
     */
    name?: string;
    /** Volume driver. @default "local" */
    driver?: string;
    /** Driver-specific options. */
    driverOpts?: Record<string, string>;
    /** Custom metadata labels. */
    labels?: Record<string, string>;
    /** Docker context name or context resource. */
    context?: Docker.ContextRef;
}
export interface Volume extends Resource<"Docker.Volume", VolumeProps, {
    /** Docker volume name. */
    id: string;
    /** Docker volume name. */
    name: string;
    /** Volume driver. */
    driver: string;
    /** Driver-specific options reported by Docker. */
    driverOpts: Record<string, string>;
    /** Labels reported by Docker. */
    labels: Record<string, string>;
    /** Host mountpoint path. */
    mountpoint?: string;
    /** Creation timestamp in milliseconds since epoch. */
    createdAt: number;
}, never, Providers> {
}
/**
 * A Docker volume managed through the active Docker context.
 *
 * Pre-existing same-name volumes are treated as foreign until the engine is
 * allowed to adopt them with `--adopt` or `adopt(true)`.
 *
 *
 * ### Creating Volumes
 * **Example:** Basic volume
 * ```typescript
 * const data = yield* Docker.Volume("data", {
 *   name: "app-data",
 * });
 * ```
 *
 * **Example:** PostgreSQL data volume
 * ```typescript
 * const data = yield* Docker.Volume("postgres-data");
 * ```
 *
 * **Example:** Driver options and labels
 * ```typescript
 * const data = yield* Docker.Volume("db-data", {
 *   driver: "local",
 *   driverOpts: {
 *     type: "nfs",
 *     o: "addr=10.0.0.1,rw",
 *     device: ":/path/to/dir",
 *   },
 *   labels: {
 *     "com.example.usage": "database",
 *   },
 * });
 * ```
 *
 * ### Docker Context
 * **Example:** Create a volume in a named Docker context
 * ```typescript
 * const data = yield* Docker.Volume("data", {
 *   name: "app-data",
 *   context: "remote-build",
 * });
 * ```
 *
 * @resource
 */
export declare const Volume: import("../Resource.ts").ResourceClass<Volume>;
export declare const VolumeProvider: () => import("effect/Layer").Layer<Provider.Provider<Volume>, never, Docker | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export declare const toVolumeAttributes: (info: Docker.Volume) => Volume["Attributes"];
//# sourceMappingURL=Volume.d.ts.map