import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Tolerance band around the expected value inside which deviations are not
 * flagged — either an absolute `amount` or a `ratio` of the expected value.
 */
export type AnomalyDetectorIgnoreNearExpected = {
    amount: number;
} | {
    ratio: number;
};
/** What the detector does with evaluation windows that have no data. */
export type AnomalyDetectorMissingDataAction = {
    markAsAnomaly: boolean;
} | {
    skip: boolean;
};
export interface AnomalyDetectorProps {
    /**
     * Id of the AMP workspace the detector runs in. Changing the workspace
     * replaces the detector.
     */
    workspaceId: string;
    /**
     * Human-readable alias for the detector, unique within the workspace.
     * Changing the alias replaces the detector.
     */
    alias: string;
    /**
     * The PromQL query producing the time series the Random Cut Forest
     * algorithm scores for anomalies. Updating it retrains the detector.
     */
    query: string;
    /**
     * Number of consecutive data points combined into one sample (shingle)
     * for scoring. If omitted, the service default is used.
     */
    shingleSize?: number;
    /**
     * Number of points sampled per Random Cut Forest tree. If omitted, the
     * service default is used.
     */
    sampleSize?: number;
    /**
     * Suppress anomalies above the expected value that fall within this
     * tolerance band.
     */
    ignoreNearExpectedFromAbove?: AnomalyDetectorIgnoreNearExpected;
    /**
     * Suppress anomalies below the expected value that fall within this
     * tolerance band.
     */
    ignoreNearExpectedFromBelow?: AnomalyDetectorIgnoreNearExpected;
    /**
     * How often the detector evaluates the query. Accepts any
     * `Duration.Input` (e.g. `"1 minute"`, `Duration.minutes(1)`; a bare
     * number is milliseconds); the wire unit is whole seconds
     * (`evaluationIntervalInSeconds`). If omitted, the service default is
     * used.
     */
    evaluationInterval?: Duration.Input;
    /**
     * What to do when an evaluation window has no data: mark it as an
     * anomaly (`{ markAsAnomaly: true }`) or skip it (`{ skip: true }`).
     */
    missingDataAction?: AnomalyDetectorMissingDataAction;
    /**
     * Extra labels attached to the anomaly metrics the detector emits.
     */
    labels?: Record<string, string>;
    /**
     * User-defined tags for the detector.
     */
    tags?: Record<string, string>;
}
export interface AnomalyDetector extends Resource<"AWS.AMP.AnomalyDetector", AnomalyDetectorProps, {
    workspaceId: string;
    anomalyDetectorId: string;
    anomalyDetectorArn: string;
    alias: string;
    status: string;
}, never, Providers> {
}
/**
 * A Random Cut Forest anomaly detector inside an Amazon Managed Service for
 * Prometheus workspace — continuously evaluates a PromQL query and emits
 * anomaly scores as new metrics in the same workspace.
 *
 * ### Creating an Anomaly Detector
 * **Example:** Detect Anomalies on a Request-Rate Query
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const detector = yield* AMP.AnomalyDetector("RequestSpikes", {
 *   workspaceId: workspace.workspaceId,
 *   alias: "request-spikes",
 *   query: 'rate(http_requests_total{job="api"}[5m])',
 *   evaluationInterval: "1 minute",
 *   missingDataAction: { skip: true },
 * });
 * ```
 *
 * @resource
 */
export declare const AnomalyDetector: import("../../Resource.ts").ResourceClass<AnomalyDetector>;
export declare const AnomalyDetectorProvider: () => import("effect/Layer").Layer<Provider.Provider<AnomalyDetector>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AnomalyDetector.d.ts.map