import * as rds from "@distilled.cloud/aws/rds";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBProxyEndpointProps {
    /**
     * Proxy endpoint name. If omitted, Alchemy generates one.
     */
    dbProxyEndpointName?: string;
    /**
     * Proxy that owns the endpoint.
     */
    dbProxyName: string;
    /**
     * Subnets used by the proxy endpoint.
     */
    vpcSubnetIds: string[];
    /**
     * Security groups attached to the endpoint.
     */
    vpcSecurityGroupIds?: string[];
    /**
     * Target role for the endpoint.
     */
    targetRole?: rds.DBProxyEndpointTargetRole;
    /**
     * Endpoint network type.
     */
    endpointNetworkType?: rds.EndpointNetworkType;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBProxyEndpoint extends Resource<"AWS.RDS.DBProxyEndpoint", DBProxyEndpointProps, {
    /**
     * Name of the proxy endpoint.
     */
    dbProxyEndpointName: string;
    /**
     * ARN of the proxy endpoint.
     */
    dbProxyEndpointArn: string;
    /**
     * Proxy that owns the endpoint.
     */
    dbProxyName: string | undefined;
    /**
     * DNS address applications connect to.
     */
    endpoint: string | undefined;
    /**
     * Status of the endpoint (e.g. `available`).
     */
    status: string | undefined;
    /**
     * VPC the endpoint is placed in.
     */
    vpcId: string | undefined;
    /**
     * Subnets the endpoint is attached to.
     */
    vpcSubnetIds: string[];
    /**
     * Security groups attached to the endpoint.
     */
    vpcSecurityGroupIds: string[];
    /**
     * Role of the endpoint (`READ_WRITE` or `READ_ONLY`).
     */
    targetRole: string | undefined;
    /**
     * Tags on the endpoint.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An additional RDS Proxy endpoint — a second DNS name on an existing
 * `DBProxy`, typically read-only for reader traffic or placed in a
 * different VPC.
 *
 * Changing the name, owning proxy, subnets, or target role replaces the
 * endpoint; security groups and tags update in place.
 * ### Creating Proxy Endpoints
 * **Example:** Read-Only Endpoint
 * ```typescript
 * const readerEndpoint = yield* DBProxyEndpoint("ReaderEndpoint", {
 *   dbProxyName: proxy.dbProxyName,
 *   vpcSubnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 *   vpcSecurityGroupIds: [dbSecurityGroup.groupId],
 *   targetRole: "READ_ONLY",
 * });
 * ```
 *
 * @resource
 */
export declare const DBProxyEndpoint: import("../../Resource.ts").ResourceClass<DBProxyEndpoint>;
export declare const DBProxyEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<DBProxyEndpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBProxyEndpoint.d.ts.map