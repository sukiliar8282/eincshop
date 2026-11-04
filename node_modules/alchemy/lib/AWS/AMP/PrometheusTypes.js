import * as Data from "effect/Data";
/**
 * Error returned by an AMP workspace's Prometheus-compatible data-plane API
 * (`api/v1/*` under the workspace's `prometheusEndpoint`).
 *
 * Raised when the HTTP request fails, the response is not a 2xx, the body is
 * not valid JSON, or the Prometheus envelope reports `status: "error"`.
 */
export class PrometheusApiError extends Data.TaggedError("AWS.AMP.PrometheusApiError") {
}
//# sourceMappingURL=PrometheusTypes.js.map