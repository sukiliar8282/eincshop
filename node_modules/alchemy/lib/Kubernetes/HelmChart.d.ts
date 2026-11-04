import * as FileSystem from "effect/FileSystem";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type ClusterLike, type Connection } from "./Connection.ts";
import type { KubernetesObjectRef } from "./internal/objects.ts";
import type { Providers } from "./Providers.ts";
export interface HelmChartProps {
    /**
     * Target cluster the chart's objects are applied onto. Pass a managed
     * cluster resource (e.g. `AWS.EKS.Cluster`), a
     * `Kubernetes.KubeConfig(...)`, or a raw `Kubernetes.Connection`.
     */
    cluster: ClusterLike;
    /**
     * Chart reference: a repository chart name (used with {@link repo}, e.g.
     * `"ingress-nginx"`), an `oci://` registry reference, or a local chart
     * directory path.
     */
    chart: string;
    /**
     * Classic chart repository URL, e.g.
     * `https://kubernetes.github.io/ingress-nginx`. Not needed for `oci://`
     * references or local chart directories.
     */
    repo?: string;
    /**
     * Chart version to render. Pin this for repository/OCI charts — without
     * it, helm resolves the latest version at each deploy and the rendered
     * objects can drift between runs. Ignored for local chart directories.
     */
    version?: string;
    /**
     * Helm release name the chart's templates render with
     * (`.Release.Name`). If omitted, a deterministic name is derived from
     * the stack, stage, and logical ID.
     */
    releaseName?: string;
    /**
     * Kubernetes namespace the objects are rendered into
     * (`.Release.Namespace`; also injected as `metadata.namespace` on
     * namespaced objects the chart leaves namespace-less). The namespace
     * must already exist unless {@link createNamespace} is set.
     * @default "default"
     */
    namespace?: string;
    /**
     * Values passed to the chart — a literal object, the same shape as a
     * `values.yaml` file.
     */
    values?: Record<string, unknown>;
    /**
     * Render objects from the chart's `crds/` directory too.
     * @default true
     */
    includeCrds?: boolean;
    /**
     * Create (and own) the target Namespace object alongside the chart's
     * objects.
     * @default false
     */
    createNamespace?: boolean;
}
export interface HelmChart extends Resource<"Kubernetes.HelmChart", HelmChartProps, {
    /** The connection of the cluster the chart is applied to. */
    connection: Connection;
    /** The Helm release name the chart rendered with. */
    releaseName: string;
    /** The namespace the chart rendered into. */
    namespace: string;
    /** The chart reference that was rendered. */
    chart: string;
    /** The pinned chart version, when one was declared. */
    version: string | undefined;
    /** References to the applied Kubernetes objects. */
    objects: KubernetesObjectRef[];
    /** Content hash of the chart inputs (and local chart files). */
    code: {
        hash: string;
    };
}, {}, Providers> {
}
/**
 * Renders a Helm chart and converges its objects onto any Kubernetes
 * cluster via server-side apply.
 *
 * The chart is rendered locally with the `helm` CLI (`helm template` —
 * install helm on the deploying machine, like Docker for image builds);
 * the rendered objects then flow through the same apply machinery as
 * `Kubernetes.Manifest`: Alchemy owns the object lifecycle, corrects drift
 * on every deploy, prunes objects that drop out of the render, and deletes
 * everything on destroy. There is no in-cluster Helm release record; the
 * target `cluster` can be a managed cluster resource (e.g.
 * `AWS.EKS.Cluster`) or any cluster your kubeconfig can reach.
 *
 * Helm lifecycle hooks (`helm.sh/hook`-annotated objects: install/upgrade/
 * delete hooks, tests) are neither executed nor applied — the chart is
 * rendered with `--no-hooks`, so they never enter the managed-object graph.
 * Charts that depend on hooks for correctness should be installed with Helm
 * directly.
 * ### Installing a Chart
 * **Example:** Chart from a repository
 * ```typescript
 * const ingress = yield* Kubernetes.HelmChart("IngressNginx", {
 *   cluster,
 *   chart: "ingress-nginx",
 *   repo: "https://kubernetes.github.io/ingress-nginx",
 *   version: "4.11.2",
 *   namespace: "ingress-nginx",
 *   createNamespace: true,
 *   values: {
 *     controller: { replicaCount: 2 },
 *   },
 * });
 * ```
 *
 * **Example:** OCI chart
 * ```typescript
 * const karpenter = yield* Kubernetes.HelmChart("Karpenter", {
 *   cluster,
 *   chart: "oci://public.ecr.aws/karpenter/karpenter",
 *   version: "1.0.6",
 *   namespace: "kube-system",
 * });
 * ```
 *
 * **Example:** Local chart directory
 * ```typescript
 * const app = yield* Kubernetes.HelmChart("App", {
 *   cluster,
 *   chart: "./charts/app",
 *   values: { image: { tag: "v1.2.3" } },
 * });
 * ```
 *
 * @resource
 */
export declare const HelmChart: import("../Resource.ts").ResourceClass<HelmChart>;
export declare const HelmChartProvider: () => import("effect/Layer").Layer<Provider.Provider<HelmChart>, never, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | import("effect/Path").Path | import("effect/Scope").Scope | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
//# sourceMappingURL=HelmChart.d.ts.map