import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ComputeQuotaProps {
    /**
     * Name of the compute allocation. Maximum 63 characters, alphanumeric and
     * hyphens.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * ARN of the EKS-orchestrated HyperPod cluster the allocation applies to.
     * Changing the cluster replaces the allocation.
     */
    clusterArn: string;
    /**
     * The team the quota is allocated to (its name maps to a Kubernetes
     * namespace `hyperpod-ns-<team-name>`) and its fair-share weight.
     */
    computeQuotaTarget: sagemaker.ComputeQuotaTarget;
    /**
     * The allocation itself: instance-type quotas, the resource-sharing
     * strategy for idle compute, and whether the team's own tasks can preempt
     * each other.
     */
    computeQuotaConfig?: sagemaker.ComputeQuotaConfig;
    /**
     * Whether the quota is enforced.
     * @default "Enabled"
     */
    activationState?: sagemaker.ActivationState;
    /**
     * A description of the compute allocation.
     */
    description?: string;
    /**
     * Tags to associate with the compute allocation. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
/**
 * Kueue label selecting the task-governance queue. Set it on a
 * `Kubernetes.Job` / `Kubernetes.Deployment`'s `labels` with the quota's
 * `queueName` attribute to submit the workload through HyperPod task
 * governance.
 */
export declare const KUEUE_QUEUE_NAME_LABEL = "kueue.x-k8s.io/queue-name";
/**
 * Kueue label selecting the task-governance priority class. Its value is
 * `<PriorityClass name>-priority` for a class declared on the cluster's
 * `AWS.SageMaker.ClusterSchedulerConfig`.
 */
export declare const KUEUE_PRIORITY_CLASS_LABEL = "kueue.x-k8s.io/priority-class";
export interface ComputeQuota extends Resource<"AWS.SageMaker.ComputeQuota", ComputeQuotaProps, {
    /**
     * The compute allocation's ID.
     */
    computeQuotaId: string;
    /**
     * ARN of the compute allocation.
     */
    computeQuotaArn: string;
    /**
     * The compute allocation's name.
     */
    name: string;
    /**
     * ARN of the HyperPod cluster the allocation applies to.
     */
    clusterArn: string;
    /**
     * The allocation's current version (incremented on every update).
     */
    computeQuotaVersion: number;
    /**
     * The team the quota is allocated to. Task governance materializes the
     * `hyperpod-ns-<teamName>` namespace and its Kueue LocalQueue from it.
     */
    teamName: string;
    /**
     * The Kubernetes namespace task governance materializes for the team
     * (`hyperpod-ns-<teamName>`). Pass it as a governed
     * `Kubernetes.Job` / `Kubernetes.Deployment`'s `namespace`.
     */
    namespace: string;
    /**
     * The team's Kueue LocalQueue name
     * (`hyperpod-ns-<teamName>-localqueue`). Set it on a governed
     * workload's `labels` under {@link KUEUE_QUEUE_NAME_LABEL}.
     */
    queueName: string;
}, never, Providers> {
}
/**
 * A SageMaker HyperPod compute allocation (task governance) — reserves
 * instance capacity on an EKS-orchestrated HyperPod cluster for a team,
 * with fair-share weights and borrow/lend rules for idle compute.
 * ### Creating Compute Allocations
 * **Example:** Team Quota with Borrowing
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const quota = yield* AWS.SageMaker.ComputeQuota("ResearchQuota", {
 *   clusterArn: hyperpod.clusterArn,
 *   computeQuotaTarget: { TeamName: "research", FairShareWeight: 10 },
 *   computeQuotaConfig: {
 *     ComputeQuotaResources: [{ InstanceType: "ml.g5.xlarge", Count: 2 }],
 *     ResourceSharingConfig: { Strategy: "Lend", BorrowLimit: 50 },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ComputeQuota: import("../../Resource.ts").ResourceClass<ComputeQuota>;
declare const ComputeQuotaFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ComputeQuotaFailed";
} & Readonly<A>;
/**
 * The compute allocation converged to a terminal failed status.
 */
export declare class ComputeQuotaFailed extends ComputeQuotaFailed_base<{
    readonly quotaId: string;
    readonly status: string | undefined;
    readonly message: string | undefined;
}> {
}
export declare const ComputeQuotaProvider: () => import("effect/Layer").Layer<Provider.Provider<ComputeQuota>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ComputeQuota.d.ts.map