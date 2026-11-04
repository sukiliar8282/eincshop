import * as Effect from "effect/Effect";
import type { Scope } from "effect/Scope";
import { Platform, type PlatformProps, type PlatformServices } from "../Platform.ts";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { RuntimeContext } from "../RuntimeContext.ts";
import type { HostRuntimeContext } from "../Server/Process.ts";
import { Stack } from "../Stack.ts";
import { type IdentityState, type RegistryState, type WorkloadBindingContract, type WorkloadIdentityOptions, type WorkloadImageSource, type WorkloadServices } from "./ClusterAdapter.ts";
import { type ClusterLike, type Connection } from "./Connection.ts";
import type { KubernetesObjectRef } from "./internal/objects.ts";
import type { Providers } from "./Providers.ts";
export declare const isJob: (value: any) => value is Job;
export interface JobPropsBase extends PlatformProps {
    /**
     * Target cluster the job runs on. Pass a managed cluster resource (e.g.
     * `AWS.EKS.Cluster`), a `Kubernetes.KubeConfig(...)`, or a raw
     * `Kubernetes.Connection`.
     */
    cluster: ClusterLike;
    /**
     * Base name for the generated Job / ServiceAccount. If omitted, a
     * deterministic name is derived from the stack, stage, and logical id.
     */
    name?: string;
    /**
     * Kubernetes namespace to run in. The namespace must already exist.
     * @default "default"
     */
    namespace?: string;
    /**
     * Number of retries before the Job is marked failed (Kubernetes
     * `backoffLimit`).
     */
    backoffLimit?: number;
    /**
     * Cron schedule (standard 5-field cron, e.g. `"0 3 * * *"`). When set, a
     * Kubernetes `CronJob` is synthesized instead of a plain `Job`.
     */
    schedule?: string;
    /**
     * Restart policy for the job's pods.
     * @default "Never"
     */
    restartPolicy?: "Never" | "OnFailure";
    /**
     * Seconds after completion before the finished Job is garbage-collected
     * (Kubernetes `ttlSecondsAfterFinished`).
     */
    ttlSecondsAfterFinished?: number;
    /**
     * Container entrypoint override (Kubernetes `command`). Mostly useful with
     * `image` / `context` sources.
     */
    command?: string[];
    /**
     * Container arguments (Kubernetes `args`).
     */
    args?: string[];
    /**
     * Container CPU/memory requests + limits (Kubernetes resource quantities).
     */
    resources?: {
        requests?: {
            cpu?: string;
            memory?: string;
        };
        limits?: {
            cpu?: string;
            memory?: string;
        };
    };
    /**
     * Additional environment variables for the container.
     */
    env?: Record<string, any>;
    /**
     * Container image build architecture.
     * @default "amd64"
     */
    architecture?: "amd64" | "arm64";
    /**
     * Deep-partial Kubernetes Pod template merged into the synthesized
     * template (objects merge recursively; arrays and primitives replace) —
     * a literal object in the shape of `PodTemplateSpec`, e.g.
     * `{ spec: { tolerations: [...], nodeSelector: {...} } }`.
     */
    podTemplate?: Record<string, unknown>;
    /**
     * Cloud-specific workload-identity options, consumed by the cluster
     * platform's identity adapter (on EKS: `{ managedPolicyArns: [...] }`
     * attaches extra managed policies to the generated pod-identity role).
     */
    identity?: WorkloadIdentityOptions;
    /**
     * Job / pod labels, merged over the generated `app.kubernetes.io/name`
     * label.
     */
    labels?: Record<string, string>;
    /**
     * User-defined tags applied to workload-owned cloud resources (identity
     * roles, image repositories).
     */
    tags?: Record<string, string>;
}
/** Bundle an inline Effect program (`main`) into a generated image. */
export interface BundledJobProps extends JobPropsBase {
    /**
     * Module entrypoint for the bundled program. This should typically be
     * `import.meta.url` from an inline Effect program.
     */
    main: string;
    /**
     * Environment image used as the generated Dockerfile's `FROM`; must be
     * able to run the bun runtime.
     * @default "oven/bun:1"
     */
    image?: string;
    /** Named export to load from `main`. @default "default" */
    handler?: string;
    /** Bundler configuration for the entrypoint. */
    build?: WorkloadImageSource["build"];
    /** Environment Dockerfile (path or inline content). */
    dockerfile?: WorkloadImageSource["dockerfile"];
    /** Build context for a path {@link dockerfile} environment. */
    context?: string;
}
/** Build the user's own Dockerfile (`context` + optional `dockerfile` path). */
export interface DockerfileJobProps extends JobPropsBase {
    /** Docker build context directory. */
    context?: string;
    /**
     * Path to the Dockerfile (relative to the cwd), or inline content.
     * @default `${context}/Dockerfile`
     */
    dockerfile?: WorkloadImageSource["dockerfile"];
}
/** Run a pre-built registry image. */
export interface ImageJobProps extends JobPropsBase {
    /**
     * A pre-built image reference, e.g. `ghcr.io/acme/migrator:v3`. On
     * clusters with a managed registry (EKS) the image is mirrored into it;
     * elsewhere the reference is used verbatim.
     */
    image: string;
}
export type JobProps = BundledJobProps | DockerfileJobProps | ImageJobProps;
export interface Job extends Resource<"Kubernetes.Job", JobProps, {
    /** The connection of the cluster the job runs on. */
    connection: Connection;
    /** The Kubernetes namespace the job's objects live in. */
    namespace: string;
    /** The Kubernetes kind synthesized for the workload (`Job`, or `CronJob` when `schedule` is set). */
    kind: "Job" | "CronJob";
    /** The name of the Kubernetes Job/CronJob object. */
    jobName: string;
    /** The cron schedule, when the workload is a CronJob. */
    schedule: string | undefined;
    /** The name of the service account the pods run as. */
    serviceAccountName: string;
    /** The URI of the container image the job runs. */
    imageUri: string;
    /**
     * Workload-identity state provisioned by the cluster platform's
     * adapter (on EKS: the pod-identity role + association).
     */
    identity: IdentityState | undefined;
    /**
     * Image-registry state provisioned by the cluster platform's adapter
     * (on EKS: the ECR repository).
     */
    registry: RegistryState | undefined;
    /** References to the Kubernetes objects created for the job. */
    kubernetesObjects: KubernetesObjectRef[];
    /** The content hash of the container image source. */
    code: {
        hash: string;
    };
}, WorkloadBindingContract, Providers> {
}
export type JobServices = WorkloadServices;
/**
 * The impl shape: `{ run, ...rpc }`. `run` executes to completion inside
 * the pod; the process exits when it returns.
 */
