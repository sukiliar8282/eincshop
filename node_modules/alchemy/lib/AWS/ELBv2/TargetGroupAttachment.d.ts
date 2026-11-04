import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type TargetGroup, type TargetGroupArn } from "./TargetGroup.ts";
export interface TargetGroupAttachmentProps {
    /** The target group to register the target with. Changing it replaces the attachment. */
    targetGroupArn: Input<TargetGroupArn> | TargetGroup;
    /**
     * The target ID: an instance ID (`instance` target type), an IP address
     * (`ip`), a Lambda function ARN (`lambda`), or an ALB ARN (`alb`). Changing
     * it replaces the attachment.
     */
    targetId: string;
    /**
     * The port on which the target receives traffic. Defaults to the target
     * group port. Not applicable to `lambda` targets. Changing it replaces the
     * attachment.
     */
    port?: number;
    /**
     * The Availability Zone of the target. Set to `all` to register an IP
     * target outside the target group's VPC (e.g. an on-prem address). Changing
     * it replaces the attachment.
     */
    availabilityZone?: string;
}
export interface TargetGroupAttachment extends Resource<"AWS.ELBv2.TargetGroupAttachment", TargetGroupAttachmentProps, {
    /** The ARN of the target group the target is registered with. */
    targetGroupArn: TargetGroupArn;
    /** The registered target: an instance ID, IP address, or Lambda/ALB ARN. */
    targetId: string;
    /** The port the target receives traffic on, if applicable. */
    port: number | undefined;
    /** The Availability Zone the target was registered in, if specified. */
    availabilityZone: string | undefined;
}, never, Providers> {
}
/**
 * Registers a single target (instance, IP address, Lambda function, or ALB)
 * with an ELBv2 target group. ECS services register their own tasks, so this
 * resource matters for Lambda-behind-ALB, EC2 instances, and static IPs.
 *
 * For `lambda` targets, the Lambda function's resource policy must allow
 * `elasticloadbalancing.amazonaws.com` to invoke it, scoped to the target
 * group ARN — create a {@link Permission} first. The provider retries the
 * registration briefly while that permission propagates.
 * ### Registering Targets
 * **Example:** Lambda function target
 * ```typescript
 * const tg = yield* TargetGroup("fn", { targetType: "lambda" });
 * yield* Lambda.Permission("AlbInvoke", {
 *   action: "lambda:InvokeFunction",
 *   functionName: fn.functionArn.as<string>(),
 *   principal: "elasticloadbalancing.amazonaws.com",
 *   sourceArn: tg.targetGroupArn.as<string>(),
 * });
 * yield* TargetGroupAttachment("fn-target", {
 *   targetGroupArn: tg.targetGroupArn,
 *   targetId: fn.functionArn.as<string>(),
 * });
 * ```
 *
 * **Example:** IP address target
 * ```typescript
 * yield* TargetGroupAttachment("ip-target", {
 *   targetGroupArn: tg.targetGroupArn,
 *   targetId: "10.0.1.15",
 *   port: 8080,
 * });
 * ```
 *
 * **Example:** EC2 instance target
 * ```typescript
 * yield* TargetGroupAttachment("instance-target", {
 *   targetGroupArn: tg.targetGroupArn,
 *   targetId: instance.instanceId,
 *   port: 80,
 * });
 * ```
 *
 * @resource
 */
export declare const TargetGroupAttachment: import("../../Resource.ts").ResourceClass<TargetGroupAttachment>;
export declare const TargetGroupAttachmentProvider: () => import("effect/Layer").Layer<Provider.Provider<TargetGroupAttachment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TargetGroupAttachment.d.ts.map