import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LoggingConfigurationProps {
    /**
     * Id of the AMP workspace whose rules/alerting logs are shipped. A
     * workspace has at most one logging configuration. Changing the workspace
     * replaces the configuration.
     */
    workspaceId: string;
    /**
     * ARN of the CloudWatch Logs log group that receives the workspace's rule
     * evaluation and alerting (vended) logs. AMP expects the ARN with a
     * trailing `:*` — one is appended automatically when missing.
     */
    logGroupArn: string;
}
export interface LoggingConfiguration extends Resource<"AWS.AMP.LoggingConfiguration", LoggingConfigurationProps, {
    workspaceId: string;
    logGroupArn: string;
    status: string;
}, never, Providers> {
}
/**
 * The rules/alerting logging configuration of an Amazon Managed Service for
 * Prometheus workspace — ships rule evaluation failures and Alertmanager
 * delivery errors to a CloudWatch Logs log group. A workspace has at most
 * one.
 *
 * ### Creating a Logging Configuration
 * **Example:** Ship Rule and Alerting Logs to CloudWatch Logs
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const logs = yield* Logs.LogGroup("AmpLogs", {
 *   logGroupName: "/aws/vendedlogs/prometheus/metrics",
 * });
 * const logging = yield* AMP.LoggingConfiguration("Logging", {
 *   workspaceId: workspace.workspaceId,
 *   logGroupArn: logs.logGroupArn,
 * });
 * ```
 *
 * @resource
 */
export declare const LoggingConfiguration: import("../../Resource.ts").ResourceClass<LoggingConfiguration>;
export declare const LoggingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<LoggingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LoggingConfiguration.d.ts.map