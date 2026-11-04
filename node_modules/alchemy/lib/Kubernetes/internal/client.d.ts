import * as Effect from "effect/Effect";
import { type ClusterTransport } from "../ClusterAdapter.ts";
import type { Connection } from "../Connection.ts";
import { type KubernetesObjectDefinition, type KubernetesObjectKindSpec, type KubernetesObjectRef } from "./objects.ts";
declare const KubernetesApiError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "KubernetesApiError";
} & Readonly<A>;
export declare class KubernetesApiError extends KubernetesApiError_base<{
    method: string;
    path: string;
    statusCode: number;
    body: string;
}> {
    get message(): string;
}
/**
 * Resolve the {@link ClusterTransport} for a connection through its
 * registered adapter.
 */
export declare const connectCluster: (connection: Connection) => Effect.Effect<ClusterTransport, import("../ClusterAdapter.ts").ClusterNotFoundError | Error, never>;
/**
 * Resolve the REST mapping (plural + scope) for an arbitrary kind: static
 * table fast path, then the Kubernetes discovery API (`/apis/{g}/{v}` or
 * `/api/v1`). This is what lets `Kubernetes.Manifest` apply any CRD.
 */
export declare const resolveKindSpec: (args_0: {
    transport: ClusterTransport;
    input: Pick<KubernetesObjectRef, "apiVersion" | "kind">;
}) => Effect.Effect<KubernetesObjectKindSpec, Error | KubernetesApiError, never>;
export declare const readObject: (args_0: {
    transport: ClusterTransport;
    object: KubernetesObjectRef;
}) => Effect.Effect<unknown, Error | KubernetesApiError, never>;
export declare const applyObject: (args_0: {
    transport: ClusterTransport;
    object: KubernetesObjectDefinition;
}) => Effect.Effect<unknown, Error | KubernetesApiError, never>;
export declare const deleteObject: (args_0: {
    transport: ClusterTransport;
    object: KubernetesObjectRef;
}) => Effect.Effect<void, Error | KubernetesApiError, never>;
export declare const reconcileObjects: (args_0: {
    transport: ClusterTransport;
    previousObjects: ReadonlyArray<KubernetesObjectRef>;
    desiredObjects: ReadonlyArray<KubernetesObjectDefinition>;
}) => Effect.Effect<KubernetesObjectRef[], Error | KubernetesApiError, never>;
export declare const deleteObjects: (args_0: {
    transport: ClusterTransport;
    objects: ReadonlyArray<KubernetesObjectRef>;
}) => Effect.Effect<void, Error | KubernetesApiError, never>;
export {};
//# sourceMappingURL=client.d.ts.map