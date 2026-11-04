import * as aas from "@distilled.cloud/aws/application-auto-scaling";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScalingPolicyProps {
    /**
     * Policy name. If omitted, a deterministic name is generated.
     *
     * Changing this triggers a replacement.
     */
    policyName?: string;
    /**
     * The namespace of the AWS service that provides the scalable target,
     * e.g. `ecs`, `dynamodb`.
     *
     * Changing this triggers a replacement.
     */
    serviceNamespace: aas.ServiceNamespace;
    /**
     * The identifier of the resource the policy's scalable target scales,
     * e.g. `service/{clusterName}/{serviceName}` or `table/{tableName}`.
     *
     * Changing this triggers a replacement.
     */
    resourceId: string;
    /**
     * The scalable dimension of the scalable target,
     * e.g. `ecs:service:DesiredCount` or `dynamodb:table:ReadCapacityUnits`.
     *
     * Changing this triggers a replacement.
     */
    scalableDimension: aas.ScalableDimension;
    /**
     * Target tracking configuration — track a predefined metric
     * (e.g. `ECSServiceAverageCPUUtilization`) or a customized CloudWatch
     * metric specification against a target value.
     *
     * Exactly one of `targetTracking` or `stepScaling` must be provided.
     */
    targetTracking?: aas.TargetTrackingScalingPolicyConfiguration;
    /**
     * Step scaling configuration — apply step adjustments in response to a
     * CloudWatch alarm you manage.
     *
     * Exactly one of `targetTracking` or `stepScaling` must be provided.
     */
    stepScaling?: aas.StepScalingPolicyConfiguration;
}
export interface ScalingPolicy extends Resource<"AWS.ApplicationAutoScaling.ScalingPolicy", ScalingPolicyProps, {
    /**
     * Name of the scaling policy.
     */
    policyName: string;
    /**
     * ARN of the scaling policy.
     */
    policyArn: string;
    /**
     * Namespace of the AWS service that provides the scalable target.
     */
    serviceNamespace: aas.ServiceNamespace;
    /**
     * Identifier of the scaled resource.
     */
    resourceId: string;
    /**
     * Scalable dimension the policy applies to.
     */
    scalableDimension: aas.ScalableDimension;
    /**
     * Policy type (`TargetTrackingScaling` or `StepScaling`).
     */
    policyType: aas.PolicyType;
    /**
     * CloudWatch alarms created and managed by Application Auto Scaling for
     * a target tracking policy.
     */
    alarms: {
        alarmName: string;
        alarmArn: string;
    }[];
}, never, Providers> {
}
/**
 * An Application Auto Scaling scaling policy attached to a scalable target.
 *
 * Supports `TargetTrackingScaling` (Application Auto Scaling creates and
 * manages the CloudWatch alarms) and `StepScaling` (you attach the policy to
 * your own alarm). The policy applies to the scalable target identified by
 * the (`serviceNamespace`, `resourceId`, `scalableDimension`) triple, which
 * must be registered (see {@link ScalableTarget}) before the policy is
 * created — pass the target's outputs so deployment orders correctly.
 * ### Target Tracking
 * **Example:** Track ECS Service CPU
 * ```typescript
 * const target = yield* ScalableTarget("ApiScaling", {
 *   serviceNamespace: "ecs",
 *   resourceId: Output.interpolate`service/${cluster.clusterName}/${service.serviceName}`,
 *   scalableDimension: "ecs:service:DesiredCount",
 *   minCapacity: 1,
 *   maxCapacity: 3,
 * });
 *
 * yield* ScalingPolicy("ApiCpuPolicy", {
 *   serviceNamespace: target.serviceNamespace,
 *   resourceId: target.resourceId,
 *   scalableDimension: target.scalableDimension,
 *   targetTracking: {
 *     TargetValue: 60,
 *     PredefinedMetricSpecification: {
 *       PredefinedMetricType: "ECSServiceAverageCPUUtilization",
 *     },
 *     ScaleOutCooldown: 60,
 *     ScaleInCooldown: 60,
 *   },
 * });
 * ```
 *
 * **Example:** Track a Customized Metric
 * ```typescript
 * yield* ScalingPolicy("QueueDepthPolicy", {
 *   serviceNamespace: target.serviceNamespace,
 *   resourceId: target.resourceId,
 *   scalableDimension: target.scalableDimension,
 *   targetTracking: {
 *     TargetValue: 100,
 *     CustomizedMetricSpecification: {
 *       MetricName: "ApproximateNumberOfMessagesVisible",
 *       Namespace: "AWS/SQS",
 *       Dimensions: [{ Name: "QueueName", Value: "my-queue" }],
 *       Statistic: "Average",
 *     },
 *   },
 * });
 * ```
 *
 * ### Step Scaling
 * **Example:** Step Adjustments
 * ```typescript
 * yield* ScalingPolicy("ApiStepPolicy", {
 *   serviceNamespace: target.serviceNamespace,
 *   resourceId: target.resourceId,
 *   scalableDimension: target.scalableDimension,
 *   stepScaling: {
 *     AdjustmentType: "ChangeInCapacity",
 *     Cooldown: 60,
 *     MetricAggregationType: "Average",
 *     StepAdjustments: [
 *       { MetricIntervalLowerBound: 0, ScalingAdjustment: 1 },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ScalingPolicy: import("../../Resource.ts").ResourceClass<ScalingPolicy>;
declare const ScalingPolicyConfigurationConflict_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ScalingPolicyConfigurationConflict";
} & Readonly<A>;
/**
 * Raised before any AWS call when a `ScalingPolicy` declares both or neither
 * of `targetTracking` / `stepScaling` — the two configurations are mutually
 * exclusive and exactly one is required.
 */
export declare class ScalingPolicyConfigurationConflict extends ScalingPolicyConfigurationConflict_base<{
    message: string;
}> {
}
export declare const ScalingPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ScalingPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ScalingPolicy.d.ts.map