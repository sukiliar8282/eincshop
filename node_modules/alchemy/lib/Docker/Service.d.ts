import * as Redacted from "effect/Redacted";
import type * as rolldown from "rolldown";
import { Platform, type Main, type PlatformProps } from "../Platform.ts";
import * as Provider from "../Provider.ts";
import type { Resource } from "../Resource.ts";
import { type HostRuntimeContext, type ServerHost } from "../Server/Process.ts";
import { Docker } from "./Docker.ts";
import type { Providers } from "./Providers.ts";
export interface ServicePropsBase extends PlatformProps {
    /**
     * Service name.
     *
     * @default Generated from stack, stage, logical id, and instance id.
     */
    name?: string;
    /**
     * The engine the service is deployed to: a Docker context name, a
     * `Docker.Context` resource, or a `Docker.Swarm` — passing the swarm also
     * orders the service after the swarm is initialized.
     */
    context?: Docker.EngineRef;
    /** Entrypoint command passed after the image. */
    command?: string[];
    /** Additional args appended after `command`. */
    args?: string[];
    /** Environment variables. Use Redacted for secrets. */
    environment?: Record<string, string | Redacted.Redacted<string>>;
    /**
     * Environment variables injected by the platform (bound `Config` values and
     * future bindings). Merged after `environment`; usually not set directly.
     */
    env?: Record<string, any>;
    /** Overlay networks attached to this service. */
    networks?: Array<string | Service.NetworkAttachment>;
    /** Published port mappings. */
    ports?: Service.PortMapping[];
    /**
     * Service discovery endpoint mode.
     *
     * @default "vip"
     */
    endpointMode?: "vip" | "dnsrr";
    /**
     * Desired number of service replicas.
     *
     * @default 1
     */
    replicas?: number;
    /** Placement controls for task scheduling. */
    placement?: Service.Placement;
    /** Deprecated alias for `placement.constraints`. */
    constraints?: string[];
    /** Rolling update strategy for service updates. */
    updateConfig?: Service.RolloutConfig;
    /** Rollback strategy applied when updates fail. */
    rollbackConfig?: Service.RolloutConfig;
    /** Task restart behavior. */
    restartPolicy?: Service.RestartPolicy;
    /** Container healthcheck for service tasks. */
    healthcheck?: Service.Healthcheck;
    /** Grace period before force-killing a task during shutdown, e.g. `"30s"`. */
    stopGracePeriod?: string;
    /** Volume or bind mounts. */
    volumes?: Service.VolumeMapping[];
    /** Swarm secrets mounted into task containers. */
    secrets?: Service.SecretRef[];
    /** Swarm configs mounted into task containers. */
    configs?: Service.ConfigRef[];
    /**
     * Mount task root filesystem read-only.
     *
     * @default false
     */
    readOnlyRootFs?: boolean;
    /**
     * Service labels. Alchemy's internal ownership labels are added
     * automatically.
     */
    labels?: Record<string, string>;
}
/**
 * Run a pre-built image: a registry reference or a Docker image resource
 * (`Docker.Image` / `Docker.RemoteImage`).
 */
export interface ImageServiceProps extends ServicePropsBase {
    /** Docker image reference or Docker image resource. */
    image: Service.Image;
    main?: undefined;
}
/**
 * Bundle an inline Effect program (`main`) into a generated image built
 * against the service's Docker context. The optional `image` is the
 * environment base (`FROM`) and must be able to run the bun runtime.
 */
export interface BundledServiceProps extends ServicePropsBase {
    /**
     * Module entrypoint for the bundled program. This should typically be
     * `import.meta.url` (or `import.meta.filename`) from an inline Effect
     * program.
     */
    main: string;
    /**
     * Environment image used as the generated Dockerfile's `FROM`. Must be
     * able to run the bun runtime.
     *
     * @default "oven/bun:1"
     */
    image?: string;
    /**
     * Container port the bundled HTTP server listens on. Baked into the image
     * as `ENV PORT` + `EXPOSE`; publish it to the swarm ingress with `ports`.
     */
    port?: number;
    /**
     * Named export to load from `main`.
     *
     * @default "default"
     */
    handler?: string;
    /** Bundler configuration for the entrypoint. */
    build?: {
        input?: Partial<rolldown.InputOptions>;
        output?: Partial<rolldown.OutputOptions>;
    };
}
/**
 * Service props — the image comes from exactly one of two sources, flat on
 * the props: `image` (a pre-built reference) or `main` (a bundled Effect
 * program).
 */
