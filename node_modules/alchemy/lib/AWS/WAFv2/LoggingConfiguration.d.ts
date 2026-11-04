import type * as WAFV2 from "@distilled.cloud/aws/wafv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type WafScope } from "./internal.ts";
export interface LoggingConfigurationProps {
    /**
     * ARN of the {@link WebACL} to enable logging for. Changing the web ACL
     * replaces the logging configuration.
     */
    resourceArn: string;
    /**
     * ARNs of the log destinations — an Amazon Kinesis Data Firehose delivery
     * stream, a CloudWatch Logs log group, or an S3 bucket. The destination
     * name must begin with `aws-waf-logs-`. A trailing `:*` on a CloudWatch
     * Logs log group ARN is stripped automatically (WAF rejects it).
     */
    logDestinationConfigs: string[];
    /**
     * Parts of each logged request to redact (e.g. a specific header or the
     * query string). Only `SingleHeader`, `UriPath`, `QueryString`, and
     * `Method` are supported by WAF. Raw WAFv2 API shapes.
     */
    redactedFields?: WAFV2.FieldToMatch[];
    /**
     * Filter which requests are logged based on rule action and labels.
     */
    loggingFilter?: WAFV2.LoggingFilter;
}
export interface LoggingConfiguration extends Resource<"AWS.WAFv2.LoggingConfiguration", LoggingConfigurationProps, {
    /**
     * ARN of the web ACL the logging configuration applies to.
     */
    resourceArn: string;
    /**
     * Scope of the web ACL (derived from its ARN).
     */
    scope: WafScope;
    /**
     * ARNs of the configured log destinations.
     */
    logDestinationConfigs: string[];
}, never, Providers> {
}
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
export declare const LoggingConfiguration: import("../../Resource.ts").ResourceClass<LoggingConfiguration>;
export declare const LoggingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<LoggingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LoggingConfiguration.d.ts.map