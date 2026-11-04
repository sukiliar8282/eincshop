import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface WorkspaceLabelSetLimit {
    /**
     * The label set the limit applies to, as exact label name/value pairs. An
     * empty record (`{}`) is the default bucket — it applies to all time
     * series that match no other label set entry.
     */
    labelSet: Record<string, string>;
    /**
     * Maximum number of active time series that can carry this label set.
     * Omit to track the label set without enforcing a limit.
     */
    maxSeries?: number;
}
export interface WorkspaceProps {
    /**
     * A human-readable alias for the workspace. Aliases are not unique — many
     * workspaces can share one. Updating the alias is an in-place update.
     */
    alias?: string;
    /**
     * ARN of a customer-managed KMS key used to encrypt data at rest. If
     * omitted, an AWS-owned key is used. Changing the key replaces the
     * workspace (encryption configuration is immutable).
     */
    kmsKeyArn?: string;
    /**
     * How long the workspace retains ingested metric data. Accepts any
     * `Duration.Input` (e.g. `"30 days"`, `Duration.days(30)`; a bare number
     * is milliseconds); the wire unit is whole days
     * (`retentionPeriodInDays`). If omitted, the workspace keeps the service
     * default retention (150 days) and any retention configured out-of-band
     * is left untouched.
     */
    retentionPeriod?: Duration.Input;
    /**
     * Per-label-set ingestion limits (maximum active series per label set).
     * If omitted, existing label-set limits are left untouched.
     */
    limitsPerLabelSet?: WorkspaceLabelSetLimit[];
    /**
     * User-defined tags for the workspace.
     */
    tags?: Record<string, string>;
}
export interface Workspace extends Resource<"AWS.AMP.Workspace", WorkspaceProps, {
    workspaceId: string;
    workspaceArn: string;
    prometheusEndpoint: string | undefined;
    alias: string | undefined;
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Managed Service for Prometheus (AMP) workspace — a logical,
 * fully-managed Prometheus-compatible metrics store. Metrics are ingested
 * via remote-write and queried through the workspace's Prometheus-compatible
 * endpoint.
 *
 * ### Creating a Workspace
 * **Example:** Basic Workspace
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {
 *   alias: "production-metrics",
 * });
 * ```
 *
 * **Example:** Workspace with Customer-Managed Encryption
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {
 *   alias: "production-metrics",
 *   kmsKeyArn: key.keyArn,
 *   tags: { team: "observability" },
 * });
 * ```
 *
 * **Example:** Workspace with Custom Retention and Series Limits
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {
 *   alias: "production-metrics",
 *   retentionPeriod: "30 days",
 *   limitsPerLabelSet: [
 *     { labelSet: { team: "billing" }, maxSeries: 100_000 },
 *     { labelSet: {}, maxSeries: 1_000_000 }, // default bucket
 *   ],
 * });
 * ```
 *
 * ### Using the Endpoint
 * **Example:** Read the Remote-Write URL
 * ```typescript
 * // prometheusEndpoint ends in a trailing slash; append `api/v1/remote_write`
 * const remoteWrite = `${workspace.prometheusEndpoint}api/v1/remote_write`;
 * ```
 *
 * ### Runtime Bindings
 * **Example:** Write and Query Metrics from a Function
 * ```typescript
 * // inside a Lambda Function's effect (provide the *Http layers):
 * const remoteWrite = yield* AMP.RemoteWrite(workspace);
 * const metrics = yield* AMP.QueryMetrics(workspace);
 *
 * yield* remoteWrite({
 *   timeseries: [{ name: "jobs_done_total", samples: [{ value: 1 }] }],
 * });
 * const result = yield* metrics.query({ query: "jobs_done_total" });
 * ```
 *
 * @resource
 */
export declare const Workspace: import("../../Resource.ts").ResourceClass<Workspace>;
export declare const WorkspaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Workspace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Workspace.d.ts.map