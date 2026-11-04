import * as obs from "@distilled.cloud/aws/observabilityadmin";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Where a telemetry rule delivers the telemetry it enables. Mirrors the wire
 * `TelemetryDestinationConfiguration`, with the retention period expressed as
 * a `Duration.Input` instead of the wire's `RetentionInDays`.
 */
export interface TelemetryRuleDestination extends Omit<obs.TelemetryDestinationConfiguration, "RetentionInDays"> {
    /**
     * How long CloudWatch Logs retains the telemetry delivered by this rule.
     * Accepts any `Duration.Input` (e.g. `"30 days"`, `Duration.days(90)`);
     * converted to whole days on the wire (`RetentionInDays`).
     */
    Retention?: Duration.Input;
}
export interface TelemetryRuleProps {
    /**
     * Name of the telemetry rule. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the rule.
     */
    ruleName?: string;
    /**
     * The type of telemetry the rule enables — `"Logs"`, `"Metrics"`, or
     * `"Traces"`.
     */
    telemetryType: obs.TelemetryType;
    /**
     * The AWS resource type the rule applies to, e.g. `"AWS::EC2::VPC"`.
     */
    resourceType?: obs.ResourceType;
    /**
     * The telemetry sources the rule enables, e.g. `["VPC_FLOW_LOGS"]`.
     */
    telemetrySourceTypes?: obs.TelemetrySourceType[];
    /**
     * Where the enabled telemetry is delivered (destination type, pattern,
     * retention, and per-source parameters such as VPC flow-log format).
     */
    destinationConfiguration?: TelemetryRuleDestination;
    /**
     * Organization-level scope selector (organization rules only).
     */
    scope?: string;
    /**
     * Criteria selecting which resources the rule configures (such as
     * resource tags). The expression format is service-defined (the console's
     * tag filter builder produces it); an invalid expression is rejected with
     * `ValidationException: Invalid resource selection criteria`. Without
     * selection criteria the rule applies to every resource of `resourceType`
     * in the account.
     */
    selectionCriteria?: string;
    /**
     * Whether the rule's telemetry parameters may be updated after creation.
     */
    allowFieldUpdates?: boolean;
    /**
     * Regions the rule applies to. Mutually exclusive with `allRegions`.
     */
    regions?: string[];
    /**
     * Apply the rule in all regions. Mutually exclusive with `regions`.
     */
    allRegions?: boolean;
    /**
     * User-defined tags for the rule.
     */
    tags?: Record<string, string>;
}
export interface TelemetryRule extends Resource<"AWS.ObservabilityAdmin.TelemetryRule", TelemetryRuleProps, {
    /** The name of the telemetry rule. */
    ruleName: string;
    /** The ARN of the telemetry rule. */
    ruleArn: string;
    /** The telemetry type the rule enables. */
    telemetryType: string | undefined;
    /** The resource type the rule applies to. */
    resourceType: string | undefined;
    /** The tags applied to the rule. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudWatch **telemetry rule** (Observability Admin) — automatically
 * enables telemetry (such as VPC flow logs) for AWS resources in your
 * account that match the rule's criteria.
 *
 * The account must be onboarded to CloudWatch telemetry config (see
 * `ObservabilityAdmin.TelemetryConfig`) before rules can be created.
 *
 * ### Creating a Telemetry Rule
 * **Example:** Enable VPC flow logs for the account's VPCs
 * ```typescript
 * import * as ObservabilityAdmin from "alchemy/AWS/ObservabilityAdmin";
 *
 * // Onboard the account to telemetry config first.
 * const telemetry = yield* ObservabilityAdmin.TelemetryConfig("Telemetry");
 *
 * const rule = yield* ObservabilityAdmin.TelemetryRule("FlowLogs", {
 *   resourceType: "AWS::EC2::VPC",
 *   telemetryType: "Logs",
 *   telemetrySourceTypes: ["VPC_FLOW_LOGS"],
 *   destinationConfiguration: {
 *     DestinationType: "cloud-watch-logs",
 *     Retention: "30 days",
 *   },
 * });
 * ```
 *
 * **Example:** Custom flow-log parameters
 * ```typescript
 * const rule = yield* ObservabilityAdmin.TelemetryRule("FlowLogs", {
 *   resourceType: "AWS::EC2::VPC",
 *   telemetryType: "Logs",
 *   telemetrySourceTypes: ["VPC_FLOW_LOGS"],
 *   destinationConfiguration: {
 *     DestinationType: "cloud-watch-logs",
 *     Retention: "90 days",
 *     VPCFlowLogParameters: {
 *       TrafficType: "REJECT",
 *       MaxAggregationInterval: 600,
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const TelemetryRule: import("../../Resource.ts").ResourceClass<TelemetryRule>;
export declare const TelemetryRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<TelemetryRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TelemetryRule.d.ts.map