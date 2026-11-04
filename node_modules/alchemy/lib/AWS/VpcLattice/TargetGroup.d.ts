import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The kind of compute a target group routes to.
 */
export type TargetGroupType = "IP" | "LAMBDA" | "INSTANCE" | "ALB";
/**
 * A target registered with a target group: an IP address, EC2 instance ID,
 * ALB ARN, or Lambda function ARN depending on the group's `type`.
 */
export interface TargetGroupTarget {
    /**
     * The target identifier: IP address (`IP`), instance ID (`INSTANCE`),
     * load balancer ARN (`ALB`), or Lambda function ARN (`LAMBDA`).
     */
    id: string;
    /**
     * Port the target listens on. Not applicable to `LAMBDA` targets.
     */
    port?: number;
}
/**
 * Health check configuration for `IP` and `INSTANCE` target groups.
 */
export interface TargetGroupHealthCheck {
    /**
     * Whether health checking is enabled.
     */
    enabled?: boolean;
    /**
     * Protocol used for health check requests (`HTTP` or `HTTPS`).
     */
    protocol?: string;
    /**
     * Protocol version used for health check requests (`HTTP1` or `HTTP2`).
     */
    protocolVersion?: string;
    /**
     * Port used for health checks. Defaults to the target's port.
     */
    port?: number;
    /**
     * Destination path for health check requests.
     * @default "/"
     */
    path?: string;
    /**
     * Approximate time between health checks of an individual target, e.g.
     * `"30 seconds"` (a bare number is milliseconds). Rounded to whole seconds
     * on the wire.
     */
    healthCheckInterval?: Duration.Input;
    /**
     * Time to wait before a health check request is considered failed, e.g.
     * `"5 seconds"` (a bare number is milliseconds). Rounded to whole seconds
     * on the wire.
     */
    healthCheckTimeout?: Duration.Input;
    /**
     * Consecutive successful checks required before an unhealthy target is
     * considered healthy.
     */
    healthyThresholdCount?: number;
    /**
     * Consecutive failed checks required before a healthy target is considered
     * unhealthy.
     */
    unhealthyThresholdCount?: number;
    /**
     * HTTP status codes counted as a healthy response, e.g. `{ httpCode: "200-299" }`.
     */
    matcher?: {
        httpCode: string;
    };
}
export interface TargetGroupProps {
    /**
     * Name of the target group. If omitted, a unique name is generated.
     * Immutable — changing it replaces the resource.
     */
    name?: string;
    /**
     * The kind of targets the group routes to. Immutable — changing it replaces
     * the resource.
     */
    type: TargetGroupType;
    /**
     * Port the targets listen on. Required for every type except `LAMBDA`.
     * Immutable — changing it replaces the resource.
     */
    port?: number;
    /**
     * Protocol used to route traffic to the targets (`HTTP`, `HTTPS`, or
     * `TCP`). Not applicable to `LAMBDA`. Immutable — changing it replaces the
     * resource.
     */
    protocol?: string;
    /**
     * Protocol version (`HTTP1`, `HTTP2`, or `GRPC`). Not applicable to
     * `LAMBDA`. Immutable — changing it replaces the resource.
     * @default "HTTP1"
     */
    protocolVersion?: string;
    /**
     * IP address type of the targets (`IPV4` or `IPV6`). `IP` type only.
     * Immutable — changing it replaces the resource.
     * @default "IPV4"
     */
    ipAddressType?: string;
    /**
     * ID of the VPC the targets live in. Required for every type except
     * `LAMBDA`. Immutable — changing it replaces the resource.
     */
    vpcIdentifier?: string;
    /**
     * Version of the event structure a `LAMBDA` target receives (`V1` or
     * `V2`). Immutable — changing it replaces the resource.
     * @default "V1"
     */
    lambdaEventStructureVersion?: string;
    /**
     * Health check configuration. Mutable for `IP` and `INSTANCE` groups; not
     * applicable to `LAMBDA` and `ALB`.
     */
    healthCheck?: TargetGroupHealthCheck;
    /**
     * Targets to keep registered with the group. Reconciled against the
     * observed registrations: missing targets are registered and extra ones
     * are deregistered.
     */
    targets?: TargetGroupTarget[];
    /**
     * User-defined tags to apply to the target group.
     */
    tags?: Record<string, string>;
}
export interface TargetGroup extends Resource<"AWS.VpcLattice.TargetGroup", TargetGroupProps, {
    /**
     * Service-assigned unique ID of the target group.
     */
    targetGroupId: string;
    /**
     * ARN of the target group.
     */
    targetGroupArn: string;
    /**
     * Physical name of the target group.
     */
    name: string;
    /**
     * The kind of targets the group routes to.
     */
    type: TargetGroupType;
    /**
     * Current lifecycle status (e.g. `ACTIVE`).
     */
    status: string;
    /**
     * Current tags reported for the target group.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon VPC Lattice target group — the collection of compute targets
 * (IPs, EC2 instances, ALBs, or Lambda functions) that a lattice service's
 * listeners and rules forward traffic to.
 *
 * ### Creating Target Groups
 * **Example:** Lambda Target Group
 * ```typescript
 * const targets = yield* TargetGroup("ApiTargets", {
 *   type: "LAMBDA",
 *   targets: [{ id: fn.functionArn }],
 * });
 * ```
 *
 * **Example:** IP Target Group with Health Check
 * ```typescript
 * const targets = yield* TargetGroup("BackendTargets", {
 *   type: "IP",
 *   port: 80,
 *   protocol: "HTTP",
 *   vpcIdentifier: vpc.vpcId,
 *   healthCheck: {
 *     enabled: true,
 *     path: "/health",
 *     healthCheckInterval: "30 seconds",
 *     healthCheckTimeout: "5 seconds",
 *   },
 *   targets: [{ id: "10.0.1.10", port: 80 }],
 * });
 * ```
 *
 * @resource
 */
export declare const TargetGroup: import("../../Resource.ts").ResourceClass<TargetGroup>;
export declare const TargetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<TargetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TargetGroup.d.ts.map