import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import { type ClusterAdapterService } from "./ClusterAdapter.ts";
/**
 * `kubeconfig` — resolve the cluster and credentials from a kubeconfig
 * file, honoring static tokens, client certificates, and `exec` credential
 * plugins.
 */
export declare const KubeConfigAdapter: Layer.Layer<ClusterAdapterService, never, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner>;
/** `token` — a static bearer token against an explicit endpoint. */
export declare const TokenAdapter: Layer.Layer<ClusterAdapterService>;
/** `client-cert` — mutual TLS against an explicit endpoint. */
export declare const ClientCertAdapter: Layer.Layer<ClusterAdapterService>;
/**
 * `exec` — mint credentials with a kubeconfig-style exec credential plugin
 * against an explicit endpoint.
 */
export declare const ExecAdapter: Layer.Layer<ClusterAdapterService, never, ChildProcessSpawner.ChildProcessSpawner>;
/** All built-in adapters, merged for `Kubernetes.providers()`. */
export declare const builtinAdapters: () => Layer.Layer<ClusterAdapterService, never, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner>;
//# sourceMappingURL=BuiltinAdapters.d.ts.map