import type * as Duration from "effect/Duration";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AutoScalingGroup as AutoScalingGroupResource } from "./AutoScalingGroup.ts";
export type LifecycleHookName = string;
/**
 * Lifecycle transition the hook fires on. The friendly `LAUNCHING` /
 * `TERMINATING` aliases map to the `autoscaling:EC2_INSTANCE_*` transition
 * strings the API expects.
 */
export type LifecycleTransition = "LAUNCHING" | "TERMINATING" | "autoscaling:EC2_INSTANCE_LAUNCHING" | "autoscaling:EC2_INSTANCE_TERMINATING";
export type LifecycleActionResult = "CONTINUE" | "ABANDON";
export declare const normalizeTransition: (transition: LifecycleTransition) => string;
export interface LifecycleHookProps {
    /**
     * Lifecycle hook name. If omitted, a deterministic name is generated.
     */
    lifecycleHookName?: string;
    /**
     * Auto Scaling Group to attach the hook to.
     */
    autoScalingGroup: Input<string> | AutoScalingGroupResource;
    /**
     * Instance state transition the hook pauses on. Use `LAUNCHING` to drain
     * before an instance enters service, `TERMINATING` to drain before it is
     * removed.
     */
    lifecycleTransition: LifecycleTransition;
    /**
     * Maximum time the instance stays in the wait state before the
     * `defaultResult` is applied, e.g. `"5 minutes"` or
     * `Duration.seconds(300)` (30 seconds–2 hours on the wire).
     * @default "1 hour"
     */
    heartbeatTimeout?: Duration.Input;
    /**
     * Action taken when the hook times out or the ASG is otherwise unable to
     * respond.
     * @default "ABANDON"
     */
    defaultResult?: LifecycleActionResult;
    /**
     * ARN of an SNS topic or SQS queue to notify when the transition occurs.
     * Omit to receive lifecycle events via EventBridge (the default target).
     */
    notificationTargetARN?: string;
    /**
     * ARN of the IAM role that permits the ASG to publish to
     * `notificationTargetARN`. Required when `notificationTargetARN` is set.
     */
    roleARN?: string;
    /**
     * Arbitrary metadata delivered with the lifecycle notification.
     */
    notificationMetadata?: string;
}
export interface LifecycleHook extends Resource<"AWS.AutoScaling.LifecycleHook", LifecycleHookProps, {
    /**
     * Name of the lifecycle hook.
     */
    lifecycleHookName: LifecycleHookName;
    /**
     * Name of the Auto Scaling Group the hook is attached to.
     */
    autoScalingGroupName: string;
    /**
     * The paused transition (e.g. `autoscaling:EC2_INSTANCE_LAUNCHING`).
     */
    lifecycleTransition: string;
    /**
     * Seconds an instance stays paused before `defaultResult` applies.
     */
    heartbeatTimeout: number;
    /**
     * Maximum total seconds an instance can remain in the wait state
     * (100x heartbeat, capped by AWS).
     */
    globalTimeout: number;
    /**
     * Action taken when the hook times out (`CONTINUE` or `ABANDON`).
     */
    defaultResult: string;
    /**
     * SNS/SQS target lifecycle notifications are published to, if any.
     */
    notificationTargetARN?: string;
    /**
     * IAM role used to publish to the notification target, if any.
     */
    roleARN?: string;
    /**
     * Metadata delivered with each lifecycle event.
     */
    notificationMetadata?: string;
}, never, Providers> {
}
/**
 * A lifecycle hook that pauses an Auto Scaling instance in a wait state on
 * launch or termination so a handler can drain connections, snapshot state, or
 * warm caches before the transition completes. Pair with
 * {@link consumeLifecycleActions} to receive the transition events and
 * {@link CompleteLifecycleAction} to signal `CONTINUE` / `ABANDON`.
 *
 * ### Creating a Lifecycle Hook
 * **Example:** Drain before termination (EventBridge target)
 * ```typescript
 * const hook = yield* LifecycleHook("Drain", {
 *   autoScalingGroup: group,
 *   lifecycleTransition: "TERMINATING",
 *   heartbeatTimeout: "300 seconds",
 *   defaultResult: "CONTINUE",
 * });
 * ```
 *
 * **Example:** Warm caches before an instance enters service
 * ```typescript
 * const hook = yield* LifecycleHook("Warm", {
 *   autoScalingGroup: group,
 *   lifecycleTransition: "LAUNCHING",
 *   heartbeatTimeout: "2 minutes",
 * });
 * ```
 *
 * @resource
 */
export declare const LifecycleHook: import("../../Resource.ts").ResourceClass<LifecycleHook>;
export declare const LifecycleHookProvider: () => import("effect/Layer").Layer<Provider.Provider<LifecycleHook>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LifecycleHook.d.ts.map