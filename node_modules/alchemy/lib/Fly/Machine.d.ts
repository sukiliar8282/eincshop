import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { App } from "./App.ts";
import type { DiskSpec, MountedDisk, ServiceBinding } from "./MountVolume.ts";
import type { Providers } from "./Providers.ts";
import { type Replica } from "./replicas.ts";
export type { Replica };
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* App(...)` and `App(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
export interface MachineGuest {
    /**
     * CPU kind (`shared`, `performance`, `shared-cpu-1x`, …).
     *
     * @default "shared"
     */
    cpuKind?: string;
    /**
     * Number of CPUs.
     *
     * @default 1
     */
    cpus?: number;
    /**
     * Memory in MB.
     *
     * @default 256
     */
    memoryMb?: number;
    /** GPU kind, if this Machine should have a GPU. */
    gpuKind?: string;
    /** Number of GPUs. */
    gpus?: number;
}
export interface MachineInit {
    /** Process command. */
    cmd?: string[];
    /** Container entrypoint. */
    entrypoint?: string[];
    /** Exec form override. */
    exec?: string[];
    /** Swap size in MB. */
    swapSizeMb?: number;
    /** Allocate a TTY. */
    tty?: boolean;
}
export interface MachineRestart {
    /**
     * Restart policy (`no`, `always`, `on-failure`, `spot-price`).
     */
    policy?: "no" | "always" | "on-failure" | "spot-price";
    /** Max restarts when `policy` is `on-failure`. */
    maxRetries?: number;
}
export interface MachinePort {
    /** Published proxy port. */
    port?: number;
    /** Fly handlers (`http`, `tls`, `pg_tls`, …). */
    handlers?: string[];
    /** Redirect HTTP to HTTPS on this port. */
    forceHttps?: boolean;
    /** Inclusive start of a published port range. */
    startPort?: number;
    /** Inclusive end of a published port range. */
    endPort?: number;
}
/** A health check attached to a Fly service. */
export interface MachineServiceCheck {
    /** Check type. HTTP checks send a request; TCP checks open a connection. */
    type: "http" | "tcp";
    /** Port to check. Usually the service's {@link MachineService.internalPort}. */
    port?: number;
    /** Time between checks, such as `"15s"`. */
    interval?: string;
    /** Maximum time for a check, such as `"2s"`. */
    timeout?: string;
    /** Delay after the Machine starts before checks begin, such as `"30s"`. */
    gracePeriod?: string;
    /** HTTP method for an `http` check. */
    method?: string;
    /** Request path for an `http` check. */
    path?: string;
    /** Request protocol for an `http` check. */
    protocol?: "http" | "https";
    /** Headers sent by an `http` check. */
    headers?: Array<{
        /** Header name. */
        name: string;
        /** Header values. */
        values: string[];
    }>;
    /** Hostname used to validate the certificate for an HTTPS check. */
    tlsServerName?: string;
    /** Skip certificate verification for an HTTPS check. */
    tlsSkipVerify?: boolean;
}
export interface MachineService {
    /**
     * Proxy protocol (`tcp` or `udp`).
     */
    protocol?: string;
    /** Port the process listens on inside the Machine. */
    internalPort?: number;
    /** Published Fly proxy ports. */
    ports?: MachinePort[];
    /** Start this Machine when a request arrives. */
    autostart?: boolean;
    /**
     * Stop or suspend this Machine when idle.
     */
    autostop?: "off" | "stop" | "suspend" | boolean;
    /** Minimum Machines to keep running for this service. */
    minMachinesRunning?: number;
    /** Health checks for this service. */
    checks?: MachineServiceCheck[];
}
export type MachineMount = DiskSpec;
export interface MachineProps {
    /**
     * Parent Fly App. Changing it replaces the Machine.
     */
    app: Ref<App>;
    /**
     * Machine name. Unique per App. If omitted, a unique name is generated
     * from the stack, stage and logical ID. Changing it replaces the Machine.
     */
    name?: string;
    /**
     * Region to start the Machine in (`iad`, `ewr`, `ord`, …). Changing it
     * replaces the Machine.
     *
     * @default "iad"
     */
    region?: string;
    /**
     * Number of Machines to keep running. Fly's proxy load-balances
     * published `services` across them. Each replica gets its own
     * Volume from every {@link mounts} group.
     *
     * @default 1
     */
    count?: number;
    /**
     * Docker image reference. Updated in place via `updateMachine`.
     */
    image: string;
    /**
     * Guest size. Defaults to shared-cpu-1x 256 MB.
     */
    guest?: MachineGuest;
    /**
     * Environment variables. Merged with binding `env`.
     */
    env?: Record<string, string>;
    /**
     * Fly proxy services (HTTP/TCP ports).
     */
    services?: MachineService[];
    /**
     * Disks to attach. Each entry is a Fly volume group: `count`
     * independent Volumes, one mounted on each replica. Also collected
     * from `MountVolume` bindings.
     */
    mounts?: MachineMount[];
    /**
     * Init overrides (`cmd`, `entrypoint`, `exec`, swap, TTY).
     */
    init?: MachineInit;
    /**
     * User metadata. Alchemy ownership keys (`alchemy.stack` /
     * `alchemy.stage` / `alchemy.id` / `alchemy.type` /
     * `alchemy.replica`) are always merged.
     */
    metadata?: Record<string, string>;
    /**
     * Destroy the Machine when its main process exits.
     *
     * @default false
     */
    autoDestroy?: boolean;
    /**
     * Restart policy after the main process exits.
     */
    restart?: MachineRestart;
    /**
     * Create or update without launching the Machine.
     *
     * @default false
     */
    skipLaunch?: boolean;
    /**
     * Minimum app-secrets version the Machine must see.
     */
    minSecretsVersion?: number;
}
export type MachineImageRef = {
    registry?: string;
    repository?: string;
    tag?: string;
    digest?: string;
};
export type Machine = Resource<"Fly.Machine", MachineProps, {
    /** Parent Fly App name. */
    appName: string;
    /** Fly Machine id of replica 0. */
    machineId: string;
    /** Fly Machine ids of every replica. */
    machineIds: string[];
    /** Machine name of replica 0 (unique per App). */
    name: string;
    /** Region the Machines are running in. */
    region: string;
    /** Observed state of replica 0 (`created`, `started`, `stopped`, …). */
    state: string;
    /** Fly instance / version id of replica 0, if the API returned one. */
    instanceId: string | undefined;
    /** Internal 6PN address of replica 0. */
    privateIp: string | undefined;
    /** Parsed image reference from Fly. */
    imageRef: MachineImageRef | undefined;
    /** Observed guest size. */
    guest: MachineGuest | undefined;
    /**
     * Public `https://{appName}.fly.dev` URL when this Machine publishes
     * a proxy service. `undefined` when no services are configured.
     */
    url: string | undefined;
    /** Number of Machines in the replica set. */
    count: number;
    /** Disks mounted on replica 0. */
    mounts: MountedDisk[];
    /** Every replica in the set. */
    replicas: Replica[];
}, ServiceBinding, Providers>;
/**
 * A Fly.Machine is a Firecracker VM running a container image.
 *
 * Prefer a {@link Service} when the program is Effect. A Service is
 * effectful, supports bindings, and scales with `count`. Alchemy builds
 * and pushes the image. Use `Fly.Machine` when you already have an image.
 *
 * @see https://fly.io/docs/machines/api/machines-resource/
 *
 * ### Prefer a Service
 * Declare a {@link Service} when you own the program. Alchemy bundles
 * `main`, builds `linux/amd64`, and pushes to `registry.fly.io`.
 *
 * **Example:** Effect HTTP service
 * ```typescript
 * export default class Api extends Fly.Service<Api>()(
 *   "Api",
 *   { app: Site, main: import.meta.url, region: "iad", count: 3, port: 3000 },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.text("hello")),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * ### Launch a Machine
 * The parent is an {@link App}. Pin a region and an image. Guest
 * defaults to shared-cpu 1× / 256 MB. `image` updates in place.
 *
 * **Example:** Nginx
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 * });
 * ```
 *
 * :::caution[Changing `app` replaces the Machine]
 * The new App gets a new Machine. The old one is deleted.
 * :::
 *
 * ### A stable name
 * Machine names are unique per App. Omit `name` and Alchemy generates
 * one from the stack, stage, and logical ID.
 *
 * **Example:** Explicit name
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   name: "web",
 *   region: "iad",
 *   image: "nginx:alpine",
 * });
 * ```
 *
 * :::caution[Changing `name` replaces the Machine]
 * Fly cannot rename a Machine. Alchemy creates the new name, then
 * deletes the old one.
 * :::
 *
 * ### Region
 * Fly Machines live in a region. Default is `iad`. See
 * [Regions](/fly/compute/regions) for the list of codes.
 *
 * **Example:** Pin a region
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "ewr",
 *   image: "nginx:alpine",
 * });
 * ```
 *
 * :::caution[Changing `region` replaces the Machine]
 * The Machine is created in the new region. The old one is deleted.
 * :::
 *
 * ### Guest size
 * `guest` is CPU kind, CPU count, and memory. Default is shared-cpu,
 * 1 CPU, 256 MB. Guest updates in place.
 *
 * **Example:** Shared CPU
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   guest: { cpuKind: "shared", cpus: 1, memoryMb: 256 },
 * });
 * ```
 *
 * ### GPU
 * Set `gpuKind` and `gpus` on `guest` when the Machine should have a
 * GPU.
 *
 * **Example:** GPU guest
 * ```typescript
 * const worker = yield* Fly.Machine("Worker", {
 *   app: Site,
 *   region: "iad",
 *   image: "my-gpu-image:tag",
 *   guest: {
 *     cpuKind: "performance",
 *     cpus: 2,
 *     memoryMb: 4096,
 *     gpuKind: "a10",
 *     gpus: 1,
 *   },
 * });
 * ```
 *
 * ### Environment variables
 * `env` is merged onto the Machine. Fly also injects App
 * {@link Secret} values as env vars unless the Machine skips secrets.
 *
 * **Example:** Set env
 * ```typescript
 * const worker = yield* Fly.Machine("Worker", {
 *   app: Site,
 *   region: "iad",
 *   image: "my-image:tag",
 *   env: { LOG_LEVEL: "info" },
 * });
 * ```
 *
 * ### Publish a proxy service
 * `services` publishes ports on Fly's proxy. `{app}.fly.dev` over IPv4
 * still needs an {@link IpAssignment} on the parent App. `url` is
 * `https://{appName}.fly.dev` when a proxy service is configured.
 *
 * Handlers are `http`, `tls`, `pg_tls`, and similar. Set `forceHttps`
 * to redirect HTTP to HTTPS. Use `startPort` / `endPort` for a
 * published range.
 *
 * Omit `services` (or pass `[]`) for a process that should not be
 * reachable from the internet.
 *
 * **Example:** HTTP on port 80
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   services: [
 *     {
 *       protocol: "tcp",
 *       internalPort: 80,
 *       ports: [
 *         { port: 80, handlers: ["http"], forceHttps: true },
 *         { port: 443, handlers: ["tls", "http"] },
 *       ],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Service health checks
 * Add HTTP or TCP `checks` to a service. Fly uses their results to
 * determine whether the service is ready to receive traffic.
 *
 * **Example:** HTTP readiness check
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   services: [
 *     {
 *       protocol: "tcp",
 *       internalPort: 80,
 *       ports: [{ port: 80, handlers: ["http"] }],
 *       checks: [
 *         {
 *           type: "http",
 *           port: 80,
 *           method: "GET",
 *           path: "/health",
 *           protocol: "http",
 *           interval: "15s",
 *           timeout: "2s",
 *           gracePeriod: "30s",
 *           headers: [{ name: "X-Health-Check", values: ["alchemy"] }],
 *         },
 *       ],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Autostart and autostop
 * `autostart` starts the Machine when a request arrives. `autostop` is
 * `"off"`, `"stop"`, `"suspend"`, or a boolean. `minMachinesRunning`
 * keeps that many Machines up for the service.
 *
 * Autostop only stops Machines that already exist. It does not mint
 * new ones. Yield more Machine resources to size the pool.
 *
 * **Example:** Stop when idle
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   services: [
 *     {
 *       protocol: "tcp",
 *       internalPort: 80,
 *       autostart: true,
 *       autostop: "stop",
 *       minMachinesRunning: 0,
 *       ports: [{ port: 80, handlers: ["http"] }],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Scale up
 * Each Machine resource is one VM. Yield another Machine to add
 * capacity. Fly's proxy load-balances published `services` across
 * them.
 *
 * A {@link Service} still scales with `count`. That is one program,
 * many Machines.
 *
 * **Example:** Two Machines
 * ```typescript
 * const web1 = yield* Fly.Machine("Web1", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   services: [
 *     {
 *       protocol: "tcp",
 *       internalPort: 80,
 *       ports: [{ port: 80, handlers: ["http"] }],
 *     },
 *   ],
 * });
 *
 * const web2 = yield* Fly.Machine("Web2", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   services: [
 *     {
 *       protocol: "tcp",
 *       internalPort: 80,
 *       ports: [{ port: 80, handlers: ["http"] }],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Scale down
 * Remove a Machine from the stack. The next deploy deletes it.
 *
 * **Example:** Drop Web2
 * ```diff
 *   const web1 = yield* Fly.Machine("Web1", {
 *     app: Site,
 *     region: "iad",
 *     image: "nginx:alpine",
 *   });
 * -
 * - const web2 = yield* Fly.Machine("Web2", {
 * -   app: Site,
 * -   region: "iad",
 * -   image: "nginx:alpine",
 * - });
 * ```
 *
 * ### Attach a disk
 * Pass disks as `mounts`. Alchemy creates a Volume in the Machine's
 * app and region. A Volume attaches to one Machine. There is no
 * standalone Volume resource.
 *
 * `sizeGb` can grow in place. Shrinking is not supported. Encryption,
 * filesystem type, `snapshotId`, and `sourceVolumeId` are create-only.
 * See {@link MountVolume} for the full disk spec. From a Service,
 * prefer `MountVolume` so the path is part of the binding graph.
 *
 * **Example:** Mount `/data`
 * ```typescript
 * const box = yield* Fly.Machine("Box", {
 *   app: Site,
 *   region: "iad",
 *   image: "postgres:16",
 *   mounts: [{ path: "/data", sizeGb: 10 }],
 * });
 * ```
 *
 * ### Init
 * `init` overrides `cmd`, `entrypoint`, `exec`, swap, and TTY. Updates
 * in place.
 *
 * **Example:** Custom command
 * ```typescript
 * const box = yield* Fly.Machine("Box", {
 *   app: Site,
 *   region: "iad",
 *   image: "postgres:16",
 *   init: { cmd: ["postgres", "-c", "shared_buffers=256MB"] },
 * });
 * ```
 *
 * ### Restart policy
 * `restart.policy` is `"no"`, `"always"`, `"on-failure"`, or
 * `"spot-price"`. `maxRetries` applies when the policy is
 * `"on-failure"`. Updates in place.
 *
 * **Example:** Always restart
 * ```typescript
 * const worker = yield* Fly.Machine("Worker", {
 *   app: Site,
 *   region: "iad",
 *   image: "my-image:tag",
 *   restart: { policy: "always" },
 * });
 * ```
 *
 * ### Destroy on exit
 * `autoDestroy: true` tears the Machine down when its main process
 * exits. Default is `false`.
 *
 * **Example:** One-shot Machine
 * ```typescript
 * const job = yield* Fly.Machine("Job", {
 *   app: Site,
 *   region: "iad",
 *   image: "my-job:tag",
 *   autoDestroy: true,
 *   restart: { policy: "no" },
 * });
 * ```
 *
 * ### Skip launch
 * `skipLaunch: true` creates or updates the config without starting
 * the Machine. Default is `false`. Reconcile otherwise waits until
 * the Machine is `started`.
 *
 * **Example:** Config only
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   skipLaunch: true,
 * });
 * ```
 *
 * ### Metadata
 * User keys on `metadata` merge with Alchemy ownership keys
 * (`alchemy.stack`, `alchemy.stage`, `alchemy.id`, `alchemy.type`,
 * `alchemy.replica`). Those ownership keys are always written so
 * `list()` can find owned Machines. Fly Apps have no labels.
 *
 * **Example:** User metadata
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   metadata: { role: "edge" },
 * });
 * ```
 *
 * ### Secrets version
 * `minSecretsVersion` waits until the Machine has seen at least that
 * App secrets version. Use it after rotating a {@link Secret} if the
 * process must start with the new value.
 *
 * **Example:** Wait for secrets
 * ```typescript
 * const web = yield* Fly.Machine("Web", {
 *   app: Site,
 *   region: "iad",
 *   image: "nginx:alpine",
 *   minSecretsVersion: 2,
 * });
 * ```
 *
 * @resource
 */
export declare const Machine: import("../Resource.ts").ResourceClass<Machine>;
declare const MachineNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.MachineNotCreated";
} & Readonly<A>;
export declare class MachineNotCreated extends MachineNotCreated_base<{
    name: string;
    appName: string;
}> {
}
declare const MachineAppNotResolved_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.MachineAppNotResolved";
} & Readonly<A>;
export declare class MachineAppNotResolved extends MachineAppNotResolved_base<{
    message: string;
}> {
}
export declare const MachineProvider: () => import("effect/Layer").Layer<Provider.Provider<Machine>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | import("@distilled.cloud/fly-io").FlyIoOpContext>;
//# sourceMappingURL=Machine.d.ts.map