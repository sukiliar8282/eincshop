import * as nfw from "@distilled.cloud/aws/network-firewall";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
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
export const LoggingConfiguration = Resource("AWS.NetworkFirewall.LoggingConfiguration");
export const LoggingConfigurationProvider = () => Provider.effect(LoggingConfiguration, Effect.gen(function* () {
    const readConfigs = Effect.fn(function* (firewallArn) {
        const response = yield* nfw.describeLoggingConfiguration({
            FirewallArn: firewallArn,
        });
        return [
            ...(response.LoggingConfiguration?.LogDestinationConfigs ?? []),
        ];
    });
    const applyConfigs = Effect.fn(function* (firewallArn, configs) {
        yield* nfw.updateLoggingConfiguration({
            FirewallArn: firewallArn,
            LoggingConfiguration: { LogDestinationConfigs: configs },
        });
    });
    // Converge the live logging configuration to `desired`, one change per
    // UpdateLoggingConfiguration call as the API requires (a single call
    // may only add one config, remove one config, or change one existing
    // destination).
    const converge = Effect.fn(function* (firewallArn, desired) {
        let current = yield* readConfigs(firewallArn);
        const desiredByType = new Map(desired.map((d) => [d.LogType, d]));
        // Remove log types no longer desired.
        for (const config of [...current]) {
            if (!desiredByType.has(config.LogType)) {
                current = current.filter((c) => c.LogType !== config.LogType);
                yield* applyConfigs(firewallArn, current);
            }
        }
        // Change destinations of existing log types.
        for (const config of desired) {
            const existing = current.find((c) => c.LogType === config.LogType);
            if (existing !== undefined && !deepEqual(existing, config)) {
                current = current.map((c) => c.LogType === config.LogType ? config : c);
                yield* applyConfigs(firewallArn, current);
            }
        }
        // Add missing log types.
        for (const config of desired) {
            if (!current.some((c) => c.LogType === config.LogType)) {
                current = [...current, config];
                yield* applyConfigs(firewallArn, current);
            }
        }
    });
    return LoggingConfiguration.Provider.of({
        stables: ["firewallArn"],
        // Keyed by its parent firewall — not independently enumerable in a
        // useful way (it is a singleton setting, not a discrete resource).
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const firewallArn = output?.firewallArn ?? olds?.firewallArn;
            if (firewallArn === undefined)
                return undefined;
            const response = yield* nfw
                .describeLoggingConfiguration({ FirewallArn: firewallArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            const configs = response?.LoggingConfiguration?.LogDestinationConfigs ?? [];
            if (configs.length === 0)
                return undefined;
            return { firewallArn };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.firewallArn !== news.firewallArn) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            yield* converge(news.firewallArn, news.logDestinationConfigs);
            yield* session.note(news.firewallArn);
            return { firewallArn: news.firewallArn };
        }),
        delete: Effect.fn(function* ({ output }) {
            // Reset to no logging, removing one destination per call. The
            // firewall itself may already be gone — that is success.
            yield* converge(output.firewallArn, []).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=LoggingConfiguration.js.map