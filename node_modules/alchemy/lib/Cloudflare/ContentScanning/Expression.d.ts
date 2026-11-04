import * as contentScanning from "@distilled.cloud/cloudflare/content-scanning";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ContentScanning.Expression";
type TypeId = typeof TypeId;
export interface ExpressionProps {
    /**
     * Zone the custom scan expression belongs to. Stable — moving an
     * expression between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Ruleset-language expression that locates the content to scan inside
     * the request — e.g.
     * `lookup_json_string(http.request.body.raw, "file")`.
     *
     * Immutable — the API has no update endpoint for expressions, so
     * changing the payload triggers a replacement (create new, delete old).
     */
    payload: string;
}
export interface ExpressionAttributes {
    /** Cloudflare-assigned identifier of the custom scan expression. */
    expressionId: string;
    /** Zone the expression belongs to. */
    zoneId: string;
    /** The ruleset-language expression locating the content to scan. */
    payload: string;
}
export type Expression = Resource<TypeId, ExpressionProps, ExpressionAttributes, never, Providers>;
/**
 * A custom scan expression ("payload") for WAF Content Scanning — tells the
 * malicious-uploads scanner where to find encoded or nested content in the
 * request body (`/zones/{zone_id}/content-upload-scan/payloads`).
 *
 * An expression's identity is its `payload` text within the zone: the API
 * offers create/list/delete only (no update), so changing `payload`
 * triggers a replacement. The zone must have Content Scanning enabled (see
 * `Cloudflare.ContentScanning.ContentScanning`) — payload calls on a zone where scanning is
 * disabled fail with the typed `ContentScanningNotEnabled` error.
 *
 * Safety: expressions carry no ownership markers. When there is no prior
 * state, `read` scans the zone for an expression with the same payload text
 * and reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Creating expressions
 * **Example:** Scan a JSON-embedded file field
 * ```typescript
 * const scanning = yield* Cloudflare.ContentScanning.ContentScanning("UploadScanning", {
 *   zoneId: zone.zoneId,
 * });
 *
 * yield* Cloudflare.ContentScanning.Expression("ScanJsonFile", {
 *   zoneId: scanning.zoneId,
 *   payload: 'lookup_json_string(http.request.body.raw, "file")',
 * });
 * ```
 *
 * **Example:** Scan a base64-encoded form field
 * ```typescript
 * yield* Cloudflare.ContentScanning.Expression("ScanBase64Document", {
 *   zoneId: scanning.zoneId,
 *   payload: 'base64_decode(http.request.body.form["document"][0])',
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/detections/malicious-uploads/#add-custom-scan-expressions
 *
 * @resource
 * @product Content Scanning
 * @category Application Security
 */
export declare const Expression: import("../../Resource.ts").ResourceClass<Expression>;
/**
 * Returns true if the given value is a Expression resource.
 */
export declare const isExpression: (value: unknown) => value is Expression;
declare const ExpressionCreateAnomaly_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ExpressionCreateAnomaly";
} & Readonly<A>;
/**
 * Cloudflare accepted the create call but the expression did not appear in
 * the returned list — an API anomaly that should never happen in practice.
 */
export declare class ExpressionCreateAnomaly extends ExpressionCreateAnomaly_base<{
    readonly zoneId: string;
    readonly payload: string;
}> {
}
export declare const ExpressionProvider: () => import("effect/Layer").Layer<Provider.Provider<Expression>, never, CloudflareEnvironment | contentScanning.CloudflareOpContext>;
export {};
//# sourceMappingURL=Expression.d.ts.map