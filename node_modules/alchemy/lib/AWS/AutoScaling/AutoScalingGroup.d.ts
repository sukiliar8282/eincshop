import type * as Duration from "effect/Duration";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { SubnetId } from "../EC2/Subnet.ts";
import type { LaunchTemplateId, LaunchTemplateName, LaunchTemplate as LaunchTemplateResource } from "./LaunchTemplate.ts";
export type AutoScalingGroupName = string;
export interface LaunchTemplateReference {
    /**
     * ID of the launch template (`lt-...`). Provide either the ID or the name,
     * not both.
     */
    launchTemplateId?: Input<LaunchTemplateId>;
    /**
     * Name of the launch template. Provide either the ID or the name, not both.
     */
    launchTemplateName?: Input<LaunchTemplateName>;
    /**
     * Template version to launch.
     * @default "$Default"
     */
    version?: Input<string | number>;
}
export interface AutoScalingGroupProps {
    /**
     * Auto Scaling Group name. If omitted, a deterministic name is generated.
     */
    autoScalingGroupName?: string;
    /**
     * Launch template used for instances in the fleet.
     */
    launchTemplate: Input<LaunchTemplateReference> | LaunchTemplateResource;
    /**
     * Subnets to place the fleet into.
     */
    subnetIds: Input<SubnetId[]>;
    /**
     * Minimum number of instances.
     */
    minSize: number;
    /**
     * Maximum number of instances.
     */
    maxSize: number;
    /**
     * Desired number of instances.
     * @default minSize
     */
    desiredCapacity?: number;
    /**
     * Target groups to attach to the fleet.
     */
    targetGroupArns?: Input<string[]>;
    /**
     * Health check type.
     * @default "ELB" when target groups are present, otherwise "EC2"
     */
    healthCheckType?: "EC2" | "ELB";
    /**
     * Grace period before health checks start, e.g. `"5 minutes"` or
     * `Duration.seconds(300)` (whole seconds on the wire).
     */
    healthCheckGracePeriod?: Duration.Input;
    /**
     * Default cooldown between scaling activities, e.g. `"5 minutes"` or
     * `Duration.seconds(300)` (whole seconds on the wire).
     */
    defaultCooldown?: Duration.Input;
    /**
     * Termination policies for scale-in.
     */
    terminationPolicies?: string[];
    /**
     * Tags to apply to the Auto Scaling Group itself.
     */
    tags?: Record<string, string>;
}
export interface AutoScalingGroup extends Resource<"AWS.AutoScaling.AutoScalingGroup", AutoScalingGroupProps, {
    /**
     * ARN of the Auto Scaling Group.
     */
    autoScalingGroupArn: string;
    /**
     * Name of the Auto Scaling Group.
     */
    autoScalingGroupName: AutoScalingGroupName;
    /**
     * ID of the launch template used by the fleet.
     */
    launchTemplateId?: string;
    /**
     * Name of the launch template used by the fleet.
     */
    launchTemplateName?: string;
    /**
     * Launch template version used by the fleet (e.g. `"$Default"` or a
     * version number).
     */
    launchTemplateVersion?: string;
    /**
     * Subnets the fleet is placed into.
     */
    subnetIds: string[];
    /**
     * Minimum number of instances.
     */
    minSize: number;
    /**
     * Maximum number of instances.
     */
    maxSize: number;
    /**
     * Desired number of instances.
     */
    desiredCapacity: number;
    /**
     * Load balancer target groups the fleet is registered with.
     */
    targetGroupArns: string[];
    /**
     * Health check type (`EC2` or `ELB`).
     */
    healthCheckType?: string;
    /**
     * Grace period in seconds before health checks start.
     */
    healthCheckGracePeriod?: number;
    /**
     * Default cooldown in seconds between scaling activities.
     */
    defaultCooldown?: number;
    /**
     * Termination policies applied on scale-in.
     */
    terminationPolicies?: string[];
    /**
     * Tags on the Auto Scaling Group.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An EC2 Auto Scaling Group that manages a fleet of instances from a launch
 * template and can register that fleet with one or more load balancer target
 * groups.
 *
 * Pair with {@link ScalingPolicy} for target-tracking scaling,
 * {@link ScheduledAction} for time-based capacity changes, and
 * {@link consumeLifecycleActions} to run a Lambda handler while instances
 * pause during launch/terminate transitions.
 * ### Creating an Auto Scaling Group
 * **Example:** Fleet from a Launch Template
 * ```typescript
 * import { AutoScalingGroup, LaunchTemplate } from "alchemy/AWS/AutoScaling";
 * import { Subnet, Vpc } from "alchemy/AWS/EC2";
 *
 * const vpc = yield* Vpc("Vpc", { cidrBlock: "10.0.0.0/16" });
 * const subnet = yield* Subnet("Subnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 * });
 *
 * const template = yield* LaunchTemplate("Template", {
 *   imageId: "ami-0abcdef1234567890",
 *   instanceType: "t3.micro",
 * });
 *
 * const group = yield* AutoScalingGroup("Fleet", {
 *   launchTemplate: template,
 *   subnetIds: [subnet.subnetId],
 *   minSize: 1,
 *   maxSize: 3,
 * });
 * ```
 *
 * **Example:** Reference an existing Launch Template by name
 * ```typescript
 * const group = yield* AutoScalingGroup("Fleet", {
 *   launchTemplate: { launchTemplateName: "my-template", version: 2 },
 *   subnetIds: [subnet.subnetId],
 *   minSize: 0,
 *   maxSize: 0,
 *   desiredCapacity: 0,
 * });
 * ```
 *
 * ### Load Balancing
 * **Example:** Register the fleet with a target group
 * ```typescript
 * const group = yield* AutoScalingGroup("WebFleet", {
 *   launchTemplate: template,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   minSize: 2,
 *   maxSize: 6,
 *   targetGroupArns: [targetGroup.targetGroupArn],
 *   // healthCheckType defaults to "ELB" when target groups are attached
 *   healthCheckGracePeriod: "5 minutes",
 * });
 * ```
 *
 * ### Scaling
 * **Example:** Track average CPU utilization
 * ```typescript
 * import { ScalingPolicy } from "alchemy/AWS/AutoScaling";
 *
 * yield* ScalingPolicy("CpuPolicy", {
 *   autoScalingGroup: group,
 *   predefinedMetricType: "ASGAverageCPUUtilization",
 *   targetValue: 60,
 * });
 * ```
 *
 * @resource
 */
export declare const AutoScalingGroup: import("../../Resource.ts").ResourceClass<AutoScalingGroup>;
export declare const AutoScalingGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<AutoScalingGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AutoScalingGroup.d.ts.map