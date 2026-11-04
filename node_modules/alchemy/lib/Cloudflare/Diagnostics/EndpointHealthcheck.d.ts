import * as diagnostics from "@distilled.cloud/cloudflare/diagnostics";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Diagnostics.EndpointHealthcheck";
type TypeId = typeof TypeId;
export interface EndpointHealthcheckProps {
    /**
     * The IP address of the host to perform checks against. Must be an
     * on-net (private) IP reachable through Magic Transit / Magic WAN, and
     * unique among the account's endpoint healthchecks — Cloudflare rejects
     * public or duplicate IPs with an "Invalid request" error (code 1002,
     * surfaced as the typed `InvalidHealthcheckEndpoint`).
     */
    endpoint: string;
    /**
     * Type of check to perform. Only `"icmp"` is supported today.
     * @default "icmp"
     */
    checkType?: "icmp";
    /**
     * Optional name associated with this check. Not unique on Cloudflare's
     * side. If omitted, a unique name is generated from the app, stage, and
     * logical ID.
     *
     * Cannot be changed after creation — Cloudflare's PUT endpoint echoes a
     * new name back but never persists it — so updating this property
     * triggers a replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
}
export interface EndpointHealthcheckAttributes {
    /** UUID of the endpoint healthcheck. Stable across updates. */
    healthcheckId: string;
    /** The Cloudflare account the healthcheck belongs to. */
    accountId: string;
    /** Type of check performed. */
    checkType: "icmp" | (string & {});
    /** The IP address of the host checks are performed against. */
    endpoint: string;
    /** Name associated with this check. */
    name: string;
}
export type EndpointHealthcheck = Resource<TypeId, EndpointHealthcheckProps, EndpointHealthcheckAttributes, never, Providers>;
/**
 * A Magic Transit / Magic WAN endpoint healthcheck — a continuous ICMP
 * probe of an on-net IP address used to monitor reachability of hosts
 * behind Magic tunnels.
 *
 * The `endpoint` must be a private (on-net) IP; Cloudflare rejects public
 * IPs with the typed `InvalidHealthcheckEndpoint` error. The `endpoint` is
 * mutable in place via PUT (the UUID is stable across updates), but `name`
 * is create-only — changing it triggers a replacement.
 * ### Creating an endpoint healthcheck
 * **Example:** Probe an on-net host
 * ```typescript
 * const check = yield* Cloudflare.Diagnostics.EndpointHealthcheck("core-router", {
 *   endpoint: "10.0.0.1",
 * });
 * ```
 *
 * **Example:** With an explicit name
 * ```typescript
 * const check = yield* Cloudflare.Diagnostics.EndpointHealthcheck("core-router", {
 *   endpoint: "10.0.0.1",
 *   name: "core-router-probe",
 * });
 * ```
 *
 * ### Updating
 * **Example:** Re-point the probe at a different host
 * ```typescript
 * // Changing `endpoint` updates the same healthcheck in place.
 * const check = yield* Cloudflare.Diagnostics.EndpointHealthcheck("core-router", {
 *   endpoint: "10.0.0.2",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/
 *
 * @resource
 * @product Diagnostics
 * @category Observability & Analytics
 */
export declare const EndpointHealthcheck: import("../../Resource.ts").ResourceClass<EndpointHealthcheck>;
/**
 * Returns true if the given value is an EndpointHealthcheck resource.
 */
export declare const isEndpointHealthcheck: (value: unknown) => value is EndpointHealthcheck;
export declare const EndpointHealthcheckProvider: () => import("effect/Layer").Layer<Provider.Provider<EndpointHealthcheck>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | diagnostics.CloudflareOpContext>;
export {};
//# sourceMappingURL=EndpointHealthcheck.d.ts.map