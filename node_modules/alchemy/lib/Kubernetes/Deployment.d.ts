import { Platform, type Main, type PlatformProps } from "../Platform.ts";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type HostRuntimeContext, type ServerHost as ServerHostService } from "../Server/Process.ts";
import { Stack } from "../Stack.ts";
import { type IdentityState, type RegistryState, type WorkloadBindingContract, type WorkloadIdentityOptions, type WorkloadImageSource, type WorkloadServices } from "./ClusterAdapter.ts";
import { type ClusterLike, type Connection } from "./Connection.ts";
import { type KubernetesObjectRef } from "./internal/objects.ts";
import type { Providers } from "./Providers.ts";
export declare const isDeployment: (value: any) => value is Deployment;
/**
 * The image-source props shared by the workload platforms. Exactly one of
 * `main` (bundle an inline Effect program), `context`/`dockerfile` (build
 * the user's own Dockerfile), or `image` (a pre-built registry reference).
 */
export interface DeploymentPropsBase extends PlatformProps {
    /**
     * Target cluster the workload is deployed onto. Pass a managed cluster
     * resource (e.g. `AWS.EKS.Cluster`), a `Kubernetes.KubeConfig(...)`, or
     * a raw `Kubernetes.Connection`. The cluster's platform adapter supplies
     * authentication — and, on managed clouds, workload identity and the
     * container-image registry.
     */
    cluster: ClusterLike;
    /**
     * Base name for the generated Deployment / Service / ServiceAccount. If
     * omitted, a deterministic name is derived from the stack, stage, and
     * logical id.
     */
    name?: string;
    /**
     * Kubernetes namespace to deploy into. The namespace must already exist.
     * @default "default"
     */
    namespace?: string;
    /**
     * HTTP port exposed by the container and the Service.
     * @default 3000
     */
    port?: number;
    /**
     * Replica count for the Deployment.
     * @default 1
     */
    replicas?: number;
    /**
     * Kubernetes Service type. `LoadBalancer` provisions the platform's
     * cloud load balancer and exposes its hostname as the Deployment `url`.
     * @default "LoadBalancer"
     */
    serviceType?: "ClusterIP" | "NodePort" | "LoadBalancer";
    /**
     * Annotations applied to the Service (e.g. load-balancer scheme /
     * target-type hints).
     */
    serviceAnnotations?: Record<string, string>;
    /**
     * Container entrypoint override (Kubernetes `command`). Mostly useful with
     * `image` / `context` sources.
     */
    command?: string[];
    /**
     * Container arguments (Kubernetes `args`).
     */
    args?: string[];
    /**
     * Container CPU/memory requests + limits (Kubernetes resource quantities).
     */
    resources?: {
        requests?: {
            cpu?: string;
            memory?: string;
        };
        limits?: {
            cpu?: string;
            memory?: string;
        };
    };
    /**
     * Additional environment variables for the container.
     */
    env?: Record<string, any>;
    /**
     * Container image build architecture.
     * @default "amd64"
     */
    architecture?: "amd64" | "arm64";
    /**
     * Deep-partial Kubernetes Pod template merged into the synthesized
     * template (objects merge recursively; arrays and primitives replace) —
     * a literal object in the shape of `PodTemplateSpec`, e.g.
     * `{ spec: { tolerations: [...], nodeSelector: {...} } }`.
     */
    podTemplate?: Record<string, unknown>;
    /**
     * Cloud-specific workload-identity options, consumed by the cluster
     * platform's identity adapter (on EKS: `{ managedPolicyArns: [...] }`
     * attaches extra managed policies to the generated pod-identity role).
     */
    identity?: WorkloadIdentityOptions;
    /**
     * Deployment / pod labels, merged over the generated
     * `app.kubernetes.io/name` label. Also used as the Service selector.
     */
    labels?: Record<string, string>;
    /**
     * User-defined tags applied to workload-owned cloud resources (identity
     * roles, image repositories).
     */
    tags?: Record<string, string>;
}
/** Bundle an inline Effect program (`main`) into a generated image. */
export interface BundledDeploymentProps extends DeploymentPropsBase {
    /**
     * Module entrypoint for the bundled program. This should typically be
     * `import.meta.url` from an inline Effect program.
     */
    main: string;
    /**
     * Environment image used as the generated Dockerfile's `FROM`; must be
     * able to run the bun runtime.
     * @default "oven/bun:1"
     */
    image?: string;
    /** Named export to load from `main`. @default "default" */
    handler?: string;
    /** Bundler configuration for the entrypoint. */
    build?: WorkloadImageSource["build"];
    /** Environment Dockerfile (path or inline content). */
    dockerfile?: WorkloadImageSource["dockerfile"];
    /** Build context for a path {@link dockerfile} environment. */
    context?: string;
}
/** Build the user's own Dockerfile (`context` + optional `dockerfile` path). */
export interface DockerfileDeploymentProps extends DeploymentPropsBase {
    /** Docker build context directory. */
    context?: string;
    /**
     * Path to the Dockerfile (relative to the cwd), or inline content.
     * @default `${context}/Dockerfile`
     */
    dockerfile?: WorkloadImageSource["dockerfile"];
}
/** Run a pre-built registry image. */
export interface ImageDeploymentProps extends DeploymentPropsBase {
    /**
     * A pre-built image reference, e.g. `nginx:1.27`. On clusters with a
     * managed registry (EKS) the image is mirrored into it; elsewhere the
     * reference is used verbatim.
     */
    image: string;
}
export type DeploymentProps = BundledDeploymentProps | DockerfileDeploymentProps | ImageDeploymentProps;
export interface Deployment extends Resource<"Kubernetes.Deployment", DeploymentProps, {
    /** The connection of the cluster the deployment runs on. */
    connection: Connection;
    /** The Kubernetes namespace the deployment's objects live in. */
    namespace: string;
    /** The name of the Kubernetes Deployment. */
    deploymentName: string;
    /** The name of the Kubernetes Service exposing the deployment. */
    serviceName: string;
    /** The name of the service account the pods run as. */
    serviceAccountName: string;
    /** The container port the server listens on. */
    port: number;
    /** The URI of the container image the deployment runs. */
    imageUri: string;
    /**
     * Workload-identity state provisioned by the cluster platform's
     * adapter (on EKS: the pod-identity role + association).
     */
    identity: IdentityState | undefined;
    /**
     * Image-registry state provisioned by the cluster platform's adapter
     * (on EKS: the ECR repository).
     */
    registry: RegistryState | undefined;
    /**
     * The LoadBalancer URL (`http://<hostname>[:port]` — the cloud load
     * balancer listens on the Service `port`, so a non-80 port is part of
     * the URL) when `serviceType` is `LoadBalancer`, otherwise
     * `undefined`. May be `undefined` immediately after a create while
     * the cloud load balancer is still provisioning.
     */
    url: string | undefined;
    /** References to the Kubernetes objects created for the deployment. */
    kubernetesObjects: KubernetesObjectRef[];
    /** The content hash of the container image source. */
    code: {
        hash: string;
    };
}, WorkloadBindingContract, Providers> {
}
export type DeploymentServices = ServerHostService | WorkloadServices;
export type DeploymentShape = Main<DeploymentServices>;
export interface DeploymentRuntimeContext extends HostRuntimeContext {
    readonly Type: "Kubernetes.Deployment";
}
/**
 * A replicated Kubernetes server on any cluster — the Kubernetes analog of
 * `AWS.ECS.Service`.
 *
 * `Deployment` provisions a Kubernetes `Deployment` + `Service` (+
 * `ServiceAccount`) via server-side apply, plus — through the target
 * cluster's platform adapter — workload identity and a container image
 * from exactly one of three sources flat on props: `main` (bundle an
 * inline Effect program), `context` (build your own Dockerfile), or
 * `image` (a pre-built registry reference). On `AWS.EKS.Cluster` targets
 * it accepts the same `{ env, policyStatements }` host binding contract as
 * `AWS.Lambda.Function` and `AWS.ECS.Task`: every AWS `Binding.Service`
 * (S3, DynamoDB, SQS, …) attaches env vars to the pod spec and IAM policy
 * statements to a generated pod-identity role. On registry-less clusters
 * (`Kubernetes.KubeConfig(...)`) run pre-built `image` references and bind
 * through environment variables.
 * ### Creating a Deployment
 * **Example:** Remote image on EKS (external — no Effect runtime in the container)
 * ```typescript
 * const cluster = yield* AWS.EKS.Cluster("Cluster", { compute: "auto" });
 *
 * const nginx = yield* Kubernetes.Deployment("Nginx", {
 *   cluster,
 *   image: "nginx:1.27",
 *   namespace: "default",
 *   replicas: 3,
 *   port: 80,
 *   serviceType: "LoadBalancer",
 * });
 * nginx.url;            // LB URL, e.g. "http://k8s-….elb.amazonaws.com"
 * nginx.deploymentName; // K8s-native attrs
 * ```
 *
 * **Example:** Any cluster via kubeconfig
 * ```typescript
 * const local = Kubernetes.KubeConfig({ context: "kind-dev" });
 *
 * const api = yield* Kubernetes.Deployment("Api", {
 *   cluster: local,
 *   image: "ghcr.io/acme/api:v3",
 *   port: 8080,
 *   serviceType: "ClusterIP",
 * });
 * ```
 *
 * **Example:** Build your own Dockerfile
 * ```typescript
 * const legacy = yield* Kubernetes.Deployment("LegacyApp", {
 *   cluster,
 *   context: "./legacy",
 *   replicas: 2,
 *   port: 8080,
 * });
 * ```
 *
 * ### Effect Servers
 * **Example:** Inline Effect server with a DynamoDB binding (EKS)
 * ```typescript
 * const api = yield* Kubernetes.Deployment(
 *   "Api",
 *   { cluster, main: import.meta.url, port: 3000, replicas: 2 },
 *   Effect.gen(function* () {
 *     const putItem = yield* AWS.DynamoDB.PutItem(table);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         yield* putItem({ Item: { id: { S: "1" } } });
 *         return HttpServerResponse.text("ok");
 *       }),
 *     };
 *   }).pipe(Effect.provide(AWS.DynamoDB.PutItemHttp)),
 * );
 * ```
 *
 * **Example:** Tagged Effect server
 * ```typescript
 * export class Api extends Kubernetes.Deployment<Api, {
 *   health: () => Effect.Effect<string>;
 * }>()("Api") {}
 *
 * export default Api.make(
 *   { cluster, main: import.meta.url, port: 3000 },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.gen(function* () {
 *         return HttpServerResponse.text("ok");
 *       }),
 *       health: () => Effect.succeed("ok"),
 *     };
 *   }),
 * );
 * ```
 *
 * ### Bundling & Tree-shaking
 * `main` is bundled with rolldown at deploy time. Unused code is
 * tree-shaken. `effect`, alchemy, and `@distilled.cloud` are marked
 * pure so unused parts prune more aggressively. Your app is not
 * marked pure.
 *
 * **Example:** Mark additional packages as pure
 * Only list packages with no top-level side effects.
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * }
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: { pure: false },
 * }
 * ```
 *
 * ### Kubernetes Escape Hatch
 * **Example:** Tune the synthesized pod template
 * ```typescript
 * const tuned = yield* Kubernetes.Deployment("Api", {
 *   cluster,
 *   main: import.meta.url,
 *   port: 3000,
 *   podTemplate: {
 *     spec: {
 *       tolerations: [{ key: "gpu", operator: "Exists" }],
 *       nodeSelector: { pool: "arm" },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Deployment: Platform<Deployment, DeploymentServices, DeploymentShape, DeploymentRuntimeContext>;
export declare const DeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<Deployment>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | Stack | import("../Stage.ts").Stage>;
//# sourceMappingURL=Deployment.d.ts.map