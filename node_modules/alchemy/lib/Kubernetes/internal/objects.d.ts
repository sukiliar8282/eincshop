/**
 * Internal Kubernetes object model + ordering/path helpers powering
 * `Kubernetes.Manifest` and the workload platforms (`Deployment`, `Job`).
 * Not part of the public surface — the public manifest shape is the literal
 * `KubernetesManifest` on `Kubernetes.Manifest`.
 */
export interface KubernetesObjectMetadata {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
}
export type KubernetesObjectDefinition = {
    apiVersion: string;
    kind: string;
    metadata: KubernetesObjectMetadata;
} & Record<string, unknown>;
export interface KubernetesObjectRef {
    apiVersion: string;
    kind: string;
    name: string;
    namespace?: string;
}
export interface KubernetesObjectBinding {
    type: "kubernetes-object";
    object: KubernetesObjectDefinition;
}
export type KubernetesObjectScope = "Cluster" | "Namespaced";
export interface KubernetesObjectKindSpec {
    plural: string;
    scope: KubernetesObjectScope;
    applyRank: number;
}
/** Apply rank for kinds not in the static table (applied last, deleted first). */
export declare const DEFAULT_APPLY_RANK = 100;
/** Look up the static kind table; `undefined` for kinds needing discovery. */
export declare const lookupKubernetesKindSpec: (input: Pick<KubernetesObjectRef, "apiVersion" | "kind">) => KubernetesObjectKindSpec | undefined;
export declare const getKubernetesKindSpec: (input: Pick<KubernetesObjectRef, "apiVersion" | "kind">) => KubernetesObjectKindSpec;
export declare const toKubernetesObjectRef: (object: KubernetesObjectDefinition) => KubernetesObjectRef;
export declare const kubernetesObjectKey: (input: Pick<KubernetesObjectRef, "apiVersion" | "kind" | "name" | "namespace">) => string;
export declare const sortObjectsForApply: (objects: ReadonlyArray<KubernetesObjectDefinition>) => KubernetesObjectDefinition[];
export declare const sortRefsForDelete: (objects: ReadonlyArray<KubernetesObjectRef>) => KubernetesObjectRef[];
export declare const chunkByApplyRank: (objects: ReadonlyArray<KubernetesObjectDefinition>) => KubernetesObjectDefinition[][];
/**
 * Build the REST path for an object given its (statically-known or
 * discovered) kind spec.
 */
export declare const buildKubernetesObjectPathWithSpec: (input: Pick<KubernetesObjectRef, "apiVersion" | "kind" | "name" | "namespace">, spec: KubernetesObjectKindSpec) => string;
export declare const buildKubernetesObjectPath: (input: Pick<KubernetesObjectRef, "apiVersion" | "kind" | "name" | "namespace">) => string;
//# sourceMappingURL=objects.d.ts.map