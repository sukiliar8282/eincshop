import * as rds from "@distilled.cloud/aws/rds";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBProxyTargetGroupProps {
    /**
     * Proxy that owns the target group.
     */
    dbProxyName: string;
    /**
     * Target group name.
     * @default "default"
     */
    targetGroupName?: string;
    /**
     * Cluster targets registered with the proxy.
     */
    dbClusterIdentifiers?: string[];
    /**
     * Instance targets registered with the proxy.
     */
    dbInstanceIdentifiers?: string[];
    /**
     * Connection pool configuration.
     */
    connectionPoolConfig?: rds.ConnectionPoolConfiguration;
}
export interface DBProxyTargetGroup extends Resource<"AWS.RDS.DBProxyTargetGroup", DBProxyTargetGroupProps, {
    /**
     * Proxy that owns the target group.
     */
    dbProxyName: string;
    /**
     * Name of the target group (`default` unless overridden).
     */
    targetGroupName: string;
    /**
     * ARN of the target group.
     */
    targetGroupArn: string | undefined;
    /**
     * Status of the target group (e.g. `available`).
     */
    status: string | undefined;
    /**
     * Whether this is the proxy's default target group.
     */
    isDefault: boolean | undefined;
    /**
     * Observed connection pool configuration.
     */
    connectionPoolConfig: rds.ConnectionPoolConfigurationInfo | undefined;
    /**
     * Cluster targets registered with the proxy.
     */
    dbClusterIdentifiers: string[];
    /**
     * Instance targets registered with the proxy.
     */
    dbInstanceIdentifiers: string[];
}, never, Providers> {
}
/**
 * The proxy target group that registers Aurora clusters or instances behind an
 * RDS Proxy.
 *
 * Every `DBProxy` has exactly one `default` target group; this resource
 * adopts it, tunes its connection pool, and reconciles the registered
 * cluster/instance targets. Deleting it deregisters the targets rather than
 * deleting the group itself.
 * ### Registering Targets
 * **Example:** Register a Cluster Behind a Proxy
 * ```typescript
 * const targets = yield* DBProxyTargetGroup("ProxyTargets", {
 *   dbProxyName: proxy.dbProxyName,
 *   dbClusterIdentifiers: [cluster.dbClusterIdentifier],
 * });
 * ```
 *
 * **Example:** Tune the Connection Pool
 * ```typescript
 * const targets = yield* DBProxyTargetGroup("ProxyTargets", {
 *   dbProxyName: proxy.dbProxyName,
 *   dbClusterIdentifiers: [cluster.dbClusterIdentifier],
 *   connectionPoolConfig: {
 *     MaxConnectionsPercent: 90,
 *     MaxIdleConnectionsPercent: 10,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DBProxyTargetGroup: import("../../Resource.ts").ResourceClass<DBProxyTargetGroup>;
export declare const DBProxyTargetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DBProxyTargetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=DBProxyTargetGroup.d.ts.map