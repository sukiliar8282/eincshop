import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type ComputeEnvironmentName = string;
export type ComputeEnvironmentArn = `arn:aws:batch:${RegionID}:${AccountID}:compute-environment/${ComputeEnvironmentName}`;
declare const NoDefaultVpcError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "NoDefaultVpcError";
} & Readonly<A>;
/**
 * Raised when networking is left implicit but the account/region has no
 * default VPC to fall back to.
 */
export declare class NoDefaultVpcError extends NoDefaultVpcError_base<{
    readonly message: string;
}> {
}
declare const ComputeEnvironmentInvalidError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ComputeEnvironmentInvalidError";
} & Readonly<A>;
/**
 * Raised when AWS Batch finishes reconciling a compute environment in an
 * unusable state. The status reason is preserved so callers see the actual
 * AWS configuration or dependency failure instead of receiving stale
 * `status: "INVALID"` attributes from a successful deployment.
 */
export declare class ComputeEnvironmentInvalidError extends ComputeEnvironmentInvalidError_base<{
    readonly computeEnvironmentName: string;
    readonly status: string;
    readonly statusReason: string | undefined;
    readonly message: string;
}> {
}
export interface ComputeEnvironmentProps {
    /**
     * Name of the compute environment. If omitted, a unique name is generated.
     * Up to 128 characters (letters, numbers, hyphens, underscores).
     */
    computeEnvironmentName?: string;
    /**
     * Whether AWS Batch manages the compute capacity. Unmanaged environments
     * are useful when capacity is registered separately, and do not require
     * subnets or security groups.
     * Changing this replaces the compute environment.
     * @default "MANAGED"
     */
    managementType?: "MANAGED" | "UNMANAGED";
    /**
     * Fargate capacity type for the managed compute environment.
     * Changing this replaces the compute environment.
     * @default "FARGATE"
     */
    type?: "FARGATE" | "FARGATE_SPOT";
    /**
     * Maximum number of Fargate vCPUs the environment can scale to.
     * @default 4
     */
    maxvCpus?: number;
    /**
     * Number of externally-managed vCPUs available to an unmanaged compute
     * environment.
     * @default 4
     */
    unmanagedvCpus?: number;
    /**
     * VPC subnets the Fargate tasks run in. If omitted, the default VPC's
     * subnets are used.
     */
    subnets?: string[];
    /**
     * Security groups for the Fargate tasks. If omitted, the default VPC's
     * default security group is used.
     */
    securityGroupIds?: string[];
    /**
     * Whether the compute environment accepts jobs from associated queues.
     * @default "ENABLED"
     */
    state?: "ENABLED" | "DISABLED";
    /**
     * Service role ARN. If omitted, AWS Batch uses (and auto-creates on first
     * use) the `AWSServiceRoleForBatch` service-linked role.
     */
    serviceRole?: string;
    /**
     * User-defined tags to apply to the compute environment.
     */
    tags?: Record<string, string>;
}
export interface ComputeEnvironment extends Resource<"AWS.Batch.ComputeEnvironment", ComputeEnvironmentProps, {
    computeEnvironmentName: ComputeEnvironmentName;
    computeEnvironmentArn: ComputeEnvironmentArn;
    ecsClusterArn: string | undefined;
    managementType: "MANAGED" | "UNMANAGED";
    type: "FARGATE" | "FARGATE_SPOT";
    state: "ENABLED" | "DISABLED";
    status: string;
    maxvCpus: number;
    unmanagedvCpus: number;
    subnets: string[];
    securityGroupIds: string[];
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Batch managed compute environment backed by Fargate (or Fargate
 * Spot) capacity. Fargate compute environments provision in seconds and
 * require no instance management.
 *
 * ### Creating Compute Environments
 * **Example:** Default Fargate Compute Environment
 * ```typescript
 * // Uses the default VPC's subnets and default security group.
 * const ce = yield* Batch.ComputeEnvironment("JobsCE", {});
 * ```
 *
 * **Example:** Unmanaged Compute Environment
 * ```typescript
 * const ce = yield* Batch.ComputeEnvironment("ExternalCapacity", {
 *   managementType: "UNMANAGED",
 *   unmanagedvCpus: 8,
 * });
 * ```
 *
 * **Example:** Fargate Spot with explicit networking
 * ```typescript
 * const ce = yield* Batch.ComputeEnvironment("SpotCE", {
 *   type: "FARGATE_SPOT",
 *   maxvCpus: 16,
 *   subnets: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [sg.groupId],
 * });
 * ```
 *
 * ### Composing the Batch chain
 * **Example:** Compute Environment → Job Queue
 * ```typescript
 * const ce = yield* Batch.ComputeEnvironment("JobsCE", {});
 * const queue = yield* Batch.JobQueue("JobsQueue", {
 *   computeEnvironments: [ce.computeEnvironmentArn],
 * });
 * ```
 *
 * @resource
 */
export declare const ComputeEnvironment: import("../../Resource.ts").ResourceClass<ComputeEnvironment>;
export declare const ComputeEnvironmentProvider: () => import("effect/Layer").Layer<Provider.Provider<ComputeEnvironment>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ComputeEnvironment.d.ts.map