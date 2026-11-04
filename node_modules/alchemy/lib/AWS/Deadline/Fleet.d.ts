import * as deadline from "@distilled.cloud/aws/deadline";
import type * as Duration from "effect/Duration";
import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type FleetStatus = deadline.FleetStatus;
/**
 * Worker auto-scaling settings for a fleet, with idle time expressed as a
 * `Duration.Input` (converted to whole seconds on the wire).
 */
export interface FleetAutoScalingConfiguration {
    /**
     * Number of idle workers kept on standby to absorb bursts.
     * @default 0
     */
    standbyWorkerCount?: number;
    /**
     * How long a worker may sit idle before it is scaled in
     * (wire: `workerIdleDurationSeconds`).
     * @default "5 minutes"
     */
    workerIdleDuration?: Duration.Input;
    /**
     * Maximum number of workers added per minute when scaling out.
     */
    scaleOutWorkersPerMinute?: number;
}
/**
 * Customer-managed fleet configuration (you run the worker hosts).
 */
export interface CustomerManagedFleetConfiguration extends Omit<deadline.CustomerManagedFleetConfiguration, "autoScalingConfiguration"> {
    /**
     * Auto-scaling behavior for `EVENT_BASED_AUTO_SCALING` mode.
     */
    autoScalingConfiguration?: FleetAutoScalingConfiguration;
}
/**
 * Persistent EBS volume settings for service-managed EC2 workers, with the
 * reuse TTL expressed as a `Duration.Input` (converted to whole hours on the
 * wire).
 */
export interface FleetPersistentVolumeConfiguration extends Omit<deadline.PersistentVolumeConfiguration, "lastUsedTtlHours"> {
    /**
     * How long an unused persistent volume is retained for reuse before it is
     * deleted (wire: `lastUsedTtlHours`).
     */
    lastUsedTtl?: Duration.Input;
}
/**
 * Service-managed EC2 fleet configuration (Deadline provisions instances).
 */
export interface ServiceManagedEc2FleetConfiguration extends Omit<deadline.ServiceManagedEc2FleetConfiguration, "autoScalingConfiguration" | "persistentVolumeConfiguration"> {
    /**
     * Auto-scaling behavior for the EC2 workers.
     */
    autoScalingConfiguration?: FleetAutoScalingConfiguration;
    /**
     * Persistent EBS volume reused across workers.
     */
    persistentVolumeConfiguration?: FleetPersistentVolumeConfiguration;
}
/**
 * Fleet configuration — either `customerManaged` (you run the workers) or
 * `serviceManagedEc2` (Deadline provisions EC2 instances).
 */
export type FleetConfiguration = {
    customerManaged: CustomerManagedFleetConfiguration;
    serviceManagedEc2?: never;
} | {
    customerManaged?: never;
    serviceManagedEc2: ServiceManagedEc2FleetConfiguration;
};
/**
 * Startup script run on each worker host, with the timeout expressed as a
 * `Duration.Input` (converted to whole seconds on the wire).
 */
export interface FleetHostConfiguration {
    /**
     * The script body executed when a worker host starts.
     */
    scriptBody: string | Redacted.Redacted<string>;
    /**
     * Maximum time the startup script may run before the worker is marked
     * unhealthy (wire: `scriptTimeoutSeconds`).
     * @default "5 minutes"
     */
    scriptTimeout?: Duration.Input;
}
export interface FleetProps {
    /**
     * The identifier of the farm the fleet belongs to. Changing it replaces
     * the fleet.
     */
    farmId: string;
    /**
     * Display name of the fleet.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * A description of the fleet.
     */
    description?: string;
    /**
     * ARN of the IAM role fleet workers assume (trusted by
     * `credentials.deadline.amazonaws.com`).
     */
    roleArn: string;
    /**
     * Minimum number of workers the fleet keeps running.
     * @default 0
     */
    minWorkerCount?: number;
    /**
     * Maximum number of workers the fleet scales to.
     */
    maxWorkerCount: number;
    /**
     * Fleet configuration — either `customerManaged` (you run the workers) or
     * `serviceManagedEc2` (Deadline provisions EC2 instances).
     */
    configuration: FleetConfiguration;
    /**
     * Script run on each worker host when it starts.
     */
    hostConfiguration?: FleetHostConfiguration;
    /**
     * Tags to associate with the fleet.
     */
    tags?: Record<string, string>;
}
export interface Fleet extends Resource<"AWS.Deadline.Fleet", FleetProps, {
    /**
     * The identifier of the farm the fleet belongs to.
     */
    farmId: string;
    /**
     * Service-assigned unique identifier of the fleet (`fleet-...`).
     */
    fleetId: string;
    /**
     * ARN of the fleet.
     */
    fleetArn: string;
    /**
     * The fleet's display name.
     */
    displayName: string;
    /**
     * Current lifecycle status of the fleet.
     */
    status: FleetStatus;
    /**
     * Number of workers currently in the fleet.
     */
    workerCount: number;
    /**
     * The configured minimum worker count.
     */
    minWorkerCount: number;
    /**
     * The configured maximum worker count.
     */
    maxWorkerCount: number;
    /**
     * ARN of the fleet's worker role.
     */
    roleArn: string;
    /**
     * Current tags reported for the fleet.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Deadline Cloud fleet — a group of workers (customer-managed hosts
 * or service-managed EC2 instances) that run render jobs from associated
 * queues.
 *
 * ### Creating Fleets
 * **Example:** Customer-Managed Fleet
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const fleet = yield* AWS.Deadline.Fleet("Workers", {
 *   farmId: farm.farmId,
 *   roleArn: fleetRole.roleArn,
 *   maxWorkerCount: 10,
 *   configuration: {
 *     customerManaged: {
 *       mode: "NO_SCALING",
 *       workerCapabilities: {
 *         vCpuCount: { min: 1 },
 *         memoryMiB: { min: 1024 },
 *         osFamily: "LINUX",
 *         cpuArchitectureType: "x86_64",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Service-Managed EC2 Fleet
 * ```typescript
 * const fleet = yield* AWS.Deadline.Fleet("Workers", {
 *   farmId: farm.farmId,
 *   roleArn: fleetRole.roleArn,
 *   minWorkerCount: 0,
 *   maxWorkerCount: 5,
 *   configuration: {
 *     serviceManagedEc2: {
 *       instanceCapabilities: {
 *         vCpuCount: { min: 2, max: 8 },
 *         memoryMiB: { min: 4096 },
 *         osFamily: "LINUX",
 *         cpuArchitectureType: "x86_64",
 *       },
 *       instanceMarketOptions: { type: "spot" },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Fleet: import("../../Resource.ts").ResourceClass<Fleet>;
declare const FleetProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FleetProvisioningFailed";
} & Readonly<A>;
/**
 * A fleet whose asynchronous provisioning converged to a terminal failed
 * status (`CREATE_FAILED` / `UPDATE_FAILED`).
 */
export declare class FleetProvisioningFailed extends FleetProvisioningFailed_base<{
    readonly fleetId: string;
    readonly status: string;
    readonly message: string | undefined;
}> {
}
export declare const FleetProvider: () => import("effect/Layer").Layer<Provider.Provider<Fleet>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Fleet.d.ts.map