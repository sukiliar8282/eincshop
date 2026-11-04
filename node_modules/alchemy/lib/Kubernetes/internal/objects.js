/**
 * Internal Kubernetes object model + ordering/path helpers powering
 * `Kubernetes.Manifest` and the workload platforms (`Deployment`, `Job`).
 * Not part of the public surface — the public manifest shape is the literal
 * `KubernetesManifest` on `Kubernetes.Manifest`.
 */
/** Apply rank for kinds not in the static table (applied last, deleted first). */
export const DEFAULT_APPLY_RANK = 100;
const supportedKinds = {
    "v1/Namespace": {
        plural: "namespaces",
        scope: "Cluster",
        applyRank: 10,
    },
    // CRDs apply right after namespaces so a chart's custom resources
    // (default rank 100) always find their definition registered.
    "apiextensions.k8s.io/v1/CustomResourceDefinition": {
        plural: "customresourcedefinitions",
        scope: "Cluster",
        applyRank: 15,
    },
    "v1/ServiceAccount": {
        plural: "serviceaccounts",
        scope: "Namespaced",
        applyRank: 20,
    },
    "v1/ConfigMap": {
        plural: "configmaps",
        scope: "Namespaced",
        applyRank: 30,
    },
    "v1/Secret": {
        plural: "secrets",
        scope: "Namespaced",
        applyRank: 30,
    },
    "v1/Service": {
        plural: "services",
        scope: "Namespaced",
        applyRank: 40,
    },
    "apps/v1/Deployment": {
        plural: "deployments",
        scope: "Namespaced",
        applyRank: 50,
    },
    "apps/v1/StatefulSet": {
        plural: "statefulsets",
        scope: "Namespaced",
        applyRank: 50,
    },
    "apps/v1/DaemonSet": {
        plural: "daemonsets",
        scope: "Namespaced",
        applyRank: 50,
    },
    "batch/v1/Job": {
        plural: "jobs",
        scope: "Namespaced",
        applyRank: 60,
    },
    "batch/v1/CronJob": {
        plural: "cronjobs",
        scope: "Namespaced",
        applyRank: 60,
    },
    "v1/Pod": {
        plural: "pods",
        scope: "Namespaced",
        applyRank: 60,
    },
};
const objectTypeKey = (input) => `${input.apiVersion}/${input.kind}`;
/** Look up the static kind table; `undefined` for kinds needing discovery. */
export const lookupKubernetesKindSpec = (input) => supportedKinds[objectTypeKey(input)];
export const getKubernetesKindSpec = (input) => {
    const spec = lookupKubernetesKindSpec(input);
    if (!spec) {
        throw new Error(`Unsupported Kubernetes object ${input.apiVersion}/${input.kind}`);
    }
    return spec;
};
const applyRankOf = (input) => lookupKubernetesKindSpec(input)?.applyRank ?? DEFAULT_APPLY_RANK;
export const toKubernetesObjectRef = (object) => ({
    apiVersion: object.apiVersion,
    kind: object.kind,
    name: object.metadata.name,
    namespace: object.metadata.namespace,
});
export const kubernetesObjectKey = (input) => [
    input.apiVersion,
    input.kind,
    input.namespace ?? "_cluster",
    input.name,
].join("/");
const compareRefs = (a, b) => kubernetesObjectKey(a).localeCompare(kubernetesObjectKey(b));
export const sortObjectsForApply = (objects) => [...objects].sort((a, b) => applyRankOf(a) - applyRankOf(b) ||
    compareRefs(toKubernetesObjectRef(a), toKubernetesObjectRef(b)));
export const sortRefsForDelete = (objects) => [...objects].sort((a, b) => applyRankOf(b) - applyRankOf(a) || compareRefs(a, b));
export const chunkByApplyRank = (objects) => {
    const chunks = [];
    for (const object of sortObjectsForApply(objects)) {
        const rank = applyRankOf(object);
        const current = chunks[chunks.length - 1];
        if (!current) {
            chunks.push([object]);
            continue;
        }
        const currentRank = applyRankOf(current[0]);
        if (currentRank === rank) {
            current.push(object);
        }
        else {
            chunks.push([object]);
        }
    }
    return chunks;
};
/**
 * Build the REST path for an object given its (statically-known or
 * discovered) kind spec.
 */
export const buildKubernetesObjectPathWithSpec = (input, spec) => {
    const [group, version] = input.apiVersion.includes("/")
        ? input.apiVersion.split("/", 2)
        : [undefined, input.apiVersion];
    const base = group ? `/apis/${group}/${version}` : `/api/${version}`;
    if (spec.scope === "Namespaced") {
        if (!input.namespace) {
            throw new Error(`Kubernetes object ${input.apiVersion}/${input.kind}/${input.name} requires a namespace`);
        }
        return `${base}/namespaces/${input.namespace}/${spec.plural}/${input.name}`;
    }
    return `${base}/${spec.plural}/${input.name}`;
};
export const buildKubernetesObjectPath = (input) => buildKubernetesObjectPathWithSpec(input, getKubernetesKindSpec(input));
//# sourceMappingURL=objects.js.map