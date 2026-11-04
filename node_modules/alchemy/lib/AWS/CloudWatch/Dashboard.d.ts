import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export type DashboardName = string;
export type DashboardArn = `arn:aws:cloudwatch::${AccountID}:dashboard/${string}`;
export type DashboardPeriodOverride = "inherit" | "auto";
export type DashboardMetricRow = (string | number | boolean | null)[];
export interface DashboardMetricWidgetProperties {
    title?: string;
    region?: string;
    stat?: string;
    period?: number;
    view?: "timeSeries" | "singleValue" | "gauge" | "bar" | "pie";
    stacked?: boolean;
    metrics: DashboardMetricRow[];
    annotations?: Record<string, unknown>;
    yAxis?: Record<string, unknown>;
    legend?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface DashboardTextWidgetProperties {
    markdown: string;
    [key: string]: unknown;
}
export interface DashboardAlarmStatusWidgetProperties {
    alarms: string[];
    title?: string;
    sortBy?: string;
    states?: string[];
    [key: string]: unknown;
}
export interface DashboardLogWidgetProperties {
    query: string;
    region?: string;
    title?: string;
    view?: "table" | "timeSeries" | "bar" | "pie";
    [key: string]: unknown;
}
export interface DashboardMetricWidget {
    type: "metric";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    properties: DashboardMetricWidgetProperties;
}
export interface DashboardTextWidget {
    type: "text";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    properties: DashboardTextWidgetProperties;
}
export interface DashboardAlarmStatusWidget {
    type: "alarm";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    properties: DashboardAlarmStatusWidgetProperties;
}
export interface DashboardLogWidget {
    type: "log";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    properties: DashboardLogWidgetProperties;
}
export type DashboardWidget = DashboardMetricWidget | DashboardTextWidget | DashboardAlarmStatusWidget | DashboardLogWidget;
export interface DashboardBody {
    start?: string;
    end?: string;
    periodOverride?: DashboardPeriodOverride;
    widgets: DashboardWidget[];
    variables?: Record<string, unknown>[];
}
export interface DashboardProps extends Omit<cloudwatch.PutDashboardInput, "DashboardName" | "DashboardBody"> {
    /**
     * Name of the dashboard. If omitted, a unique name is generated.
     */
    name?: DashboardName;
    /**
     * Structured dashboard document. The provider serializes it to the JSON
     * string expected by the CloudWatch API.
     */
    DashboardBody: DashboardBody;
    /**
     * Optional tags to apply to the dashboard.
     *
     * CloudWatch dashboards do not currently support the generic CloudWatch
     * tagging APIs, so these values are accepted for API consistency but are not
     * persisted remotely.
     */
    tags?: Record<string, string>;
}
export interface Dashboard extends Resource<"AWS.CloudWatch.Dashboard", DashboardProps, {
    /** Physical name of the dashboard. */
    dashboardName: DashboardName;
    /** ARN of the dashboard. */
    dashboardArn: DashboardArn;
    /** The parsed dashboard document as last read from CloudWatch. */
    dashboardBody: DashboardBody | undefined;
    /** Tags accepted for API consistency (not persisted remotely). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon CloudWatch dashboard. The `DashboardBody` is a structured,
 * typed document (metric, text, alarm-status, and log widgets) that the
 * provider serializes to the JSON string CloudWatch expects.
 * ### Creating Dashboards
 * **Example:** Basic Dashboard
 * ```typescript
 * const dashboard = yield* Dashboard("OpsDashboard", {
 *   DashboardBody: {
 *     widgets: [],
 *   },
 * });
 * ```
 *
 * **Example:** Dashboard with Metric and Text Widgets
 * ```typescript
 * const dashboard = yield* Dashboard("PaymentsDashboard", {
 *   DashboardBody: {
 *     widgets: [
 *       {
 *         type: "text",
 *         x: 0, y: 0, width: 6, height: 3,
 *         properties: { markdown: "# Payments service" },
 *       },
 *       {
 *         type: "metric",
 *         x: 0, y: 3, width: 12, height: 6,
 *         properties: {
 *           title: "Payments processed",
 *           metrics: [["MyApp/Payments", "PaymentProcessed"]],
 *           stat: "Sum",
 *           period: 60,
 *           view: "timeSeries",
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Reading Dashboards at Runtime
 * **Example:** Read the Dashboard Body from a Function
 * ```typescript
 * // init — bind the dashboard to the function (see GetDashboard)
 * const getDashboard = yield* AWS.CloudWatch.GetDashboard(dashboard);
 *
 * // runtime
 * const result = yield* getDashboard();
 * const body = JSON.parse(result.DashboardBody ?? "{}");
 * ```
 *
 * @resource
 */
export declare const Dashboard: import("../../Resource.ts").ResourceClass<Dashboard>;
export declare const DashboardProvider: () => import("effect/Layer").Layer<Provider.Provider<Dashboard>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Dashboard.d.ts.map