import * as Layer from "effect/Layer";
import * as Provider from "../Provider.ts";
declare const Providers_base: Provider.ProviderCollection<Providers, "Kubernetes">;
export declare class Providers extends Providers_base {
}
/**
 * The Kubernetes provider layer: the cluster-agnostic workload providers
 * (`Deployment`, `Job`, `Manifest`, `HelmChart`) plus the built-in
 * cluster adapters (`kubeconfig`, `token`, `client-cert`, `exec`).
 *
 * Managed-cloud clusters need their platform's adapter alongside — e.g.
 * targeting an `AWS.EKS.Cluster` requires `AWS.providers()` in the same
 * stack:
 *
 * ```ts
 * const stack = Alchemy.Stack("app", {
 *   providers: Layer.mergeAll(AWS.providers(), Kubernetes.providers()),
 *   state: AWS.state(),
 * });
 * ```
 */
export declare const providers: () => Layer.Layer<import("./ClusterAdapter.ts").ClusterAdapterService | Providers, never, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("effect/Scope").Scope | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Providers.d.ts.map