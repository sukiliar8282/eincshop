import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AccountID } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
export type TargetGroupName = string;
export type TargetGroupArn = `arn:aws:elasticloadbalancing:${RegionID}:${AccountID}:targetgroup/${string}`;
export interface TargetGroupProps {
    /** The target group name. If omitted, a unique name is generated. Changing it replaces the target group. */
    name?: string;
    /** The VPC the targets live in. Not required for `lambda` targets. Changing it replaces the target group. */
    vpcId?: string;
    /** The port on which targets receive traffic. Changing it replaces the target group. */
    port?: number;
    /**
     * The protocol for routing traffic to targets. Changing it replaces the
     * target group.
     * @default "HTTP"
     */
    protocol?: "HTTP" | "HTTPS" | "TCP" | "UDP" | "TCP_UDP" | "TLS" | "GENEVE";
    /**
     * The application protocol version. Use `GRPC` for gRPC, `HTTP2` for HTTP/2.
     * Changing it replaces the target group.
     */
    protocolVersion?: "HTTP1" | "HTTP2" | "GRPC";
    /**
     * The target type. Changing it replaces the target group.
     * @default "ip"
     */
    targetType?: "ip" | "instance" | "lambda" | "alb";
    /** The IP address type (`ipv4`/`ipv6`). Changing it replaces the target group. */
    ipAddressType?: "ipv4" | "ipv6";
    /** The health-check path (HTTP/HTTPS). Updated in place. */
    healthCheckPath?: string;
    /** The health-check port. Updated in place. */
    healthCheckPort?: string;
    /** The health-check protocol. Updated in place. */
    healthCheckProtocol?: string;
    /** Whether health checks are enabled. Updated in place. */
    healthCheckEnabled?: boolean;
    /** The approximate interval between health checks — e.g. `"15 seconds"`. Sent to AWS as whole seconds. Updated in place. */
    healthCheckInterval?: Duration.Input;
    /** The amount of time to wait for a health-check response — e.g. `"5 seconds"`. Sent to AWS as whole seconds. Updated in place. */
    healthCheckTimeout?: Duration.Input;
    /** The number of consecutive successes before a target is healthy. Updated in place. */
    healthyThresholdCount?: number;
    /** The number of consecutive failures before a target is unhealthy. Updated in place. */
    unhealthyThresholdCount?: number;
    /** The HTTP/gRPC codes used to determine a healthy response. Updated in place. */
    matcher?: {
        HttpCode?: string;
        GrpcCode?: string;
    };
    /** Raw target-group attributes (deregistration delay, stickiness, slow start, ...). */
    attributes?: Record<string, string>;
    /** Tags to apply to the target group. */
    tags?: Record<string, string>;
}
export interface TargetGroup extends Resource<"AWS.ELBv2.TargetGroup", TargetGroupProps, {
    /** The ARN of the target group. */
    targetGroupArn: TargetGroupArn;
    /** The name of the target group. */
    targetGroupName: TargetGroupName;
    /** Undefined for `lambda` target groups (they have no port). */
    port: number | undefined;
    /** Undefined for `lambda` target groups (they have no protocol). */
    protocol: string | undefined;
    /** The target type (`instance`, `ip`, `lambda`, or `alb`). */
    targetType: string;
    /** Undefined for `lambda` target groups (they are not VPC-scoped). */
    vpcId: string | undefined;
    /** The tags applied to the target group. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An ELBv2 target group. A target group routes requests to one or more
 * registered targets (instances, IPs, Lambda functions, or another ALB) using
 * the configured protocol and port, and runs health checks against them.
 * ### Creating a Target Group
 * **Example:** HTTP target group
 * ```typescript
 * const tg = yield* TargetGroup("web", {
 *   vpcId: vpc.vpcId,
 *   port: 80,
 *   protocol: "HTTP",
 *   targetType: "ip",
 * });
 * ```
 *
 * **Example:** Lambda target group
 * ```typescript
 * // No vpc/port/protocol — the target is a Lambda function.
 * const tg = yield* TargetGroup("fn", {
 *   targetType: "lambda",
 * });
 * ```
 *
 * **Example:** gRPC target group
 * ```typescript
 * const tg = yield* TargetGroup("grpc", {
 *   vpcId: vpc.vpcId,
 *   port: 50051,
 *   protocol: "HTTP",
 *   protocolVersion: "GRPC",
 *   matcher: { GrpcCode: "0" },
 * });
 * ```
 *
 * ### Health Checks
 * **Example:** Custom health-check thresholds
 * ```typescript
 * const tg = yield* TargetGroup("api", {
 *   vpcId: vpc.vpcId,
 *   port: 8080,
 *   protocol: "HTTP",
 *   healthCheckPath: "/healthz",
 *   healthCheckInterval: "15 seconds",
 *   healthyThresholdCount: 3,
 *   unhealthyThresholdCount: 3,
 * });
 * ```
 *
 * @resource
 */
export declare const TargetGroup: import("../../Resource.ts").ResourceClass<TargetGroup>;
export declare const TargetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<TargetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TargetGroup.d.ts.map