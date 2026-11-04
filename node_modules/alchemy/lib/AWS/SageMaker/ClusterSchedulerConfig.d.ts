import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type SchedulerResourceStatus = sagemaker.SchedulerResourceStatus;
export interface ClusterSchedulerConfigProps {
    /**
     * Name of the cluster policy. Maximum 63 characters, alphanumeric and
     * hyphens.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * ARN of the EKS-orchestrated HyperPod cluster the policy applies to.
     * Changing the cluster replaces the policy. AWS allows ONE cluster
     * policy per cluster — creating a second fails with the typed
     * `ClusterSchedulerConfigAlreadyExists` error.
     */
    clusterArn: string;
    /**
     * The policy itself: task priority classes, fair-share allocation, and
     * idle-resource sharing.
     */
    schedulerConfig?: sagemaker.SchedulerConfig;
    /**
     * A description of the cluster policy.
     */
    description?: string;
    /**
     * Tags to associate with the cluster policy. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface ClusterSchedulerConfig extends Resource<"AWS.SageMaker.ClusterSchedulerConfig", ClusterSchedulerConfigProps, {
    /**
     * The cluster policy's ID.
     */
    clusterSchedulerConfigId: string;
    /**
     * ARN of the cluster policy.
     */
    clusterSchedulerConfigArn: string;
    /**
     * The cluster policy's name.
     */
    name: string;
    /**
     * ARN of the HyperPod cluster the policy applies to.
     */
    clusterArn: string;
    /**
     * The policy's current version (incremented on every update).
     */
    clusterSchedulerConfigVersion: number;
}, never, Providers> {
}
/**
 * A SageMaker HyperPod cluster policy (task governance) — configures how an
 * EKS-orchestrated HyperPod cluster prioritizes tasks and allocates idle
 * compute across teams via priority classes and fair-share weights.
 * ### Creating Cluster Policies
 * **Example:** Priority Classes with Fair-Share
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const policy = yield* AWS.SageMaker.ClusterSchedulerConfig("Scheduler", {
 *   clusterArn: hyperpod.clusterArn,
 *   schedulerConfig: {
 *     PriorityClasses: [
 *       { Name: "inference", Weight: 100 },
 *       { Name: "training", Weight: 75 },
 *     ],
 *     FairShare: "Enabled",
 *   },
 *   description: "Prioritize inference over training",
 * });
 * ```
 *
 * @resource
 */
export declare const ClusterSchedulerConfig: import("../../Resource.ts").ResourceClass<ClusterSchedulerConfig>;
declare const SchedulerConfigFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SchedulerConfigFailed";
} & Readonly<A>;
/**
 * The cluster policy converged to a terminal failed status.
 */
export declare class SchedulerConfigFailed extends SchedulerConfigFailed_base<{
    readonly configId: string;
    readonly status: string | undefined;
    readonly message: string | undefined;
}> {
}
export declare const ClusterSchedulerConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<ClusterSchedulerConfig>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ClusterSchedulerConfig.d.ts.map