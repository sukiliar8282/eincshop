import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type ClusterLike, type Connection } from "./Connection.ts";
import type { KubernetesObjectRef } from "./internal/objects.ts";
import type { Providers } from "./Providers.ts";
/**
 * A literal Kubernetes object: `apiVersion` + `kind` + `metadata`, with the
 * rest of the object's fields (`spec`, `data`, …) carried as-is. Any kind is
 * accepted — built-in objects and CRDs alike; the API server validates the
 * shape on apply.
 */
export interface KubernetesManifest {
    apiVersion: string;
    kind: string;
    metadata?: {
        name?: string;
        namespace?: string;
        labels?: Record<string, string>;
        annotations?: Record<string, string>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
export interface ManifestProps {
    /**
     * Target cluster the manifest is applied onto. Pass a managed cluster
     * resource (e.g. `AWS.EKS.Cluster`), a `Kubernetes.KubeConfig(...)`, or
     * a raw `Kubernetes.Connection`.
     */
    cluster: ClusterLike;
    /**
     * The Kubernetes object to apply (server-side apply, field manager
     * `alchemy`) — a literal object with `apiVersion`, `kind`, `metadata`, and
     * the kind's own fields. Arbitrary CRDs are supported via API discovery.
     */
    manifest: KubernetesManifest;
}
export interface Manifest extends Resource<"Kubernetes.Manifest", ManifestProps, {
    /** The connection of the cluster the object is applied to. */
    connection: Connection;
    /** The Kubernetes API version of the applied object. */
    apiVersion: string;
    /** The Kubernetes kind of the applied object. */
    kind: string;
    /** The name of the applied object. */
    name: string;
    /** The namespace of the applied object (`undefined` for cluster-scoped kinds). */
    namespace: string | undefined;
    /** Reference to the applied Kubernetes object. */
    ref: KubernetesObjectRef;
    /** The server-assigned UID of the applied object, when returned. */
    uid: string | undefined;
}, {}, Providers> {
}
/**
 * Applies a raw Kubernetes manifest onto any cluster via server-side
 * apply.
 *
 * Any literal object is accepted — built-in kinds and custom resources
 * alike; unknown kinds are resolved through the Kubernetes API discovery
 * endpoint, so CRDs work without any registration. The target `cluster`
 * can be a managed cluster resource (e.g. `AWS.EKS.Cluster`) or any
 * cluster your kubeconfig can reach (`Kubernetes.KubeConfig(...)`).
 * ### Applying Manifests
 * **Example:** StatefulSet
 * ```typescript
 * const sts = yield* Kubernetes.Manifest("Cache", {
 *   cluster,
 *   manifest: {
 *     apiVersion: "apps/v1",
 *     kind: "StatefulSet",
 *     metadata: { name: "cache", namespace: "apps" },
 *     spec: {
 *       serviceName: "cache",
 *       replicas: 3,
 *       selector: { matchLabels: { app: "cache" } },
 *       template: {
 *         metadata: { labels: { app: "cache" } },
 *         spec: { containers: [{ name: "redis", image: "redis:7" }] },
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Custom resource (CRD)
 * ```typescript
 * const widget = yield* Kubernetes.Manifest("Widget", {
 *   cluster,
 *   manifest: {
 *     apiVersion: "acme.io/v1",
 *     kind: "Widget",
 *     metadata: { name: "w", namespace: "default" },
 *     spec: { size: 3 },
 *   },
 * });
 * ```
 *
 * ### Namespaces
 * **Example:** Create a Namespace
 * ```typescript
 * const ns = yield* Kubernetes.Manifest("AppsNamespace", {
 *   cluster,
 *   manifest: {
 *     apiVersion: "v1",
 *     kind: "Namespace",
 *     metadata: { name: "apps" },
 *   },
 * });
 * ```
 *
 * ### Any Cluster
 * **Example:** Apply onto a kubeconfig context
 * ```typescript
 * const local = Kubernetes.KubeConfig({ context: "kind-dev" });
 *
 * const config = yield* Kubernetes.Manifest("AppConfig", {
 *   cluster: local,
 *   manifest: {
 *     apiVersion: "v1",
 *     kind: "ConfigMap",
 *     metadata: { name: "app-config", namespace: "default" },
 *     data: { LOG_LEVEL: "info" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Manifest: import("../Resource.ts").ResourceClass<Manifest>;
export declare const ManifestProvider: () => import("effect/Layer").Layer<Provider.Provider<Manifest>, never, never>;
//# sourceMappingURL=Manifest.d.ts.map