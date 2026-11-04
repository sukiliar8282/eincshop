import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import { type ListenerAction } from "./common.ts";
import type { LoadBalancer, LoadBalancerArn } from "./LoadBalancer.ts";
import type { TargetGroup, TargetGroupArn } from "./TargetGroup.ts";
export type ListenerArn = `arn:aws:elasticloadbalancing:${RegionID}:${AccountID}:listener/${string}`;
export interface ListenerProps {
    /** The load balancer this listener belongs to. Changing it replaces the listener. */
    loadBalancerArn: Input<LoadBalancerArn> | LoadBalancer;
    /**
     * Single forward target group. Convenience sugar that desugars to a single
     * `{ type: "forward" }` default action. Prefer {@link defaultActions} for the
     * full action surface. Mutually exclusive with `defaultActions`.
     */
    targetGroupArn?: Input<TargetGroupArn> | TargetGroup;
    /**
     * The default actions for the listener (forward / redirect / fixedResponse /
     * authenticateOidc / authenticateCognito). Takes precedence over
     * {@link targetGroupArn}.
     */
    defaultActions?: ListenerAction[];
    /** The port on which the load balancer listens. Updated in place. */
    port: number;
    /**
     * The listener protocol.
     * @default "HTTP"
     */
    protocol?: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP" | "TCP_UDP";
    /**
     * The default (and any additional SNI) certificate ARNs. The first entry is
     * the default certificate; the rest are attached as SNI certificates.
     * Declarative over the full SNI list: certificates attached out of band
     * (including via standalone `ListenerCertificate` resources) are removed on
     * reconcile. Omit this prop and use `certificateArn` +
     * `ListenerCertificate` attachments to manage SNI certificates
     * independently. Prefer this over the legacy single {@link certificateArn}.
     */
    certificates?: string[];
    /**
     * The default certificate ARN (legacy single-cert form). Folded into
     * {@link certificates} as the default certificate.
     */
    certificateArn?: string;
    /** The security policy that defines supported protocols and ciphers (HTTPS/TLS). */
    sslPolicy?: string;
    /** The ALPN policy for TLS listeners (e.g. `HTTP2Optional`). */
    alpnPolicy?: string[];
    /** Mutual TLS (mTLS) configuration for HTTPS listeners. */
    mutualAuthentication?: {
        /** The mTLS mode. */
        mode: "off" | "passthrough" | "verify";
        /** The trust store ARN. Required when `mode` is `verify`. */
        trustStoreArn?: string;
        /** Whether to ignore expired client certificates. */
        ignoreClientCertificateExpiry?: boolean;
        /** Whether to advertise the trust-store CA names in the TLS handshake. */
        advertiseTrustStoreCaNames?: "on" | "off";
    };
    /**
     * Raw listener attributes, synced via `modifyListenerAttributes` — e.g.
     * `tcp.idle_timeout.seconds` (NLB TCP listeners) or
     * `routing.http.response.server.enabled` (ALB HTTP/HTTPS listeners).
     */
    attributes?: Record<string, string>;
}
export interface Listener extends Resource<"AWS.ELBv2.Listener", ListenerProps, {
    /** The ARN of the listener. */
    listenerArn: ListenerArn;
    /** The ARN of the load balancer the listener is attached to. */
    loadBalancerArn: LoadBalancerArn;
    /** The ARN of the target group from the default forward action, if any. */
    targetGroupArn: TargetGroupArn | undefined;
    /** The port the listener accepts connections on. */
    port: number;
    /** The protocol for connections (e.g. `HTTP`, `HTTPS`, `TCP`, `TLS`). */
    protocol: string;
}, never, Providers> {
}
/**
 * An ELBv2 (Application/Network) Load Balancer listener. A listener checks for
 * connection requests using its configured protocol and port, then routes them
 * to target groups via its default actions (and any attached
 * {@link ListenerRule}s).
 * ### Creating a Listener
 * **Example:** Basic HTTP forward listener
 * ```typescript
 * const listener = yield* Listener("http", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   targetGroupArn: tg.targetGroupArn,
 *   port: 80,
 *   protocol: "HTTP",
 * });
 * ```
 *
 * **Example:** HTTPS listener with certificate and SSL policy
 * ```typescript
 * const listener = yield* Listener("https", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   defaultActions: [
 *     { type: "forward", targetGroups: [{ targetGroupArn: tg.targetGroupArn }] },
 *   ],
 *   port: 443,
 *   protocol: "HTTPS",
 *   certificates: [primaryCertArn, sniCertArn],
 *   sslPolicy: "ELBSecurityPolicy-TLS13-1-2-2021-06",
 * });
 * ```
 *
 * ### Default Actions
 * **Example:** Redirect HTTP to HTTPS
 * ```typescript
 * const redirect = yield* Listener("redirect", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   defaultActions: [
 *     { type: "redirect", statusCode: "HTTP_301", protocol: "HTTPS", port: "443" },
 *   ],
 *   port: 80,
 *   protocol: "HTTP",
 * });
 * ```
 *
 * **Example:** Fixed response
 * ```typescript
 * const maintenance = yield* Listener("maintenance", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   defaultActions: [
 *     { type: "fixedResponse", statusCode: "503", contentType: "text/plain", messageBody: "down" },
 *   ],
 *   port: 80,
 * });
 * ```
 *
 * **Example:** Weighted forward with stickiness
 * ```typescript
 * const weighted = yield* Listener("weighted", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   defaultActions: [
 *     {
 *       type: "forward",
 *       targetGroups: [
 *         { targetGroupArn: blue.targetGroupArn, weight: 90 },
 *         { targetGroupArn: green.targetGroupArn, weight: 10 },
 *       ],
 *       stickiness: { enabled: true, duration: "1 hour" },
 *     },
 *   ],
 *   port: 80,
 * });
 * ```
 *
 * ### Mutual TLS
 * **Example:** mTLS verify mode with a trust store
 * ```typescript
 * const mtls = yield* Listener("mtls", {
 *   loadBalancerArn: lb.loadBalancerArn,
 *   defaultActions: [
 *     { type: "forward", targetGroups: [{ targetGroupArn: tg.targetGroupArn }] },
 *   ],
 *   port: 443,
 *   protocol: "HTTPS",
 *   certificates: [certArn],
 *   mutualAuthentication: { mode: "verify", trustStoreArn: trustStore.trustStoreArn },
 * });
 * ```
 *
 * @resource
 */
export declare const Listener: import("../../Resource.ts").ResourceClass<Listener>;
export declare const ListenerProvider: () => import("effect/Layer").Layer<Provider.Provider<Listener>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Listener.d.ts.map