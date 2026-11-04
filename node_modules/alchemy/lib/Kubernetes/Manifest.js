import * as Effect from "effect/Effect";
import { isResolved } from "../Diff.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { toConnection, } from "./Connection.js";
import { applyObject, connectCluster, deleteObject, readObject, KubernetesApiError, } from "./internal/client.js";
import { connectionIdentity, connectionOfOutput, tryConnectionOf, } from "./internal/workload.js";
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
export const Manifest = Resource("Kubernetes.Manifest", {
    aliases: ["AWS.EKS.Manifest"],
});
const toObjectDefinition = (manifest) => {
    const name = manifest.metadata?.name;
    if (!name) {
        return Effect.fail(new Error(`Kubernetes.Manifest requires manifest.metadata.name (got ${manifest.apiVersion}/${manifest.kind})`));
    }
    return Effect.succeed(manifest);
};
const isNotFound = (error) => error instanceof KubernetesApiError && error.statusCode === 404;
export const ManifestProvider = () => Provider.effect(Manifest, Effect.gen(function* () {
    return {
        stables: ["connection", "apiVersion", "kind", "name", "namespace"],
        // In-cluster objects have no cloud-side enumeration that attributes
        // them to alchemy; refresh happens per-instance through `read`.
        list: () => Effect.succeed([]),
        diff: Effect.fn(function* ({ olds = {}, news }) {
            if (!isResolved(news))
                return;
            const oldManifest = olds.manifest;
            const newManifest = news.manifest;
            const oldCluster = connectionIdentity(tryConnectionOf(olds.cluster));
            const newCluster = connectionIdentity(tryConnectionOf(news.cluster));
            // Object identity (cluster, group/version/kind, name, namespace) is
            // immutable — changing any of it is a replacement.
            if (oldManifest &&
                ((oldCluster !== undefined &&
                    newCluster !== undefined &&
                    oldCluster !== newCluster) ||
                    oldManifest.apiVersion !== newManifest.apiVersion ||
                    oldManifest.kind !== newManifest.kind ||
                    oldManifest.metadata?.name !== newManifest.metadata?.name ||
                    oldManifest.metadata?.namespace !==
                        newManifest.metadata?.namespace)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const connection = connectionOfOutput(output);
            if (!connection)
                return undefined;
            const transport = yield* connectCluster(connection).pipe(
            // Cluster gone — its objects went with it.
            Effect.catchTag("Kubernetes.ClusterNotFoundError", () => Effect.succeed(undefined)));
            if (!transport)
                return undefined;
            const observed = yield* readObject({
                transport,
                object: output.ref,
            }).pipe(Effect.catchIf(isNotFound, () => Effect.succeed(undefined)));
            if (!observed)
                return undefined;
            const uid = observed.metadata
                ?.uid;
            return { ...output, uid };
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const connection = toConnection(news.cluster);
            const transport = yield* connectCluster(connection);
            const object = yield* toObjectDefinition(news.manifest);
            const ref = {
                apiVersion: object.apiVersion,
                kind: object.kind,
                name: object.metadata.name,
                namespace: object.metadata.namespace,
            };
            // Server-side apply is a true upsert: create-if-missing and
            // converge-if-present in one call, `force: true` so alchemy owns
            // the fields it manages regardless of prior managers.
            const applied = yield* applyObject({ transport, object });
            yield* session.note(`Applied ${ref.apiVersion}/${ref.kind} ${ref.namespace ? `${ref.namespace}/` : ""}${ref.name}`);
            const uid = applied?.metadata?.uid ??
                output?.uid;
            return {
                connection,
                apiVersion: ref.apiVersion,
                kind: ref.kind,
                name: ref.name,
                namespace: ref.namespace,
                ref,
                uid,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const connection = connectionOfOutput(output);
            if (!connection)
                return;
            const transport = yield* connectCluster(connection).pipe(
            // Cluster already destroyed — nothing left to delete.
            Effect.catchTag("Kubernetes.ClusterNotFoundError", () => Effect.succeed(undefined)));
            if (!transport)
                return;
            yield* deleteObject({ transport, object: output.ref }).pipe(
            // Tolerate any residual API failure so delete stays idempotent
            // (e.g. the CRD backing an object was removed before the object).
            Effect.catch(() => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Manifest.js.map