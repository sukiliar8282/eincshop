/**
 * The `aws-eks` {@link ClusterAdapter}: everything platform-specific about
 * running `Kubernetes.*` workloads on Amazon EKS.
 *
 * - **connect** — SigV4 bearer tokens (STS presign) against the cluster
 *   endpoint, re-describing the cluster when the connection doesn't carry
 *   endpoint/CA (or they've gone stale).
 * - **identity** — EKS Pod Identity: a generated IAM role +
 *   `PodIdentityAssociation`, with `policyStatements` host bindings landed
 *   as the role's inline policy.
 * - **registry** — a per-workload ECR repository; `main` programs are
 *   bundled, `context` Dockerfiles built, and `image` refs mirrored into
 *   it.
 * - **bootstrap** — generated container entries wiring the AWS credential
 *   chain so Pod Identity's container-credentials endpoint resolves inside
 *   the pod.
 * - **loadBalancerDefaults** — EKS Auto Mode's `loadBalancerClass` and the
 *   internet-facing NLB scheme.
 *
 * Registered by `AWS.providers()`; resolved dynamically by the
 * `Kubernetes.*` providers via the connection's `auth.kind`.
 */
import { Credentials } from "@distilled.cloud/aws/Credentials";
import { Region } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import { type ClusterAdapterService } from "../../Kubernetes/ClusterAdapter.ts";
import type { Connection } from "../../Kubernetes/Connection.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
declare module "../../Kubernetes/Connection.ts" {
    interface AuthRegistry {
        /**
         * Authenticate against an Amazon EKS cluster with SigV4 bearer tokens
         * minted from the ambient AWS credentials. Contributed by
         * `AWS.providers()` — `AWS.EKS.Cluster` attributes expose a ready-made
         * `connection` carrying this descriptor.
         */
        "aws-eks": {
            /** The EKS cluster name. */
            clusterName: string;
            /**
             * The cluster's region.
             * @default the ambient AWS region
             */
            region?: string;
        };
    }
}
declare module "../../Kubernetes/ClusterAdapter.ts" {
    interface IdentityStateRegistry {
        /** EKS Pod Identity: generated IAM role + association. */
        "aws-pod-identity": {
            /** The ARN of the IAM role pods assume via Pod Identity. */
            roleArn: string;
            /** The name of the IAM role pods assume via Pod Identity. */
            roleName: string;
            /** The ARN of the Pod Identity association binding the role. */
            associationArn: string;
            /** The ID of the Pod Identity association binding the role. */
            associationId: string;
        };
    }
    interface RegistryStateRegistry {
        /** The per-workload ECR repository holding the image. */
        "aws-ecr": {
            /** The name of the ECR repository holding the image. */
            repositoryName: string;
            /** The URI of the ECR repository holding the image. */
            repositoryUri: string;
        };
    }
    interface WorkloadIdentityOptions {
        /**
         * Managed policy ARNs attached to the generated pod-identity role in
         * addition to the inline policy synthesized from bindings (EKS only).
         */
        managedPolicyArns?: string[];
    }
    interface WorkloadBindingContract {
        /**
         * IAM policy statements landed on the workload's pod-identity role
         * (EKS only) — the same host-binding channel as `AWS.Lambda.Function`
         * and `AWS.ECS.Task`.
         */
        policyStatements?: PolicyStatement[];
    }
    interface WorkloadServicesRegistry {
        /** AWS credential-chain services ambient inside EKS workload pods. */
        aws: Credentials | Region | AWSEnvironment;
    }
}
/** Services the adapter's methods close over at layer build. */
type EksAdapterDeps = Credentials | HttpClient | Region | AWSEnvironment | FileSystem.FileSystem | Path.Path;
/**
 * Build a {@link ClusterTransport} for an EKS cluster from known
 * endpoint/CA. Captures the ambient AWS services so the per-request token
 * mint is self-contained — used by the adapter and by the
 * `AWS.EKS.Cluster` provider's own kubernetes-object binding channel.
 */
export declare const makeEksTransport: (options: {
    clusterName: string;
    region?: string | undefined;
    endpoint: string;
    certificateAuthorityData: string;
}) => Effect.Effect<{
    endpoint: string;
    certificateAuthorityData: string;
    headers: Effect.Effect<{
        Authorization: string;
    }, import("effect/Cause").UnknownError | import("@distilled.cloud/aws/Credentials").CredentialsError, never>;
}, never, AWSEnvironment | Credentials>;
/**
 * The `Kubernetes.Connection` of an EKS cluster — stamped on
 * `AWS.EKS.Cluster` attributes so the cluster resource can be passed
 * directly as any `Kubernetes.*` workload's `cluster`.
 */
export declare const eksConnectionOf: (options: {
    clusterName: string;
    region: string;
    endpoint?: string | undefined;
    certificateAuthorityData?: string | undefined;
}) => Connection;
/**
 * Generated container entry for an Effect-native EKS server: resolves the
 * program's registered runners and serves the returned `{ fetch }` handler
 * on `PORT`. Credentials use the full chain so EKS Pod Identity's
 * container-credentials endpoint resolves inside the pod.
 */
export declare const makeEksServerBootstrap: (handler: string) => (importPath: string) => string;
/**
 * Generated container entry for an Effect-native EKS Job: resolves the
 * program's `run` effect, executes it to completion, and exits. No HTTP
 * server is started. Credentials use the full chain so EKS Pod Identity's
 * container-credentials endpoint resolves inside the pod.
 */
export declare const makeEksJobBootstrap: (handler: string) => (importPath: string) => string;
/**
 * The `aws-eks` cluster adapter layer. Provided (merged) by
 * `AWS.providers()` so the `Kubernetes.*` workload providers can resolve
 * it from the stack context.
 */
export declare const EksKubernetesAdapter: () => Layer.Layer<ClusterAdapterService, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Docker/Docker.ts").Docker | EksAdapterDeps>;
export {};
//# sourceMappingURL=KubernetesAdapter.d.ts.map