import * as rds from "@distilled.cloud/aws/rds";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBProxyProps {
    /**
     * Proxy name. If omitted, Alchemy generates one.
     */
    dbProxyName?: string;
    /**
     * Engine family such as `POSTGRESQL`.
     */
    engineFamily: rds.EngineFamily;
    /**
     * Authentication config for the proxy.
     */
    auth: rds.UserAuthConfig[];
    /**
     * IAM role ARN used by the proxy to read secrets.
     */
    roleArn: string;
    /**
     * Subnets used by the proxy.
     */
    vpcSubnetIds: string[];
    /**
     * Security groups attached to the proxy.
     */
    vpcSecurityGroupIds?: string[];
    /**
     * Require TLS from clients.
     */
    requireTLS?: boolean;
    /**
     * Idle client timeout (e.g. `"30 minutes"` or `Duration.minutes(30)`).
     * Sent to the API in whole seconds.
     */
    idleClientTimeout?: Duration.Input;
    /**
     * Enable debug logging.
     */
    debugLogging?: boolean;
    /**
     * Endpoint network type.
     */
    endpointNetworkType?: rds.EndpointNetworkType;
    /**
     * Target connection network type.
     */
    targetConnectionNetworkType?: rds.TargetConnectionNetworkType;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBProxy extends Resource<"AWS.RDS.DBProxy", DBProxyProps, {
    /**
     * Name of the proxy.
     */
    dbProxyName: string;
    /**
     * ARN of the proxy.
     */
    dbProxyArn: string;
    /**
     * DNS endpoint applications connect to.
     */
    endpoint: string | undefined;
    /**
     * Status of the proxy (e.g. `available`).
     */
    status: string | undefined;
    /**
     * Engine family the proxy fronts (`POSTGRESQL`, `MYSQL`).
     */
    engineFamily: string | undefined;
    /**
     * IAM role the proxy uses to read credentials secrets.
     */
    roleArn: string | undefined;
    /**
     * VPC the proxy runs in.
     */
    vpcId: string | undefined;
    /**
     * Subnets the proxy is attached to.
     */
    vpcSubnetIds: string[];
    /**
     * Security groups attached to the proxy.
     */
    vpcSecurityGroupIds: string[];
    /**
     * Whether clients must use TLS.
     */
    requireTLS: boolean | undefined;
    /**
     * Idle client timeout in seconds.
     */
    idleClientTimeout: number | undefined;
    /**
     * Whether debug logging is enabled.
     */
    debugLogging: boolean | undefined;
    /**
     * Tags on the proxy.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An RDS Proxy for pooled Lambda-to-Aurora connectivity.
 *
 * The proxy multiplexes many short-lived function connections over a small
 * pool of database connections, absorbing connection storms from Lambda
 * scale-out. It authenticates against the database with credentials read
 * from Secrets Manager via the provided IAM role, then registers targets
 * through a `DBProxyTargetGroup`. Changing the name, engine family, or
 * subnets replaces the proxy; auth, TLS, timeout, and security groups
 * update in place.
 *
 * For the common case, `Aurora("Db", { proxy: true })` wires the role,
 * proxy, target group, and secret automatically.
 * ### Creating a Proxy
 * **Example:** Proxy in Front of an Aurora Cluster
 * ```typescript
 * const proxy = yield* DBProxy("Proxy", {
 *   engineFamily: "POSTGRESQL",
 *   auth: [
 *     {
 *       AuthScheme: "SECRETS",
 *       SecretArn: secret.secretArn,
 *       IAMAuth: "DISABLED",
 *     },
 *   ],
 *   roleArn: proxyRole.roleArn,
 *   vpcSubnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 *   vpcSecurityGroupIds: [dbSecurityGroup.groupId],
 *   requireTLS: true,
 * });
 *
 * // register the cluster behind the proxy
 * const targets = yield* DBProxyTargetGroup("ProxyTargets", {
 *   dbProxyName: proxy.dbProxyName,
 *   dbClusterIdentifiers: [cluster.dbClusterIdentifier],
 * });
 * ```
 *
 * @resource
 */
export declare const DBProxy: import("../../Resource.ts").ResourceClass<DBProxy>;
export declare const DBProxyProvider: () => import("effect/Layer").Layer<Provider.Provider<DBProxy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBProxy.d.ts.map