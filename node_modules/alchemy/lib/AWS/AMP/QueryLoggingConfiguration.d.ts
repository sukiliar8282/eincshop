import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface QueryLoggingDestination {
    /**
     * ARN of the CloudWatch Logs log group that receives query logs. AMP
     * expects the ARN with a trailing `:*` — one is appended automatically
     * when missing.
     */
    logGroupArn: string;
    /**
     * Only queries that spend at least this many Query Samples Processed
     * (QSP) are logged. Use `0` to log every query.
     * @default 0
     */
    qspThreshold?: number;
}
export interface QueryLoggingConfigurationProps {
    /**
     * Id of the AMP workspace whose queries are logged. A workspace has at
     * most one query logging configuration. Changing the workspace replaces
     * the configuration.
     */
    workspaceId: string;
    /**
     * Destinations that receive the query logs (currently CloudWatch Logs
     * log groups, each with a QSP filter threshold). Updated in place.
     */
    destinations: QueryLoggingDestination[];
}
export interface QueryLoggingConfiguration extends Resource<"AWS.AMP.QueryLoggingConfiguration", QueryLoggingConfigurationProps, {
    workspaceId: string;
    destinations: {
        logGroupArn: string;
        qspThreshold: number;
    }[];
    status: string;
}, never, Providers> {
}
/**
 * The query logging configuration of an Amazon Managed Service for
 * Prometheus workspace — ships PromQL query logs (query text, QSP cost,
 * response code) to CloudWatch Logs. A workspace has at most one.
 *
 * ### Creating a Query Logging Configuration
 * **Example:** Log Expensive Queries to CloudWatch Logs
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const logs = yield* Logs.LogGroup("QueryLogs", {
 *   logGroupName: "/aws/vendedlogs/prometheus/metrics-queries",
 * });
 * const queryLogging = yield* AMP.QueryLoggingConfiguration("QueryLogging", {
 *   workspaceId: workspace.workspaceId,
 *   destinations: [{ logGroupArn: logs.logGroupArn, qspThreshold: 1000 }],
 * });
 * ```
 *
 * @resource
 */
export declare const QueryLoggingConfiguration: import("../../Resource.ts").ResourceClass<QueryLoggingConfiguration>;
export declare const QueryLoggingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<QueryLoggingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=QueryLoggingConfiguration.d.ts.map