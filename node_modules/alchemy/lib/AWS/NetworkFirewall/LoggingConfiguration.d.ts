import type * as NFW from "@distilled.cloud/aws/network-firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LoggingConfigurationProps {
    /**
     * ARN of the {@link Firewall} to attach the logging configuration to.
     * Changing the firewall replaces the configuration.
     */
    firewallArn: string;
    /**
     * The log destinations, one per log type (`ALERT`, `FLOW`, `TLS`). Uses
     * raw Network Firewall API structures. The provider converges the live
     * configuration one change at a time, as the API requires.
     */
    logDestinationConfigs: NFW.LogDestinationConfig[];
}
export interface LoggingConfiguration extends Resource<"AWS.NetworkFirewall.LoggingConfiguration", LoggingConfigurationProps, {
    /** ARN of the firewall the logging configuration applies to. */
    firewallArn: string;
}, never, Providers> {
}
/**
 * The logging configuration of an AWS Network Firewall {@link Firewall} —
 * routes the firewall's `ALERT`, `FLOW`, and `TLS` logs to S3, CloudWatch
 * Logs, or Kinesis Data Firehose destinations.
 *
 * A firewall has exactly one logging configuration; deleting this resource
 * resets it to no logging.
 * ### Configuring Logging
 * **Example:** Flow logs to CloudWatch Logs
 * ```typescript
 * import * as Logs from "alchemy/AWS/Logs";
 * import * as NetworkFirewall from "alchemy/AWS/NetworkFirewall";
 *
 * const logGroup = yield* Logs.LogGroup("FirewallLogs");
 *
 * yield* NetworkFirewall.LoggingConfiguration("Logging", {
 *   firewallArn: firewall.firewallArn,
 *   logDestinationConfigs: [
 *     {
 *       LogType: "FLOW",
 *       LogDestinationType: "CloudWatchLogs",
 *       LogDestination: { logGroup: logGroup.logGroupName },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Alert logs to S3
 * ```typescript
 * yield* NetworkFirewall.LoggingConfiguration("Logging", {
 *   firewallArn: firewall.firewallArn,
 *   logDestinationConfigs: [
 *     {
 *       LogType: "ALERT",
 *       LogDestinationType: "S3",
 *       LogDestination: { bucketName: bucket.bucketName, prefix: "alerts" },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const LoggingConfiguration: import("../../Resource.ts").ResourceClass<LoggingConfiguration>;
export declare const LoggingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<LoggingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LoggingConfiguration.d.ts.map