export type ServiceProps = ImageServiceProps | BundledServiceProps;
export declare namespace Service {
    type Image = string | {
        imageRef: string;
    };
    interface PortMapping {
        /** Published port on the swarm node. Omit to let Swarm assign one dynamically. */
        external?: number;
        /** Container port receiving traffic. */
        internal: number;
        /**
         * Protocol used for the mapping.
         *
         * @default "tcp"
         */
        protocol?: "tcp" | "udp";
        /**
         * Publish through the swarm routing mesh (`ingress`) or directly on each
         * node (`host`).
         *
         * @default "ingress"
         */
        mode?: "ingress" | "host";
    }
    interface VolumeMapping {
        /** Host path or named volume source. */
        hostPath: string;
        /** Container path. */
        containerPath: string;
        /**
         * Mount read-only.
         *
         * @default false
         */
        readOnly?: boolean;
    }
    interface NetworkAttachment {
        /** Network name. */
        name: string;
        /** Network aliases for the service's tasks. */
        aliases?: string[];
    }
    interface Placement {
        /** Placement constraints, e.g. `"node.role==worker"`. */
        constraints?: string[];
        /** Placement preferences, e.g. `"spread=node.labels.zone"`. */
        preferences?: string[];
        /** Maximum number of replicas per swarm node. */
        maxReplicasPerNode?: number;
    }
    interface RolloutConfig {
        /** Number of tasks updated simultaneously. */
        parallelism?: number;
        /** Delay between task updates, e.g. `"10s"`. */
        delay?: string;
        /** Duration to monitor each updated task for failure, e.g. `"30s"`. */
        monitor?: string;
        /** Action on update failure. */
        failureAction?: "pause" | "continue" | "rollback";
        /** Failure ratio tolerated during an update. */
        maxFailureRatio?: number;
        /** Operation order during updates. */
        order?: "stop-first" | "start-first";
    }
    interface RestartPolicy {
        /** Condition under which tasks restart. */
        condition?: "none" | "on-failure" | "any";
        /** Delay between restart attempts, e.g. `"5s"`. */
        delay?: string;
        /** Maximum restart attempts before giving up. */
        maxAttempts?: number;
        /** Window used to evaluate the restart policy, e.g. `"120s"`. */
        window?: string;
    }
    interface Healthcheck {
        /** Command to run for health checks. */
        cmd: string[] | string;
        /** Time between checks, e.g. `"30s"`. */
        interval?: string;
        /** Maximum time a check may run, e.g. `"5s"`. */
        timeout?: string;
        /** Consecutive failures before unhealthy. */
        retries?: number;
        /** Startup grace period, e.g. `"30s"`. */
        startPeriod?: string;
    }
    interface SecretRef {
        /** Swarm secret name. */
        source: string;
        /** Target file name in `/run/secrets/`. Defaults to `source`. */
        target?: string;
        /** File owner uid. */
        uid?: string;
        /** File owner gid. */
        gid?: string;
        /** File mode, e.g. `0o400`. */
        mode?: number | string;
    }
    interface ConfigRef {
        /** Swarm config name. */
        source: string;
        /** Target path in the container. Defaults to `/<source>`. */
        target?: string;
        /** File owner uid. */
        uid?: string;
        /** File owner gid. */
        gid?: string;
        /** File mode, e.g. `0o444`. */
        mode?: number | string;
    }
}
export interface Service extends Resource<"Docker.Service", ServiceProps, {
    /** Swarm service id. */
    id: string;
    /** Swarm service name. */
    name: string;
    /** Docker context the service is deployed to. */
    context?: string;
    /** Image reference the service runs. */
    image: string;
    /** Desired number of replicas. */
    replicas: number;
    /** Network ids the service's tasks attach to. */
    networks: string[];
    /** Published port mappings reported by Swarm. */
    ports: Service.PortMapping[];
    /** Service labels reported by Swarm. */
    labels: Record<string, string>;
    /** Service discovery endpoint mode. */
    endpointMode: "vip" | "dnsrr";
    /** Creation timestamp in milliseconds since epoch. */
    createdAt: number;
    /** Last update timestamp in milliseconds since epoch. */
    updatedAt: number;
    /** Content hash of the bundled program's image (`main` form only). */
    code?: {
        /** Content hash of the bundled program's image. */
        hash: string;
    };
}, never, Providers> {
}
/** Services available to an effectful `Service` impl at init time. */
export type ServiceServices = ServerHost;
/**
 * The impl shape for an effectful `Service`: a long-running server returning
 * `{ fetch }` (plus optional RPC methods).
 */
