import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { withWafScope } from "./internal.js";
/**
 * The logging configuration of an AWS WAFv2 {@link WebACL} — streams full
 * web request logs to a Kinesis Data Firehose delivery stream, a CloudWatch
 * Logs log group, or an S3 bucket.
 *
 * The destination must be named with the `aws-waf-logs-` prefix. A web ACL
 * has at most one logging configuration; deleting this resource disables
 * logging.
 *
 * ### Configuring Logging
 * **Example:** Log to CloudWatch Logs
 * ```typescript
 * const logGroup = yield* AWS.Logs.LogGroup("WafLogs", {
 *   logGroupName: "aws-waf-logs-my-firewall",
 * });
 *
 * yield* AWS.WAFv2.LoggingConfiguration("Logging", {
 *   resourceArn: acl.webAclArn,
 *   logDestinationConfigs: [logGroup.logGroupArn],
 * });
 * ```
 *
 * **Example:** Redact Headers and Filter to Blocked Requests
 * ```typescript
 * yield* AWS.WAFv2.LoggingConfiguration("Logging", {
 *   resourceArn: acl.webAclArn,
 *   logDestinationConfigs: [logGroup.logGroupArn],
 *   redactedFields: [{ SingleHeader: { Name: "authorization" } }],
 *   loggingFilter: {
 *     DefaultBehavior: "DROP",
 *     Filters: [
 *       {
 *         Behavior: "KEEP",
 *         Requirement: "MEETS_ANY",
 *         Conditions: [{ ActionCondition: { Action: "BLOCK" } }],
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const LoggingConfiguration = Resource("AWS.WAFv2.LoggingConfiguration");
/**
 * Derive the scope from a WAFv2 entity ARN. CLOUDFRONT-scoped ARNs carry a
 * `global/` resource prefix (`arn:aws:wafv2:us-east-1:acct:global/webacl/…`);
 * REGIONAL ARNs carry `regional/`.
 */
const scopeOfArn = (arn) => arn.split(":")[5]?.startsWith("global/") ? "CLOUDFRONT" : "REGIONAL";
/**
 * WAF rejects CloudWatch Logs log group ARNs with the `:*` suffix that IAM
 * policies (and the Logs API) use — strip it.
 */
const normalizeDestination = (arn) => arn.endsWith(":*") ? arn.slice(0, -2) : arn;
/**
 * The first PutLoggingConfiguration in an account creates the WAF
 * service-linked role; until that completes the API surfaces
 * `WAFServiceLinkedRoleErrorException` ("Retry your request"). Bounded
 * retry (~30s).
 */
const retryServiceLinkedRole = (self) => Effect.retry(self, {
    while: (e) => e._tag === "WAFServiceLinkedRoleErrorException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
export const LoggingConfigurationProvider = () => Provider.effect(LoggingConfiguration, Effect.gen(function* () {
    const readConfig = Effect.fn(function* (resourceArn) {
        const scope = scopeOfArn(resourceArn);
        return yield* withWafScope(scope, wafv2
            .getLoggingConfiguration({ ResourceArn: resourceArn })
            .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
    });
    const toAttrs = (resourceArn, destinations) => ({
        resourceArn,
        scope: scopeOfArn(resourceArn),
        logDestinationConfigs: [...destinations],
    });
    return LoggingConfiguration.Provider.of({
        stables: ["resourceArn", "scope"],
        // A logging configuration is a singleton setting keyed by its web
        // ACL; enumerating them standalone is not useful for orphan scans
        // (the web ACL itself is the discoverable resource).
        list: () => Effect.succeed([]),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.resourceArn !== news.resourceArn) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const resourceArn = output?.resourceArn ?? olds?.resourceArn;
            if (resourceArn === undefined)
                return undefined;
            const found = yield* readConfig(resourceArn);
            const config = found?.LoggingConfiguration;
            if (!config)
                return undefined;
            return toAttrs(resourceArn, config.LogDestinationConfigs ?? []);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const scope = scopeOfArn(news.resourceArn);
            const desired = {
                ResourceArn: news.resourceArn,
                LogDestinationConfigs: news.logDestinationConfigs.map(normalizeDestination),
                RedactedFields: news.redactedFields,
                LoggingFilter: news.loggingFilter,
            };
            // Observe — PutLoggingConfiguration is a true upsert, so only
            // call it when the observed configuration drifts from desired.
            const observed = yield* readConfig(news.resourceArn);
            const current = observed?.LoggingConfiguration;
            const drifted = !deepEqual({
                LogDestinationConfigs: current?.LogDestinationConfigs ?? [],
                RedactedFields: current?.RedactedFields,
                LoggingFilter: current?.LoggingFilter,
            }, {
                LogDestinationConfigs: desired.LogDestinationConfigs,
                RedactedFields: desired.RedactedFields,
                LoggingFilter: desired.LoggingFilter,
            }, { stripNullish: true });
            if (current === undefined || drifted) {
                yield* retryServiceLinkedRole(withWafScope(scope, wafv2.putLoggingConfiguration({
                    LoggingConfiguration: desired,
                })));
            }
            yield* session.note(news.resourceArn);
            return toAttrs(news.resourceArn, desired.LogDestinationConfigs);
        }),
        delete: Effect.fn(function* ({ output }) {
            const scope = scopeOfArn(output.resourceArn);
            // Idempotent — the configuration (or the web ACL itself) may
            // already be gone.
            yield* withWafScope(scope, wafv2
                .deleteLoggingConfiguration({
                ResourceArn: output.resourceArn,
            })
                .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.void)));
        }),
    });
}));
//# sourceMappingURL=LoggingConfiguration.js.map