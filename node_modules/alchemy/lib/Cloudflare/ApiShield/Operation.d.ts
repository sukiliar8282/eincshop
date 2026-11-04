import * as apiGateway from "@distilled.cloud/cloudflare/api-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ApiShield.Operation";
type TypeId = typeof TypeId;
/**
 * HTTP method of an API Shield operation.
 */
export type OperationMethod = "GET" | "POST" | "HEAD" | "OPTIONS" | "PUT" | "DELETE" | "CONNECT" | "PATCH" | "TRACE";
export interface OperationProps {
    /**
     * Zone the operation is registered on.
     *
     * Immutable — moving an operation between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * The HTTP method used to access the endpoint.
     *
     * Immutable — an operation is the `(method, host, endpoint)` tuple, so
     * changing the method triggers a replacement.
     */
    method: OperationMethod;
    /**
     * RFC3986-compliant host the endpoint lives on (e.g. `api.example.com`).
     * Must belong to the zone.
     *
     * Immutable — changing the host triggers a replacement.
     */
    host: string;
    /**
     * The endpoint path, which may contain path-parameter templates in curly
     * braces (e.g. `/api/v1/users/{id}`). Cloudflare normalizes variable
     * names left-to-right to `{var1}`, `{var2}`, … on insertion.
     *
     * Immutable — changing the (normalized) endpoint triggers a replacement.
     */
    endpoint: string;
}
export interface OperationAttributes {
    /** Cloudflare-assigned UUID of the operation. */
    operationId: string;
    /** Zone the operation is registered on. */
    zoneId: string;
    /** The HTTP method used to access the endpoint. */
    method: OperationMethod;
    /** RFC3986-compliant host the endpoint lives on. */
    host: string;
    /**
     * The endpoint path as stored by Cloudflare — variable names are
     * normalized left-to-right to `{var1}`, `{var2}`, …
     */
    endpoint: string;
    /** ISO8601 timestamp of the last update. */
    lastUpdated: string;
}
export type Operation = Resource<TypeId, OperationProps, OperationAttributes, never, Providers>;
/**
 * A Cloudflare API Shield operation — a registered API endpoint on a zone,
 * identified by the `(method, host, endpoint)` tuple. Registered operations
 * are the unit other API Shield features (schema validation, rate limiting
 * recommendations, API Discovery) attach to.
 *
 * An operation is pure identity: there is no update API, so changing any
 * property triggers a replacement. Cloudflare upserts by identity — creating
 * an already-registered tuple returns the existing operation — which makes
 * reconciliation race-free.
 *
 * Endpoint paths may contain `{placeholder}` templates; Cloudflare
 * normalizes the variable names left-to-right to `{var1}`, `{var2}`, … and
 * the normalized form is what is stored and diffed.
 * ### Registering an Operation
 * **Example:** Register a GET endpoint
 * ```typescript
 * const op = yield* Cloudflare.ApiShield.Operation("GetUser", {
 *   zoneId: zone.zoneId,
 *   method: "GET",
 *   host: "api.example.com",
 *   endpoint: "/api/v1/users/{id}",
 * });
 * // op.endpoint === "/api/v1/users/{var1}"
 * ```
 *
 * **Example:** Register a POST endpoint
 * ```typescript
 * yield* Cloudflare.ApiShield.Operation("CreateUser", {
 *   zoneId: zone.zoneId,
 *   method: "POST",
 *   host: "api.example.com",
 *   endpoint: "/api/v1/users",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/management-and-monitoring/endpoint-management/
 *
 * @resource
 * @product API Shield
 * @category Application Security
 */
export declare const Operation: import("../../Resource.ts").ResourceClass<Operation>;
/**
 * Returns true if the given value is an Operation resource.
 */
export declare const isOperation: (value: unknown) => value is Operation;
export declare const OperationProvider: () => import("effect/Layer").Layer<Provider.Provider<Operation>, never, CloudflareEnvironment | apiGateway.CloudflareOpContext>;
/**
 * Normalize an endpoint path the way Cloudflare does on insertion: each
 * `{placeholder}` is replaced left-to-right with `{var1}`, `{var2}`, …
 */
export declare const normalizeEndpoint: (endpoint: string) => string;
export {};
//# sourceMappingURL=Operation.d.ts.map