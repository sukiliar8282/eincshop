import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface QueryLoggingConfigProps {
    /**
     * ID of the public hosted zone to log DNS queries for. Changing this forces
     * replacement.
     */
    hostedZoneId: string;
    /**
     * ARN of the CloudWatch Logs log group Route 53 publishes query logs to.
     * The log group **must live in `us-east-1`** (Route 53 is a global service
     * and only delivers query logs to that region), and a CloudWatch Logs
     * resource policy in `us-east-1` must grant `route53.amazonaws.com`
     * permission to `logs:CreateLogStream` and `logs:PutLogEvents` on it (see
     * `AWS.Logs.ResourcePolicy`). Changing this forces replacement.
     */
    cloudWatchLogsLogGroupArn: string;
}
export interface QueryLoggingConfig extends Resource<"AWS.Route53.QueryLoggingConfig", QueryLoggingConfigProps, {
    /**
     * ID of the query logging configuration.
     */
    id: string;
    /**
     * Hosted zone the configuration logs queries for.
     */
    hostedZoneId: string;
    /**
     * ARN of the destination CloudWatch Logs log group.
     */
    cloudWatchLogsLogGroupArn: string;
}, never, Providers> {
}
/**
 * DNS query logging for a Route 53 public hosted zone.
 *
 * Route 53 publishes query logs to a CloudWatch Logs log group in
 * `us-east-1`. The log group needs a CloudWatch Logs resource policy (also in
 * `us-east-1`) that allows the `route53.amazonaws.com` service principal to
 * create log streams and put log events — model it with
 * `AWS.Logs.ResourcePolicy`.
 *
 * A hosted zone can have at most one query logging configuration, and the
 * configuration is immutable — changing either property replaces it.
 * ### Enabling Query Logging
 * **Example:** Log Queries for a Hosted Zone
 * ```typescript
 * // Both the log group and the resource policy must live in us-east-1.
 * const policy = yield* Logs.ResourcePolicy("Route53QueryLogging", {
 *   policyName: "route53-query-logging",
 *   policyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "route53.amazonaws.com" },
 *         Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
 *         Resource: `arn:aws:logs:us-east-1:${accountId}:log-group:/aws/route53/*`,
 *       },
 *     ],
 *   },
 * });
 *
 * const logging = yield* QueryLoggingConfig("ZoneQueryLogging", {
 *   hostedZoneId: zone.id,
 *   cloudWatchLogsLogGroupArn: logGroup.logGroupArn,
 * });
 * ```
 *
 * @resource
 */
export declare const QueryLoggingConfig: import("../../Resource.ts").ResourceClass<QueryLoggingConfig>;
export declare const QueryLoggingConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<QueryLoggingConfig>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=QueryLoggingConfig.d.ts.map