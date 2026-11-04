import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Output from "../../Output.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type ClusterStatus = sagemaker.ClusterStatus;
/**
 * The well-known node label carrying the HyperPod instance-group name.
 * HyperPod nodes join the orchestrating EKS cluster as ordinary Kubernetes
 * nodes carrying this label.
 */
export declare const HYPERPOD_INSTANCE_GROUP_LABEL = "sagemaker.amazonaws.com/instance-group-name";
/** The well-known node label carrying HyperPod's node health verdict. */
export declare const HYPERPOD_NODE_HEALTH_LABEL = "sagemaker.amazonaws.com/node-health-status";
/**
 * An instance group surfaced on the cluster's attributes — Kubernetes
 * workloads pin themselves to the group by referencing its
 * {@link ClusterInstanceGroupRef.nodeSelector}.
 */
export interface ClusterInstanceGroupRef {
    /** The group's name (the `sagemaker.amazonaws.com/instance-group-name` node label). */
    InstanceGroupName: string;
    /** The group's instance type (e.g. `ml.g5.xlarge`). */
    InstanceType: string | undefined;
    /** Instances currently in service. */
    CurrentCount: number | undefined;
    /** Instances the group is converging toward. */
    TargetCount: number | undefined;
    /**
     * A Kubernetes node selector pinning pods onto this group's
     * health-checked nodes — pass it to a `Kubernetes.Job` /
     * `Kubernetes.Deployment` through the `podTemplate` escape hatch:
     *
     * ```ts
     * podTemplate: {
     *   spec: { nodeSelector: hyperpod.instanceGroups.workers.nodeSelector },
     * }
     * ```
     */
    nodeSelector: Record<string, string>;
}
/**
 * One instance group's specification, sans name — the group's name is the
 * key in {@link ClusterProps.instanceGroups}.
 */
export type ClusterInstanceGroup = Omit<sagemaker.ClusterInstanceGroupSpecification, "InstanceGroupName">;
/**
 * One restricted instance group's specification, sans name — the group's
 * name is the key in {@link ClusterProps.restrictedInstanceGroups}.
 */
export type ClusterRestrictedInstanceGroup = Omit<sagemaker.ClusterRestrictedInstanceGroupSpecification, "InstanceGroupName">;
export interface ClusterProps {
    /**
     * Name of the HyperPod cluster. Maximum 63 characters, alphanumeric and
     * hyphens.
     * @default ${app}-${stage}-${id}
     */
    clusterName?: string;
    /**
     * The instance groups of the cluster, keyed by group name. Each group
     * specifies its instance type, instance count, lifecycle config (S3 URI
     * + `on_create` script) and execution role.
     *
     * Groups are updated in place; removing a key deletes the group from the
     * cluster. The keys carry through to the cluster's `instanceGroups`
     * attribute, so `hyperpod.instanceGroups.workers` is typed per key.
     */
    instanceGroups?: Record<string, ClusterInstanceGroup>;
    /**
     * Restricted instance groups for HyperPod clusters running Amazon-managed
     * workloads (e.g. Nova model customization), keyed by group name.
     */
    restrictedInstanceGroups?: Record<string, ClusterRestrictedInstanceGroup>;
    /**
     * Shared environment configuration (e.g. FSx for Lustre) for restricted
     * instance groups.
     */
    restrictedInstanceGroupsConfig?: sagemaker.ClusterRestrictedInstanceGroupsConfig;
    /**
     * VPC to launch the cluster's nodes into. Changing the VPC replaces the
     * cluster.
     */
    vpcConfig?: sagemaker.VpcConfig;
    /**
     * The cluster's orchestrator. Set `{ Eks: { ClusterArn } }` to attach the
     * HyperPod cluster to an EKS control plane; defaults to Slurm when
     * omitted.
     */
    orchestrator?: sagemaker.ClusterOrchestrator;
    /**
     * Whether HyperPod automatically replaces faulty nodes.
     * @default "Automatic"
     */
    nodeRecovery?: sagemaker.ClusterNodeRecovery;
    /**
     * Managed tiered storage (memory + local NVMe) configuration for
     * checkpointing.
     */
    tieredStorageConfig?: sagemaker.ClusterTieredStorageConfig;
    /**
     * Set to `"Continuous"` to enable continuous node provisioning, where
     * HyperPod provisions capacity as it becomes available instead of
     * all-or-nothing.
     */
    nodeProvisioningMode?: sagemaker.ClusterNodeProvisioningMode;
    /**
     * ARN of the IAM role HyperPod assumes for cluster-level operations
     * (required for continuous provisioning and autoscaling).
     */
    clusterRole?: string;
    /**
     * Cluster autoscaling configuration (e.g. Karpenter) for EKS-orchestrated
     * clusters.
     */
    autoScaling?: sagemaker.ClusterAutoScalingConfig;
    /**
     * Tags to associate with the cluster. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.SageMaker.Cluster", ClusterProps, {
    /**
     * The cluster's name.
     */
    clusterName: string;
    /**
     * ARN of the cluster.
     */
    clusterArn: string;
    /**
     * The cluster's status (`InService` once reconciled).
     */
    clusterStatus: ClusterStatus;
    /**
     * ARN of the orchestrating EKS cluster, when EKS-orchestrated.
     */
    orchestratorEksClusterArn: string | undefined;
    /**
     * The cluster's instance groups, keyed by group name. Pin a
     * Kubernetes workload onto a group through the resource graph with
     * its node selector:
     * `hyperpod.instanceGroups.workers.nodeSelector`.
     */
    instanceGroups: Record<string, ClusterInstanceGroupRef>;
}, never, Providers> {
}
declare const ClusterResource: import("../../Resource.ts").ResourceClass<Cluster>;
/**
 * A `Cluster` narrowed to the instance-group keys declared in its props —
 * `hyperpod.instanceGroups.workers` is typed per key, and a typo'd key is
 * a compile error.
 */
