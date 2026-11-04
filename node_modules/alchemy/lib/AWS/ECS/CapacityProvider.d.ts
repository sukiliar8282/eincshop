import * as ecs from "@distilled.cloud/aws/ecs";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type CapacityProviderName = string;
export type CapacityProviderArn = `arn:aws:ecs:${RegionID}:${AccountID}:capacity-provider/${CapacityProviderName}`;
export interface CapacityProviderProps {
    /**
     * Capacity provider name. If omitted, a deterministic name is generated.
     *
     * Names beginning with `aws`, `ecs`, or `fargate` are reserved by AWS.
     * Changing this triggers a replacement.
     */
    name?: string;
    /**
     * ARN of the EC2 Auto Scaling Group that backs this capacity provider.
     *
     * Cannot be changed after creation; changing this triggers a replacement.
     */
    autoScalingGroupArn: Input<string>;
    /**
     * Managed scaling configuration applied by ECS to the underlying ASG.
     */
    managedScaling?: ecs.ManagedScaling;
    /**
     * Whether ECS protects in-use container instances from ASG scale-in.
     * @default "DISABLED"
     */
    managedTerminationProtection?: ecs.ManagedTerminationProtection;
    /**
     * Whether ECS sets container instances to DRAINING when terminated by ASG.
     * @default "DISABLED"
     */
    managedDraining?: ecs.ManagedDraining;
    /**
     * User-defined tags to apply to the capacity provider.
     */
    tags?: Record<string, string>;
}
export interface CapacityProvider extends Resource<"AWS.ECS.CapacityProvider", CapacityProviderProps, {
    /** The ARN of the capacity provider. */
    capacityProviderArn: CapacityProviderArn;
    /** The name of the capacity provider. */
    name: CapacityProviderName;
    /** The current status, e.g. `ACTIVE`. */
    status: ecs.CapacityProviderStatus;
    /** The status of the most recent update to the provider. */
    updateStatus: ecs.CapacityProviderUpdateStatus | undefined;
    /** The Auto Scaling group backing the provider. */
    autoScalingGroupArn: string;
    /** The managed scaling configuration. */
    managedScaling: ecs.ManagedScaling | undefined;
    /** Whether managed termination protection is enabled. */
    managedTerminationProtection: ecs.ManagedTerminationProtection | undefined;
    /** Whether managed instance draining is enabled. */
    managedDraining: ecs.ManagedDraining | undefined;
    /** The tags attached to the capacity provider. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon ECS capacity provider backed by an EC2 Auto Scaling Group.
 *
 * Capacity providers are associated with one or more ECS clusters via
 * {@link Cluster#capacityProviders} and are referenced by a service or task's
 * capacity provider strategy.
 *
 * Only EC2 Auto Scaling Group-backed capacity providers are currently
 * supported. The reserved AWS providers `FARGATE` and `FARGATE_SPOT` do not
 * need to be created and can be referenced by name on a `Cluster` directly.
 * ### Creating Capacity Providers
 * **Example:** ASG-Backed Capacity Provider
 * ```typescript
 * const provider = yield* CapacityProvider("AppCapacityProvider", {
 *   autoScalingGroupArn: asg.autoScalingGroupArn,
 *   managedScaling: {
 *     status: "ENABLED",
 *     targetCapacity: 80,
 *     minimumScalingStepSize: 1,
 *     maximumScalingStepSize: 10,
 *   },
 *   managedTerminationProtection: "ENABLED",
 * });
 *
 * yield* Cluster("AppCluster", {
 *   capacityProviders: [provider.name],
 *   defaultCapacityProviderStrategy: [
 *     { capacityProvider: provider.name, weight: 1 },
 *   ],
 * });
 * ```
 *
 * ### Adopting Existing Capacity Providers
 * Foreign-tagged capacity providers (i.e. providers that exist in AWS but were
 * not created by this stack/stage/logical-id) are surfaced as `Unowned` by
 * `read`, and the engine fails with `OwnedBySomeoneElse` unless adoption is
 * explicitly opted in via `--adopt` or {@link adopt}.
 * **Example:** Adopt an existing provider
 * ```typescript
 * import { adopt } from "alchemy/AdoptPolicy";
 *
 * yield* CapacityProvider("AppCapacityProvider", {
 *   name: "existing-provider",
 *   autoScalingGroupArn: asg.autoScalingGroupArn,
 * }).pipe(adopt());
 * ```
 *
 * @resource
 */
export declare const CapacityProvider: import("../../Resource.ts").ResourceClass<CapacityProvider>;
export declare const CapacityProviderProvider: () => import("effect/Layer").Layer<Provider.Provider<CapacityProvider>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CapacityProvider.d.ts.map