export type ServiceShape = Main<ServiceServices>;
export interface ServiceRuntimeContext extends HostRuntimeContext {
    readonly Type: "Docker.Service";
}
/**
 * A Docker Swarm service: N replicas of a container kept alive by the swarm,
 * deployed through the active (or a named) Docker context.
 *
 * The target engine must be a swarm manager — `Service` wraps
 * `docker service`, swarm mode's orchestration API. Declare the swarm with
 * `Docker.Swarm` and pass it as `context` so the service deploys after the
 * swarm exists; for a plain single container on a non-swarm daemon use
 * `Docker.Container` instead.
 *
 * The service's image comes from one of two sources:
 *
 * - `image` — run a pre-built reference (a registry ref, or a `Docker.Image`
 *   / `Docker.RemoteImage` resource).
 * - `main` — bundle an inline Effect program into a generated bun image,
 *   built directly against the service's Docker context. The impl returns
 *   `{ fetch }` and may register background loops via `ServerHost.run` —
 *   the same effectful platform shape as `AWS.ECS.Service`.
 *
 * The bundled image is content-addressed and only rebuilt when the program
 * (or its generated Dockerfile) changes. It is built on the target engine's
 * local store — single-node swarms run it as-is; multi-node swarms need the
 * image on a registry every node can reach (build with `Docker.Image` +
 * `registry` and pass the pushed ref as `image` instead).
 *
 * Only replicated services are supported. Configuration changes replace the
 * service (delete-then-create); swarm tasks are stateless, so replacement is
 * cheap and avoids partially-applied `service update` drift.
 * ### Creating Services
 * **Example:** Replicated Nginx
 * ```typescript
 * const swarm = yield* Docker.Swarm("swarm");
 * const web = yield* Docker.Service("web", {
 *   context: swarm,
 *   image: "nginx:alpine",
 *   replicas: 3,
 *   ports: [{ external: 8080, internal: 80 }],
 * });
 * ```
 *
 * **Example:** Run a Built Image
 * ```typescript
 * const image = yield* Docker.Image("app-image", {
 *   build: { context: "./app" },
 * });
 * const app = yield* Docker.Service("app", {
 *   context: swarm,
 *   image,
 *   replicas: 2,
 * });
 * ```
 *
 * ### Effectful Services
 * **Example:** Inline Effect Server
 * ```typescript
 * const swarm = yield* Docker.Swarm("swarm");
 * const api = yield* Docker.Service(
 *   "Api",
 *   {
 *     context: swarm,
 *     main: import.meta.url,
 *     port: 3000,
 *     ports: [{ external: 8080, internal: 3000 }],
 *     replicas: 2,
 *   },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.gen(function* () {
 *         return yield* HttpServerResponse.json({ ok: true });
 *       }),
 *     };
 *   }),
 * );
 * ```
 *
 * **Example:** Background Loops with ServerHost
 * ```typescript
 * // Class props may be an Effect, so the service can yield the swarm it
 * // deploys into (declared once at module level).
 * const Swarm = Docker.Swarm("swarm");
 *
 * export default class Worker extends Docker.Service<Worker>()(
 *   "Worker",
 *   Effect.gen(function* () {
 *     const swarm = yield* Swarm;
 *     return { context: swarm, main: import.meta.url, port: 3000 };
 *   }),
 *   Effect.gen(function* () {
 *     const host = yield* ServerHost;
 *     yield* host.run(
 *       pollQueue.pipe(Effect.repeat(Schedule.spaced("5 seconds")), Effect.asVoid),
 *     );
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.text("ok")),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * ### Bundling & Tree-shaking
 * `main` is bundled with rolldown at deploy time. Unused code is
 * tree-shaken. `effect`, alchemy, and `@distilled.cloud` are marked
 * pure so unused parts prune more aggressively. Your app is not
 * marked pure.
 *
 * **Example:** Mark additional packages as pure
 * Only list packages with no top-level side effects.
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * }
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: { pure: false },
 * }
 * ```
 *
 * ### Docker Contexts
 * **Example:** Deploy to a Remote Swarm over SSH
 * ```typescript
 * const vps = yield* Docker.Context("vps", {
 *   docker: "host=ssh://deploy@example.com",
 * });
 * const swarm = yield* Docker.Swarm("swarm", {
 *   context: vps,
 *   advertiseAddr: "10.0.0.1",
 * });
 * const app = yield* Docker.Service("app", {
 *   context: swarm,
 *   image: "nginx:alpine",
 *   replicas: 3,
 * });
 * ```
 *
 * ### Networks & Volumes
 * **Example:** Overlay Network with Aliases
 * ```typescript
 * const network = yield* Docker.Network("app-net", {
 *   context: swarm,
 *   driver: "overlay",
 * });
 * const db = yield* Docker.Service("db", {
 *   context: swarm,
 *   image: "postgres:18-alpine",
 *   networks: [{ name: network.name, aliases: ["postgres"] }],
 *   volumes: [{ hostPath: "pg-data", containerPath: "/var/lib/postgresql/data" }],
 * });
 * ```
 *
 * ### Rollouts & Placement
 * **Example:** Rolling Update with Rollback
 * ```typescript
 * const app = yield* Docker.Service("app", {
 *   image: "ghcr.io/acme/app:latest",
 *   replicas: 4,
 *   updateConfig: {
 *     parallelism: 1,
 *     delay: "10s",
 *     failureAction: "rollback",
 *     order: "start-first",
 *   },
 *   placement: {
 *     constraints: ["node.role==worker"],
 *     maxReplicasPerNode: 2,
 *   },
 * });
 * ```
 *
 * ### Secrets & Configs
 * **Example:** Mount Swarm Secrets
 * ```typescript
 * const app = yield* Docker.Service("app", {
 *   image: "ghcr.io/acme/app:latest",
 *   secrets: [{ source: "db-password", target: "db_password", mode: 0o400 }],
 *   configs: [{ source: "app-config", target: "/etc/app/config.yaml" }],
 * });
 * ```
 *
 * @resource
 */
export declare const Service: Platform<Service, ServiceServices, ServiceShape, ServiceRuntimeContext>;
export declare const ServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<Service>, never, any>;
//# sourceMappingURL=Service.d.ts.map