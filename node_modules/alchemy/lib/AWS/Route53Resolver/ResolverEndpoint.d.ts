import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResolverEndpointIpAddress {
    /**
     * ID of the subnet to place a resolver network interface in. Changing the
     * set of subnets forces replacement.
     */
    subnetId: string;
    /**
     * Optional fixed IPv4 address within the subnet. If omitted, Resolver
     * picks an available address.
     */
    ip?: string;
    /**
     * Optional fixed IPv6 address within the subnet (dual-stack/IPv6
     * endpoints only).
     */
    ipv6?: string;
}
export interface ResolverEndpointProps {
    /**
     * Friendly name of the endpoint. Also used as the `CreatorRequestId`.
     * Changing it forces replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Whether the endpoint accepts DNS queries from your network (`INBOUND`)
     * or forwards queries from your VPC to your network (`OUTBOUND`).
     * Changing it forces replacement.
     */
    direction: "INBOUND" | "OUTBOUND";
    /**
     * IP addresses (one per subnet, minimum 2 subnets in different AZs) that
     * the resolver endpoint's network interfaces are created in. Changing the
     * subnet set forces replacement.
     */
    ipAddresses: ResolverEndpointIpAddress[];
    /**
     * IDs of the security groups controlling access to the endpoint's
     * network interfaces. Changing them forces replacement.
     */
    securityGroupIds: string[];
    /**
     * The IP family of the endpoint.
     * @default "IPV4"
     */
    resolverEndpointType?: "IPV4" | "IPV6" | "DUALSTACK";
    /**
     * DNS protocols the endpoint answers/forwards with.
     * @default ["Do53"]
     */
    protocols?: ("Do53" | "DoH" | "DoH-FIPS")[];
    /**
     * Tags to apply to the endpoint. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ResolverEndpoint extends Resource<"AWS.Route53Resolver.ResolverEndpoint", ResolverEndpointProps, {
    /**
     * ID of the resolver endpoint (e.g. `rslvr-in-...` / `rslvr-out-...`).
     */
    resolverEndpointId: string;
    /**
     * ARN of the resolver endpoint.
     */
    resolverEndpointArn: string;
    /**
     * Name of the endpoint.
     */
    name: string;
    /**
     * `INBOUND` or `OUTBOUND`.
     */
    direction: string;
    /**
     * ID of the VPC the endpoint's network interfaces live in.
     */
    hostVpcId: string;
}, never, Providers> {
}
/**
 * A Route 53 Resolver endpoint — the set of elastic network interfaces that
 * connect your VPC's `.2` resolver to DNS resolvers on your own network.
 *
 * An `INBOUND` endpoint lets DNS resolvers on your network forward queries
 * to Route 53 Resolver; an `OUTBOUND` endpoint lets Resolver forward queries
 * from your VPCs to your network (paired with FORWARD `ResolverRule`s).
 *
 * Endpoint provisioning is asynchronous (typically 1-2 minutes); the
 * provider waits (bounded) for the endpoint to become `OPERATIONAL` so
 * dependent resolver rules can use it immediately.
 * ### Creating Endpoints
 * **Example:** Inbound Endpoint
 * ```typescript
 * import * as Route53Resolver from "alchemy/AWS/Route53Resolver";
 *
 * const inbound = yield* Route53Resolver.ResolverEndpoint("Inbound", {
 *   direction: "INBOUND",
 *   securityGroupIds: [sg.securityGroupId],
 *   ipAddresses: [
 *     { subnetId: subnetA.subnetId },
 *     { subnetId: subnetB.subnetId },
 *   ],
 * });
 * ```
 *
 * **Example:** Outbound Endpoint with Fixed IPs
 * ```typescript
 * const outbound = yield* Route53Resolver.ResolverEndpoint("Outbound", {
 *   direction: "OUTBOUND",
 *   securityGroupIds: [sg.securityGroupId],
 *   ipAddresses: [
 *     { subnetId: subnetA.subnetId, ip: "10.0.0.10" },
 *     { subnetId: subnetB.subnetId, ip: "10.0.1.10" },
 *   ],
 * });
 * ```
 *
 * ### Forwarding Queries
 * **Example:** Forward a Domain through an Outbound Endpoint
 * ```typescript
 * const rule = yield* Route53Resolver.ResolverRule("CorpForward", {
 *   domainName: "corp.example.com",
 *   resolverEndpointId: outbound.resolverEndpointId,
 *   targetIps: [{ ip: "192.168.1.10" }],
 * });
 * ```
 *
 * @resource
 */
export declare const ResolverEndpoint: import("../../Resource.ts").ResourceClass<ResolverEndpoint>;
export declare const ResolverEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<ResolverEndpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResolverEndpoint.d.ts.map