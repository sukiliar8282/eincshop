/**
 * Internal helpers for binding Kubernetes objects onto an `AWS.EKS.Cluster`
 * through its `KubernetesObjectBinding` contract. The cluster's reconciler
 * server-side-applies every bound object after the control plane is ACTIVE.
 * Not exported from the EKS index — the public path for raw manifests is
 * `Kubernetes.Manifest`.
 */
import * as Effect from "effect/Effect";
import type { Cluster } from "../Cluster.ts";
import { type KubernetesObjectDefinition, type KubernetesObjectMetadata } from "../../../Kubernetes/internal/objects.ts";
export interface ClusterObjectProps {
    /** Target EKS cluster that will own this Kubernetes object. */
    cluster: Cluster;
    /** Kubernetes API version. */
    apiVersion: string;
    /** Kubernetes kind. */
    kind: string;
    /** Object metadata. `name` defaults to the logical id. */
    metadata?: Omit<KubernetesObjectMetadata, "name"> & {
        name?: string;
    };
    /** Extra top-level fields merged into the final Kubernetes object. */
    body?: Record<string, unknown>;
}
export interface ClusterObjectRef {
    cluster: Cluster;
    apiVersion: string;
    kind: string;
    name: string;
    namespace: string | undefined;
    key: string;
    object: KubernetesObjectDefinition;
}
export declare const kubernetesBindingSid: (object: KubernetesObjectDefinition) => string;
export declare const ClusterObject: (id: string, props: ClusterObjectProps) => Effect.Effect<{
    cluster: Cluster;
    apiVersion: string;
    kind: string;
    name: string;
    namespace: string | undefined;
    key: string;
    object: {
        apiVersion: string;
        kind: string;
        metadata: {
            name: string;
            namespace: string | undefined;
            labels: Record<string, string> | undefined;
            annotations: Record<string, string> | undefined;
        };
    };
}, never, never>;
export declare const namespaceNameOf: (namespace: string | {
    name: string;
} | ClusterObjectRef) => string;
export declare const clusterServiceAccount: (id: string, props: {
    cluster: Cluster;
    namespace: string | {
        name: string;
    } | ClusterObjectRef;
    name?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
}) => Effect.Effect<{
    cluster: Cluster;
    apiVersion: string;
    kind: string;
    name: string;
    namespace: string | undefined;
    key: string;
    object: {
        apiVersion: string;
        kind: string;
        metadata: {
            name: string;
            namespace: string | undefined;
            labels: Record<string, string> | undefined;
            annotations: Record<string, string> | undefined;
        };
    };
}, never, never>;
//# sourceMappingURL=ClusterObject.d.ts.map