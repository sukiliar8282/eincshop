import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AnomalyDetectorProps extends cloudwatch.PutAnomalyDetectorInput {
}
export interface AnomalyDetector extends Resource<"AWS.CloudWatch.AnomalyDetector", AnomalyDetectorProps, {
    /** Synthetic identifier derived from the detector's metric identity. */
    detectorId: string;
    /** The full AnomalyDetector description as last read from CloudWatch. */
    anomalyDetector: cloudwatch.AnomalyDetector;
}, never, Providers> {
}
/**
 * A CloudWatch anomaly detector — trains a model on a metric's historical
 * data and computes an expected-value band, which alarms can use via the
 * `ANOMALY_DETECTION_BAND` metric-math function.
 * ### Creating Detectors
 * **Example:** Single Metric Detector
 * ```typescript
 * const detector = yield* AnomalyDetector("ErrorsDetector", {
 *   Namespace: "AWS/Lambda",
 *   MetricName: "Errors",
 *   Stat: "Sum",
 * });
 * ```
 *
 * **Example:** Detector on a Custom Metric
 * ```typescript
 * // pair with PutMetricData publishing to the same namespace/metric
 * const detector = yield* AnomalyDetector("PaymentsDetector", {
 *   Namespace: "MyApp/Payments",
 *   MetricName: "PaymentProcessed",
 *   Stat: "Sum",
 * });
 * ```
 *
 * ### Reading Detectors at Runtime
 * **Example:** List Detectors from a Function
 * ```typescript
 * // init — see DescribeAnomalyDetectors
 * const describeAnomalyDetectors = yield* AWS.CloudWatch.DescribeAnomalyDetectors();
 *
 * // runtime
 * const result = yield* describeAnomalyDetectors({ Namespace: "MyApp/Payments" });
 * ```
 *
 * @resource
 */
export declare const AnomalyDetector: import("../../Resource.ts").ResourceClass<AnomalyDetector>;
export declare const AnomalyDetectorProvider: () => import("effect/Layer").Layer<Provider.Provider<AnomalyDetector>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AnomalyDetector.d.ts.map