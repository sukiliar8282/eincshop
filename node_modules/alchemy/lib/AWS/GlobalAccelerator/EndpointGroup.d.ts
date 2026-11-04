import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EndpointConfiguration {
    /**
     * ID of the endpoint: an ALB or NLB ARN, an Elastic IP allocation ID, or
     * an EC2 instance ID.
     */
    endpointId: string;
    /**
     * Relative traffic weight for this endpoint versus the other endpoints in
     * the group (`0` - `255`).
     * @default 128
     */
    weight?: number;
    /**
     * Preserve the client IP address through to the endpoint. Supported for
     * ALB and EC2 instance endpoints.
     * @default true for supported endpoint types
     */
    clientIPPreservationEnabled?: boolean;
    /**
     * ARN of the cross-account attachment authorizing this endpoint when it
     * lives in another AWS account.
     */
    attachmentArn?: string;
}
export interface PortOverride {
    /**
     * The listener port to override.
     */
    listenerPort: number;
    /**
     * The endpoint port that traffic on the overridden listener port is
     * routed to.
     */
    endpointPort: number;
}
export interface EndpointGroupProps {
    /**
     * ARN of the listener the endpoint group attaches to. Changing it
     * replaces the endpoint group.
     */
    listenerArn: string;
    /**
     * The AWS Region where the endpoint group's endpoints live. One endpoint
     * group per region per listener; changing it replaces the group.
     */
    endpointGroupRegion: string;
    /**
     * The endpoints (ALBs, NLBs, EC2 instances, Elastic IPs) traffic is
     * routed to. Omitting it (or `[]`) keeps the group empty.
     */
    endpoints?: EndpointConfiguration[];
    /**
     * The percentage of the listener's traffic to send to this endpoint
     * group (`0` - `100`), applied after location-based routing.
     * @default 100
     */
    trafficDialPercentage?: number;
    /**
     * The port used for health checks.
     * @default the first port of the listener's port ranges
     */
    healthCheckPort?: number;
    /**
     * The protocol used for health checks.
     * @default "TCP"
     */
    healthCheckProtocol?: "TCP" | "HTTP" | "HTTPS";
    /**
     * The path for HTTP/HTTPS health checks.
     * @default "/"
     */
    healthCheckPath?: string;
    /**
     * Time between health checks, e.g. `"10 seconds"` or
     * `Duration.seconds(30)`. Rounded to whole seconds on the wire; the API
     * accepts `10` or `30` seconds.
     * @default "30 seconds"
     */
    healthCheckInterval?: Duration.Input;
    /**
     * Consecutive health-check successes/failures required to flip an
     * endpoint healthy/unhealthy.
     * @default 3
     */
    thresholdCount?: number;
    /**
     * Overrides routing specific listener ports to different endpoint ports.
     */
    portOverrides?: PortOverride[];
}
export interface EndpointGroup extends Resource<"AWS.GlobalAccelerator.EndpointGroup", EndpointGroupProps, {
    /** The ARN of the endpoint group. */
    endpointGroupArn: string;
    /** The ARN of the listener the endpoint group is attached to. */
    listenerArn: string;
    /** The AWS Region the group's endpoints live in. */
    endpointGroupRegion: string;
    /** The percentage of listener traffic dialed to this group. */
    trafficDialPercentage: number;
    /** The health-check protocol: `TCP`, `HTTP`, or `HTTPS`. */
    healthCheckProtocol: string;
    /** The port used for health checks. */
    healthCheckPort: number | undefined;
    /** The path used for HTTP/HTTPS health checks. */
    healthCheckPath: string | undefined;
    /** Seconds between health checks. */
    healthCheckInterval: number;
    /** Consecutive checks required to flip an endpoint's health state. */
    thresholdCount: number;
    /** The endpoints in the group with their observed health. */
    endpoints: {
        /** The endpoint's ID (ALB/NLB ARN, EIP allocation ID, or instance ID). */
        endpointId: string | undefined;
        /** Relative traffic weight of the endpoint. */
        weight: number | undefined;
        /** Observed health: `HEALTHY`, `UNHEALTHY`, or `INITIAL`. */
        healthState: string | undefined;
        /** Whether the client IP is preserved through to the endpoint. */
        clientIPPreservationEnabled: boolean | undefined;
    }[];
}, never, Providers> {
}
/**
 * A Global Accelerator endpoint group — the set of regional endpoints
 * (ALBs, NLBs, EC2 instances, or Elastic IPs) that a listener routes
 * traffic to in one AWS Region, with traffic-dial and health-check
 * configuration.
 *
 * One endpoint group per region per listener. Everything except the
 * listener and region is updatable in place.
 * ### Creating Endpoint Groups
 * **Example:** Route to an Application Load Balancer
 * ```typescript
 * const group = yield* GlobalAccelerator.EndpointGroup("UsWest2", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "us-west-2",
 *   endpoints: [{ endpointId: alb.loadBalancerArn }],
 * });
 * ```
 *
 * **Example:** Weighted Endpoints with HTTP Health Checks
 * ```typescript
 * const group = yield* GlobalAccelerator.EndpointGroup("UsEast1", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "us-east-1",
 *   endpoints: [
 *     { endpointId: blueAlb.loadBalancerArn, weight: 200 },
 *     { endpointId: greenAlb.loadBalancerArn, weight: 55 },
 *   ],
 *   healthCheckProtocol: "HTTP",
 *   healthCheckPath: "/health",
 *   healthCheckInterval: "10 seconds",
 * });
 * ```
 *
 * ### Traffic Management
 * **Example:** Canary a Region with the Traffic Dial
 * ```typescript
 * const group = yield* GlobalAccelerator.EndpointGroup("Canary", {
 *   listenerArn: listener.listenerArn,
 *   endpointGroupRegion: "eu-west-1",
 *   trafficDialPercentage: 10,
 * });
 * ```
 *
 * @resource
 */
export declare const EndpointGroup: import("../../Resource.ts").ResourceClass<EndpointGroup>;
export declare const EndpointGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<EndpointGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=EndpointGroup.d.ts.map