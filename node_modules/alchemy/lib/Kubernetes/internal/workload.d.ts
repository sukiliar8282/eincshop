/**
 * Internal helpers shared by the Kubernetes workload platforms
 * (`Kubernetes.Deployment`, `Kubernetes.Job`): image-source dispatch
 * through the cluster adapter, binding-env collection, connection
 * identity, and the platform-neutral generated container entries.
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type { ResourceBinding } from "../../Resource.ts";
import type { ClusterAdapterService, IdentityState, WorkloadBindingContract, WorkloadImageSource } from "../ClusterAdapter.ts";
import type { ClusterLike, Connection } from "../Connection.ts";
/**
 * Structural deep merge: objects merge recursively; arrays and primitives
 * from `override` replace the base value wholesale. Powers escape hatches
 * like `Kubernetes.Deployment.podTemplate`.
 */
export declare const deepMerge: <T>(base: T, override: unknown) => T;
export declare const imagePlatformOf: (architecture: "amd64" | "arm64" | undefined) => string;
/**
 * Best-effort {@link Connection} of a `cluster` prop value — `undefined`
 * instead of throwing, for plan-time diffs where the referenced resource
 * may resolve to stables-only (or `{}`).
 */
export declare const tryConnectionOf: (cluster: ClusterLike | undefined) => Connection | undefined;
/**
 * A stable identity string for a connection's *target cluster* — the auth
 * descriptor (which names the cluster for managed clouds and the
 * kubeconfig context otherwise). Changing it means the workload moves
 * clusters, which is a replacement. Deliberately excludes `endpoint` /
 * CA: managed clusters can rotate those in place.
 */
export declare const connectionIdentity: (connection: Connection | undefined) => string | undefined;
/**
 * The persisted connection of a workload's attributes, tolerating legacy
 * pre-rename rows (`AWS.EKS.*` attributes carried a flat `clusterName`
 * instead of a `connection`) by synthesizing an `aws-eks` connection —
 * the only platform those legacy types could target.
 */
export declare const connectionOfOutput: (output: Record<string, unknown>) => Connection | undefined;
/**
 * Collect environment variables from a host's active bindings and report
 * which cloud-grant channels (any binding-data key besides `env`, e.g.
 * AWS `policyStatements`) are in play — the caller fails when grants
 * exist but the cluster has no identity adapter to materialize them.
 */
export declare const collectBindingEnv: (bindings: ResourceBinding<WorkloadBindingContract>[]) => {
    env: Record<string, any>;
    grantKeys: string[];
};
export type ImageSourceKind = "main" | "context" | "image";
/** Which image source a props bag declares (`main` always wins). */
export declare const imageSourceKind: (source: WorkloadImageSource) => ImageSourceKind | undefined;
/**
 * Content hash for image sources whose identity is computable without a
 * bundler: `image` (the ref + platform) and `context` (the build-context
 * directory + Dockerfile content + platform). `main` returns `undefined`
 * — its hash comes from the bundle output inside the registry adapter.
 */
export declare const computeStaticWorkloadImageHash: (source: WorkloadImageSource, platform: string) => Effect.Effect<string | undefined, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
export interface ResolveWorkloadImageOptions {
    adapter: ClusterAdapterService;
    id: string;
    source: WorkloadImageSource;
    platform: string;
    port?: number | undefined;
    isExternal?: boolean | undefined;
    bootstrap: (importPath: string) => string;
    tags: Record<string, string>;
    /** Persisted registry state hints (legacy-shape tolerant). */
    state: Record<string, unknown> | undefined;
    session: {
        note: (message: string) => Effect.Effect<void>;
    };
}
/**
 * Resolve the container image for a workload: through the cluster
 * adapter's managed registry when it has one (build/mirror + push), or —
 * on registry-less clusters — pass a pre-built `image` reference through
 * verbatim. `main`/`context` sources require a managed registry.
 */
export declare const resolveWorkloadImage: (options: ResolveWorkloadImageOptions) => Effect.Effect<import("../ClusterAdapter.ts").ImageRegistryResult, any, FileSystem.FileSystem | Path.Path | import("../ClusterAdapter.ts").AdapterLifecycleServices>;
/** Plan-time content hash for `diff` — adapter-aware. */
export declare const workloadImageHash: (options: {
    adapter: ClusterAdapterService;
    source: WorkloadImageSource;
    platform: string;
    port?: number | undefined;
    isExternal?: boolean | undefined;
    bootstrap: (importPath: string) => string;
}) => Effect.Effect<string | undefined, any, FileSystem.FileSystem | Path.Path | import("../ClusterAdapter.ts").AdapterLifecycleServices>;
/** The identity-adapter state persisted on workload attributes. */
export type PersistedIdentityState = IdentityState | undefined;
/**
 * Platform-neutral generated container entry for an Effect-native server
 * workload: resolves the program's registered runners and serves the
 * returned `{ fetch }` handler on `PORT`. Cloud adapters override this
 * through {@link ClusterAdapterService.bootstrap} to wire their runtime
 * credential chains (e.g. EKS Pod Identity).
 */
export declare const makeServerBootstrap: (handler: string) => (importPath: string) => string;
/**
 * Platform-neutral generated container entry for an Effect-native one-shot
 * Job: resolves the program's `run` effect, executes it to completion, and
 * exits.
 */
export declare const makeJobBootstrap: (handler: string) => (importPath: string) => string;
//# sourceMappingURL=workload.d.ts.map