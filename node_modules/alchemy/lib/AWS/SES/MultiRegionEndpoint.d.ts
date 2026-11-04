import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The lifecycle status of a multi-region endpoint: `CREATING`, `READY`,
 * `FAILED`, or `DELETING`.
 */
export type MultiRegionEndpointStatus = sesv2.Status;
export interface MultiRegionEndpointProps {
    /**
     * Name of the multi-region endpoint. If omitted, a deterministic physical
     * name is generated from the app, stage, and logical ID. Changing the name
     * replaces the endpoint.
     */
    endpointName?: string;
    /**
     * The secondary AWS regions the endpoint routes traffic across, e.g.
     * `["eu-west-1"]`. The primary region is wherever the resource is created;
     * sending traffic is split across it and every region listed here.
     *
     * There is no update API, so any change to this list replaces the endpoint.
     */
    regions: string[];
    /**
     * Tags to apply to the endpoint. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface MultiRegionEndpoint extends Resource<"AWS.SES.MultiRegionEndpoint", MultiRegionEndpointProps, {
    /** Name of the multi-region endpoint. */
    endpointName: string;
    /** Opaque endpoint identifier assigned by SES. */
    endpointId: string;
    /**
     * The endpoint's provisioning status at the time reconcile returned.
     * Provisioning is asynchronous and starts as `CREATING`; the endpoint is
     * not usable until it reaches `READY`. Reconcile does NOT wait for
     * `READY` — poll `getMultiRegionEndpoint` downstream if you need to block
     * on readiness.
     */
    status: MultiRegionEndpointStatus;
}, never, Providers> {
}
/**
 * An Amazon SES v2 multi-region endpoint (global endpoint) — a single sending
 * endpoint that splits email traffic across a primary region (where the
 * endpoint is created) and one or more secondary regions, improving
 * resilience and deliverability.
 *
 * :::note
 * Provisioning is asynchronous and can take a while: creation returns
 * immediately with status `CREATING`, and the endpoint only becomes usable
 * once it reaches `READY`. This resource does **not** wait for `READY` — the
 * `status` attribute reflects the value observed when reconcile returned.
 * Poll `getMultiRegionEndpoint` yourself if you need to block on readiness.
 * :::
 *
 * There is no update API, so any change to the name or routes replaces the
 * endpoint.
 * ### Creating Endpoints
 * **Example:** Two-Region Endpoint
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * // The primary region is wherever the stack deploys; the route adds a
 * // secondary region.
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   regions: ["eu-west-1"],
 * });
 * ```
 *
 * **Example:** Three-Region Endpoint
 * ```typescript
 * // Traffic is split across the primary region plus every listed route.
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   regions: ["eu-west-1", "ap-southeast-2"],
 * });
 * ```
 *
 * **Example:** Explicit Endpoint Name
 * ```typescript
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   endpointName: "acme-global",
 *   regions: ["eu-west-1"],
 * });
 * ```
 *
 * ### Waiting for READY
 * **Example:** Poll Until the Endpoint Is Usable
 * ```typescript
 * import * as sesv2 from "@distilled.cloud/aws/sesv2";
 * import * as Effect from "effect/Effect";
 * import * as Schedule from "effect/Schedule";
 *
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   regions: ["eu-west-1"],
 * });
 *
 * // Reconcile returns as soon as SES accepts the create, so status is
 * // usually CREATING. Poll yourself when you need to block on readiness.
 * const ready = yield* sesv2
 *   .getMultiRegionEndpoint({ EndpointName: yield* endpoint.endpointName })
 *   .pipe(
 *     Effect.repeat({
 *       schedule: Schedule.spaced("30 seconds"),
 *       until: (r) => r.Status === "READY",
 *       times: 40,
 *     }),
 *   );
 * ```
 *
 * @resource
 */
export declare const MultiRegionEndpoint: import("../../Resource.ts").ResourceClass<MultiRegionEndpoint>;
export declare const MultiRegionEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<MultiRegionEndpoint>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=MultiRegionEndpoint.d.ts.map