export type JobMain<InitServices = never> = void | {
    run?: Effect.Effect<void, never, InitServices | PlatformServices | RuntimeContext | Scope>;
};
export type JobShape = JobMain<JobServices>;
export interface JobRuntimeContext extends HostRuntimeContext {
    readonly Type: "Kubernetes.Job";
}
/**
 * Run-to-completion Kubernetes compute on any cluster — the Kubernetes
 * analog of `AWS.ECS.Task`.
 *
 * `Job` provisions a Kubernetes `Job` (or `CronJob` when `schedule` is
 * set) via server-side apply and a ServiceAccount, plus — through the
 * target cluster's platform adapter — workload identity and a container
 * image from exactly one of three sources flat on props: `main` (bundle an
 * inline Effect program whose impl returns `{ run }`), `context` (build
 * your own Dockerfile), or `image` (a pre-built registry reference). On
 * `AWS.EKS.Cluster` targets, bindings attach env vars to the pod and IAM
 * policy statements to a generated pod-identity role, exactly like
 * `Kubernetes.Deployment`.
 * ### Creating a Job
 * **Example:** Remote image (external — no Effect runtime in the container)
 * ```typescript
 * const migrate = yield* Kubernetes.Job("DbMigrate", {
 *   cluster,
 *   image: "ghcr.io/acme/migrator:v3",
 *   backoffLimit: 2,
 * });
 * ```
 *
 * **Example:** Inline Effect program with a DynamoDB binding (EKS)
 * ```typescript
 * const seed = yield* Kubernetes.Job(
 *   "SeedData",
 *   { cluster, main: import.meta.url },
 *   Effect.gen(function* () {
 *     const putItem = yield* AWS.DynamoDB.PutItem(table);
 *     return {
 *       run: Effect.gen(function* () {
 *         yield* putItem({ Item: { id: { S: "seed" } } });
 *       }),
 *     };
 *   }).pipe(Effect.provide(AWS.DynamoDB.PutItemHttp)),
 * );
 * ```
 *
 * **Example:** Tagged Effect program
 * ```typescript
 * export class Backfill extends Kubernetes.Job<Backfill, {
 *   progress: () => Effect.Effect<number>;
 * }>()("Backfill") {}
 *
 * export default Backfill.make(
 *   { cluster, main: import.meta.url, backoffLimit: 1 },
 *   Effect.gen(function* () {
 *     return {
 *       run: Effect.gen(function* () { }),
 *       progress: () => Effect.succeed(0),
 *     };
 *   }),
 * );
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
 * ### Scheduling
 * **Example:** Nightly CronJob
 * ```typescript
 * const nightly = yield* Kubernetes.Job("NightlyBackfill", {
 *   cluster,
 *   main: import.meta.url,
 *   schedule: "0 3 * * *",
 * });
 * ```
 *
 * @resource
 */
export declare const Job: Platform<Job, JobServices, JobShape, JobRuntimeContext>;
export declare const JobProvider: () => import("effect/Layer").Layer<Provider.Provider<Job>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | Stack | import("../Stage.ts").Stage>;
//# sourceMappingURL=Job.d.ts.map