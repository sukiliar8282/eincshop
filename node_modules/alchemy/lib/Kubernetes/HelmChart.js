import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { isResolved } from "../Diff.js";
import { hashDirectory } from "../Command/Memo.js";
import { createPhysicalName } from "../PhysicalName.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { sha256Object } from "../Util/sha256.js";
import { toConnection, } from "./Connection.js";
import { connectCluster, deleteObjects, reconcileObjects, resolveKindSpec, } from "./internal/client.js";
import { renderHelmChart } from "./internal/helm.js";
import { connectionIdentity, connectionOfOutput, tryConnectionOf, } from "./internal/workload.js";
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
export const HelmChart = Resource("Kubernetes.HelmChart", {
    aliases: ["AWS.EKS.HelmChart"],
});
/**
 * Hash the chart identity: every render input, plus the chart directory's
 * content hash when `chart` is a local path (so editing a local chart is
 * visible to `diff` even though no prop changed).
 */
const computeChartHash = Effect.fn(function* (news, releaseName) {
    const fs = yield* FileSystem.FileSystem;
    const isLocalDir = !news.chart.startsWith("oci://") && (yield* fs.exists(news.chart));
    return yield* sha256Object({
        chart: news.chart,
        repo: news.repo,
        version: news.version,
        releaseName,
        namespace: news.namespace ?? "default",
        values: news.values,
        includeCrds: news.includeCrds ?? true,
        createNamespace: news.createNamespace ?? false,
        localChart: isLocalDir
            ? yield* hashDirectory({ cwd: news.chart })
            : undefined,
    });
});
const resolveReleaseName = (id, news, output) => Effect.suspend(() => {
    if (news.releaseName)
        return Effect.succeed(news.releaseName);
    if (output?.releaseName)
        return Effect.succeed(output.releaseName);
    return createPhysicalName({ id, lowercase: true });
});
/**
 * Charts commonly omit `metadata.namespace` and rely on the install
 * namespace. Server-side apply addresses objects by explicit path, so
 * inject the target namespace into namespaced objects that omit it
 * (resolving each kind's scope; cluster-scoped objects pass through).
 */
const injectNamespace = Effect.fn(function* (transport, objects, namespace) {
    return yield* Effect.forEach(objects, (object) => Effect.gen(function* () {
        if (object.metadata.namespace !== undefined)
            return object;
        const spec = yield* resolveKindSpec({ transport, input: object });
        if (spec.scope === "Cluster")
            return object;
        return {
            ...object,
            metadata: { ...object.metadata, namespace },
        };
    }));
});
export const HelmChartProvider = () => Provider.effect(HelmChart, Effect.gen(function* () {
    return {
        stables: ["connection", "releaseName", "namespace"],
        // In-cluster objects have no cloud-side enumeration that attributes
        // them to alchemy; refresh happens per-instance through `read`.
        list: () => Effect.succeed([]),
        diff: Effect.fn(function* ({ id, olds, news, output }) {
            if (!isResolved(news))
                return;
            const releaseName = yield* resolveReleaseName(id, news, output);
            const oldCluster = connectionIdentity(tryConnectionOf(olds?.cluster));
            const newCluster = connectionIdentity(tryConnectionOf(news.cluster));
            // Object identity is the (cluster, release, namespace) triple —
            // moving any of it means a different set of objects.
            if (output &&
                ((oldCluster !== undefined &&
                    newCluster !== undefined &&
                    oldCluster !== newCluster) ||
                    output.releaseName !== releaseName ||
                    output.namespace !== (news.namespace ?? "default"))) {
                return { action: "replace" };
            }
            if (output) {
                const hash = yield* computeChartHash(news, releaseName);
                if (hash !== output.code.hash) {
                    return { action: "update" };
                }
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const releaseName = yield* resolveReleaseName(id, news, output);
            const namespace = news.namespace ?? "default";
            const connection = toConnection(news.cluster);
            const transport = yield* connectCluster(connection);
            const hash = yield* computeChartHash(news, releaseName);
            yield* session.note(`Rendering Helm chart ${news.chart}${news.version ? `@${news.version}` : ""}...`);
            const rendered = yield* renderHelmChart({
                chart: news.chart,
                repo: news.repo,
                version: news.version,
                releaseName,
                namespace,
                values: news.values,
                includeCrds: news.includeCrds,
            });
            const placed = yield* injectNamespace(transport, rendered, namespace);
            const desiredObjects = news.createNamespace && namespace !== "default"
                ? [
                    {
                        apiVersion: "v1",
                        kind: "Namespace",
                        metadata: { name: namespace },
                    },
                    ...placed,
                ]
                : [...placed];
            yield* session.note(`Applying ${String(desiredObjects.length)} objects from ${news.chart}...`);
            const objects = yield* reconcileObjects({
                transport,
                previousObjects: output?.objects ?? [],
                desiredObjects,
            });
            return {
                connection,
                releaseName,
                namespace,
                chart: news.chart,
                version: news.version,
                objects: [...objects],
                code: { hash },
            };
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const connection = connectionOfOutput(output);
            if (!connection)
                return undefined;
            // The objects live in-cluster; if the cluster itself is gone, so
            // are they.
            const transport = yield* connectCluster(connection).pipe(Effect.catchTag("Kubernetes.ClusterNotFoundError", () => Effect.succeed(undefined)));
            if (!transport)
                return undefined;
            return output;
        }),
        delete: Effect.fn(function* ({ output }) {
            const connection = connectionOfOutput(output);
            if (!connection)
                return;
            const transport = yield* connectCluster(connection).pipe(
            // Cluster already destroyed — its objects went with it.
            Effect.catchTag("Kubernetes.ClusterNotFoundError", () => Effect.succeed(undefined)));
            if (!transport)
                return;
            yield* deleteObjects({ transport, objects: output.objects });
        }),
    };
}));
//# sourceMappingURL=HelmChart.js.map