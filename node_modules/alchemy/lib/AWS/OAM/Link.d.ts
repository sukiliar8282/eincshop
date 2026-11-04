import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The telemetry resource types that can be shared over a link.
 */
export type LinkResourceType = "AWS::CloudWatch::Metric" | "AWS::Logs::LogGroup" | "AWS::XRay::Trace" | "AWS::ApplicationInsights::Application" | "AWS::InternetMonitor::Monitor" | "AWS::ApplicationSignals::Service" | "AWS::ApplicationSignals::ServiceLevelObjective" | (string & {});
export interface LinkProps {
    /**
     * How the link's label appears in the monitoring account. Variables:
     * `$AccountName`, `$AccountEmail`, `$AccountEmailNoDomain`.
     * Changing the label template replaces the link.
     */
    labelTemplate: string;
    /**
     * The telemetry resource types shared from this source account to the
     * monitoring account, e.g. `AWS::CloudWatch::Metric`,
     * `AWS::Logs::LogGroup`, `AWS::XRay::Trace`.
     */
    resourceTypes: LinkResourceType[];
    /**
     * The ARN of the monitoring-account sink to attach to. The sink's policy
     * must permit this account to link. Changing the sink replaces the link.
     * Must be in a **different** account — OAM rejects a link to a sink in
     * the same account.
     */
    sinkIdentifier: string;
    /**
     * Optional filters restricting which log groups and metric namespaces
     * are shared to the monitoring account.
     */
    linkConfiguration?: {
        /**
         * Filter (OAM filter syntax) selecting which log groups are shared,
         * e.g. `LogGroupName LIKE 'aws/lambda/%'`.
         */
        logGroupConfiguration?: {
            filter: string;
        };
        /**
         * Filter selecting which metric namespaces are shared, e.g.
         * `Namespace NOT LIKE 'AWS/%'`.
         */
        metricConfiguration?: {
            filter: string;
        };
    };
    /**
     * User tags to attach to the link. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Link extends Resource<"AWS.OAM.Link", LinkProps, {
    /** The ARN of the link. */
    linkArn: string;
    /** The random ID string that AWS generated as part of the link ARN. */
    linkId: string;
    /** The label that this link displays in the monitoring account. */
    label: string;
    /** The ARN of the sink this link is attached to. */
    sinkArn: string;
}, never, Providers> {
}
/**
 * A CloudWatch cross-account observability **link** — created in a source
 * account, it attaches to a monitoring-account {@link Sink} and shares the
 * selected telemetry types (metrics, log groups, traces, Application
 * Signals) with that account.
 *
 * The sink must live in a **different** account and its sink policy must
 * authorize this account to link.
 *
 * ### Creating a Link
 * **Example:** Share metrics and logs with a monitoring account
 * ```typescript
 * import * as OAM from "alchemy/AWS/OAM";
 *
 * const link = yield* OAM.Link("ToMonitoring", {
 *   labelTemplate: "$AccountName",
 *   resourceTypes: ["AWS::CloudWatch::Metric", "AWS::Logs::LogGroup"],
 *   sinkIdentifier:
 *     "arn:aws:oam:us-west-2:111122223333:sink/1c72e9ec-4d4a-4e...",
 * });
 * ```
 *
 * **Example:** Filter what is shared
 * ```typescript
 * const link = yield* OAM.Link("FilteredLink", {
 *   labelTemplate: "$AccountName",
 *   resourceTypes: ["AWS::CloudWatch::Metric", "AWS::Logs::LogGroup"],
 *   sinkIdentifier: sinkArn,
 *   linkConfiguration: {
 *     logGroupConfiguration: { filter: "LogGroupName LIKE 'aws/lambda/%'" },
 *     metricConfiguration: { filter: "Namespace NOT LIKE 'AWS/%'" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Link: import("../../Resource.ts").ResourceClass<Link>;
export declare const LinkProvider: () => import("effect/Layer").Layer<Provider.Provider<Link>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Link.d.ts.map