export type ClusterOf<Groups> = Omit<Cluster, "instanceGroups"> & {
    instanceGroups: Output.ObjectExpr<{
        [K in keyof Groups]: ClusterInstanceGroupRef;
    }, never>;
};
/**
 * An Amazon SageMaker HyperPod cluster — a resilient, persistent cluster of
 * ML compute for distributed training and inference, orchestrated by Slurm
 * or EKS, with automatic faulty-node recovery and deep health checks.
 *
 * Provisioning a HyperPod cluster takes 10–25 minutes; instance groups are
 * updated in place and removing a group from `instanceGroups` deletes it
 * from the cluster.
 * ### Creating Clusters
 * **Example:** Slurm-Orchestrated Cluster
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const cluster = yield* AWS.SageMaker.Cluster("TrainingCluster", {
 *   instanceGroups: {
 *     controller: {
 *       InstanceType: "ml.t3.medium",
 *       InstanceCount: 1,
 *       ExecutionRole: role.roleArn,
 *       LifeCycleConfig: {
 *         SourceS3Uri: `s3://${bucket.bucketName}/lifecycle`,
 *         OnCreate: "on_create.sh",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** EKS-Orchestrated Cluster
 * ```typescript
 * // The EKS cluster must use the `API` (or `API_AND_CONFIG_MAP`)
 * // authentication mode — pass `accessConfig` explicitly, EKS's own
 * // CONFIG_MAP default is rejected. LifeCycleConfig is required for
 * // EKS-orchestrated instance groups too.
 * const hyperpod = yield* AWS.SageMaker.Cluster("EksHyperPod", {
 *   orchestrator: { Eks: { ClusterArn: eksCluster.clusterArn } },
 *   vpcConfig: {
 *     SecurityGroupIds: [securityGroupId],
 *     Subnets: network.privateSubnetIds,
 *   },
 *   instanceGroups: {
 *     workers: {
 *       InstanceType: "ml.g5.xlarge",
 *       InstanceCount: 2,
 *       ExecutionRole: role.roleArn,
 *       LifeCycleConfig: {
 *         SourceS3Uri: `s3://${bucket.bucketName}/lifecycle`,
 *         OnCreate: "on_create.sh",
 *       },
 *     },
 *   },
 *   nodeRecovery: "Automatic",
 * });
 *
 * // The keys carry through to the attributes — typed per key:
 * const workers = hyperpod.instanceGroups.workers;
 * ```
 *
 * ### Running Workloads (Slurm)
 * **Example:** Submit jobs from the login node over SSM
 * ```sh
 * # Slurm jobs are submitted on the cluster itself. Each node is an SSM
 * # target named sagemaker-cluster:<cluster-id>_<instance-group>-<instance-id>
 * # (list nodes with `aws sagemaker list-cluster-nodes`).
 * aws ssm start-session \
 *   --target sagemaker-cluster:6wl4at0i68c6_controller-i-0123456789abcdef0
 * # then, on the node:
 * sbatch --nodes=4 train.sbatch
 * ```
 *
 * ### Running Workloads (EKS)
 * **Example:** Low level: apply any Kubernetes manifest to the orchestrator
 * ```typescript
 * // HyperPod nodes are ordinary EKS nodes — target them from a raw
 * // manifest (a PyTorchJob CRD, a batch/v1 Job, ...) with the well-known
 * // node labels.
 * const job = yield* AWS.EKS.Manifest("RawTrainJob", {
 *   cluster: eksCluster,
 *   manifest: {
 *     apiVersion: "batch/v1",
 *     kind: "Job",
 *     metadata: { name: "raw-train", namespace: "default" },
 *     spec: {
 *       template: {
 *         spec: {
 *           nodeSelector: {
 *             "sagemaker.amazonaws.com/node-health-status": "Schedulable",
 *             "sagemaker.amazonaws.com/instance-group-name": "workers",
 *           },
 *           containers: [{ name: "train", image: "ghcr.io/acme/train:v3" }],
 *           restartPolicy: "Never",
 *         },
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** High level: an effectful Job pinned to HyperPod nodes
 * ```typescript
 * // Kubernetes.Job / Kubernetes.Deployment run on HyperPod via the
 * // orchestrating EKS cluster in plain Kubernetes vocabulary — the
 * // HyperPod resources expose the derived values as attributes: the
 * // group's `nodeSelector`, the quota's governed `namespace` and Kueue
 * // `queueName`.
 * const evaluate = yield* Kubernetes.Job(
 *   "Evaluate",
 *   {
 *     cluster: eksCluster,
 *     main: import.meta.url,
 *     namespace: quota.namespace,
 *     labels: {
 *       [AWS.SageMaker.KUEUE_QUEUE_NAME_LABEL]: quota.queueName,
 *       [AWS.SageMaker.KUEUE_PRIORITY_CLASS_LABEL]: "training-priority",
 *     },
 *     podTemplate: {
 *       spec: {
 *         nodeSelector: hyperpod.instanceGroups.workers.nodeSelector,
 *       },
 *     },
 *   },
 *   Effect.gen(function* () {
 *     const putItem = yield* AWS.DynamoDB.PutItem(resultsTable);
 *     return {
 *       run: Effect.gen(function* () {
 *         // evaluation logic; bindings land IAM on the pod-identity role
 *       }),
 *     };
 *   }).pipe(Effect.provide(AWS.DynamoDB.PutItemHttp)),
 * );
 * ```
 *
 * ### Task Governance
 * **Example:** Prioritize workloads with a scheduler policy and team quotas
 * ```typescript
 * // Requires the amazon-sagemaker-hyperpod-taskgovernance EKS add-on.
 * const policy = yield* AWS.SageMaker.ClusterSchedulerConfig("Scheduler", {
 *   clusterArn: hyperpod.clusterArn,
 *   schedulerConfig: {
 *     PriorityClasses: [{ Name: "training", Weight: 90 }],
 *     FairShare: "Enabled",
 *   },
 * });
 *
 * // Creates the hyperpod-ns-research namespace + Kueue LocalQueue —
 * // exposed as `quota.namespace` / `quota.queueName` for governed
 * // Kubernetes workloads to reference.
 * const quota = yield* AWS.SageMaker.ComputeQuota("ResearchQuota", {
 *   clusterArn: hyperpod.clusterArn,
 *   computeQuotaTarget: { TeamName: "research", FairShareWeight: 10 },
 *   computeQuotaConfig: {
 *     ComputeQuotaResources: [
 *       { InstanceType: "ml.g5.xlarge", Count: 1 },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: {
    <const Props extends {
        [prop in keyof ClusterProps]: Input<ClusterProps[prop]>;
    }>(id: string, props: Props | Effect.Effect<Props>): Effect.Effect<ClusterOf<NonNullable<Props["instanceGroups"]>>, never, Providers>;
} & typeof ClusterResource;
declare const ClusterFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ClusterFailed";
} & Readonly<A>;
/**
 * The cluster converged to the terminal `Failed` status.
 */
export declare class ClusterFailed extends ClusterFailed_base<{
    readonly clusterName: string;
    readonly message: string | undefined;
}> {
}
declare const ClusterTeardownBlocked_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ClusterTeardownBlocked";
} & Readonly<A>;
/**
 * The cluster is stuck in `Deleting` because SageMaker's internal teardown
 * cannot proceed — e.g. the instance group's execution role (which HyperPod
 * assumes to delete node ENIs) was deleted or lost its
 * `ec2:DeleteNetworkInterface` / `ec2:DeleteNetworkInterfacePermission`
 * permissions mid-teardown. Retrying `deleteCluster` can never fix this;
 * the role and its permissions must be restored out-of-band, after which
 * SageMaker's own retry completes the deletion within a minute.
 */
export declare class ClusterTeardownBlocked extends ClusterTeardownBlocked_base<{
    readonly clusterName: string;
    readonly message: string;
}> {
}
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Cluster.d.ts.map