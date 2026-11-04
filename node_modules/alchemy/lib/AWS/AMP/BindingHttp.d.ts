/**
 * Shared scaffolding for AMP data-plane HTTP bindings.
 *
 * Amazon Managed Service for Prometheus exposes its data plane as a
 * Prometheus-compatible HTTP API under the workspace's `prometheusEndpoint`
 * (`aps:RemoteWrite`, `aps:QueryMetrics`, `aps:GetLabels`, `aps:GetSeries`,
 * `aps:GetMetricMetadata`). There is no distilled operation for these — every
 * request is a SigV4-signed HTTP call (service `"aps"`) made with the host
 * Function's own credentials.
 *
 * NOT exported from `index.ts` — only the per-capability contracts and
 * `*Http` layers are public.
 */
import * as Credentials from "@distilled.cloud/aws/Credentials";
import * as Region from "@distilled.cloud/aws/Region";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { PrometheusApiError, type PrometheusTime } from "./PrometheusTypes.ts";
import type { Workspace } from "./Workspace.ts";
/** A request against the workspace's Prometheus-compatible endpoint. */
export interface AmpHttpRequest {
    method: "GET" | "POST";
    /** Path relative to `prometheusEndpoint`, e.g. `"api/v1/query"`. */
    path: string;
    /** Query-string parameters; array values are appended repeatedly. */
    query?: Record<string, string | string[] | undefined>;
    /** URL-encoded form body (`application/x-www-form-urlencoded`). */
    form?: Record<string, string | string[] | undefined>;
    /** Raw binary body (used by remote-write). */
    bytes?: {
        data: Uint8Array;
        contentType: string;
        headers?: Record<string, string>;
    };
}
/**
 * Signs and sends one {@link AmpHttpRequest}, unwraps the Prometheus
 * `{ status, data }` envelope, and returns `data` (or `undefined` for
 * empty-body responses like remote-write's `200`).
 */
export type AmpSend = (request: AmpHttpRequest) => Effect.Effect<unknown, PrometheusApiError | Credentials.CredentialsError>;
/** Serialize a {@link PrometheusTime} for the query API. */
export declare const toPromTime: (time: PrometheusTime) => string;
/** Serialize a `Duration.Input` as a Prometheus duration string (`"30s"`). */
export declare const toPromDuration: (input: Duration.Input) => string;
/**
 * Build the shared body of an AMP data-plane `*Http` binding layer:
 * resolve the ambient distilled `Credentials`/`Region` context once at layer
 * construction, register the least-privilege IAM statement on the host
 * Function at deploy time, and hand a signed-request `send` function to the
 * capability-specific `makeClient`.
 */
export declare const makeAmpWorkspaceHttpBinding: <Client>(options: {
    /** Capability name used in the binding SID and trace spans, e.g. `"QueryMetrics"`. */
    name: string;
    /** IAM actions the capability requires on the workspace, e.g. `["aps:QueryMetrics"]`. */
    iamActions: string[];
    /** Build the typed runtime client from the signed-request sender. */
    makeClient: (send: AmpSend) => Client;
}) => Effect.Effect<(workspace: Workspace) => Effect.Effect<Client, never, never>, never, Credentials.Credentials | Region.Region>;
//# sourceMappingURL=BindingHttp.d.ts.map