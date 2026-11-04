import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AnomalyMonitorProps {
    /**
     * Name of the anomaly monitor. If omitted, a unique name is generated from
     * the app, stage, and logical ID. Renaming updates the monitor in place.
     */
    monitorName?: string;
    /**
     * The type of monitor.
     *
     * - `DIMENSIONAL` — monitors spend grouped by a built-in dimension
     *   (`monitorDimension`). AWS allows only one `SERVICE`-dimension monitor
     *   per account.
     * - `CUSTOM` — monitors spend matching a custom `monitorSpecification`
     *   expression (linked accounts, cost allocation tags, or cost categories).
     *
     * Changing the type replaces the monitor.
     */
    monitorType: "DIMENSIONAL" | "CUSTOM" | (string & {});
    /**
     * The dimension to group spend by for `DIMENSIONAL` monitors. Required when
     * `monitorType` is `DIMENSIONAL`. Changing it replaces the monitor.
     */
    monitorDimension?: "SERVICE" | (string & {});
    /**
     * The expression selecting the spend a `CUSTOM` monitor evaluates —
     * linked accounts, cost allocation tags, or cost categories (raw
     * Cost Explorer `Expression` shape). Required when `monitorType` is
     * `CUSTOM`. Changing it replaces the monitor.
     */
    monitorSpecification?: ce.Expression;
    /**
     * User-defined tags to apply to the monitor.
     */
    tags?: Record<string, string>;
}
export interface AnomalyMonitor extends Resource<"AWS.CostExplorer.AnomalyMonitor", AnomalyMonitorProps, {
    /** ARN of the anomaly monitor. */
    monitorArn: string;
    /** Name of the anomaly monitor. */
    monitorName: string;
    /** Type of the monitor (`DIMENSIONAL` or `CUSTOM`). */
    monitorType: string;
    /** Current tags on the monitor. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A Cost Explorer anomaly detection monitor. Monitors evaluate your spend for
 * unusual patterns; pair with an
 * {@link ../AnomalySubscription | AnomalySubscription} to receive alerts.
 *
 * Cost Explorer is a global service — all calls are pinned to `us-east-1`
 * regardless of the stack region. Monitors are free and take effect
 * immediately.
 *
 * ### Creating Anomaly Monitors
 * **Example:** Custom monitor scoped by a cost allocation tag
 * ```typescript
 * import * as CostExplorer from "alchemy/AWS/CostExplorer";
 *
 * const monitor = yield* CostExplorer.AnomalyMonitor("TeamSpend", {
 *   monitorType: "CUSTOM",
 *   monitorSpecification: {
 *     Tags: { Key: "CostCenter", Values: ["10000"] },
 *   },
 * });
 * ```
 *
 * **Example:** Dimensional monitor across all AWS services
 * ```typescript
 * const monitor = yield* CostExplorer.AnomalyMonitor("ServiceSpend", {
 *   monitorType: "DIMENSIONAL",
 *   monitorDimension: "SERVICE",
 * });
 * ```
 *
 * @resource
 */
export declare const AnomalyMonitor: import("../../Resource.ts").ResourceClass<AnomalyMonitor>;
export declare const AnomalyMonitorProvider: () => import("effect/Layer").Layer<Provider.Provider<AnomalyMonitor>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AnomalyMonitor.d.ts.map