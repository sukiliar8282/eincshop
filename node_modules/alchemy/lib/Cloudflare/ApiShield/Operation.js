import * as apiGateway from "@distilled.cloud/cloudflare/api-gateway";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.ApiShield.Operation";
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
export const Operation = Resource(TypeId);
/**
 * Returns true if the given value is an Operation resource.
 */
export const isOperation = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const OperationProvider = () => Provider.succeed(Operation, {
    // An operation has no mutable aspect — every attribute except the
    // last-updated timestamp survives any non-replacing deploy.
    stables: ["operationId", "zoneId", "method", "host", "endpoint"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Operations live inside a zone (`/zones/{id}/api_gateway/operations`)
        // with no account-wide enumeration API — fan out over every zone and
        // exhaustively paginate each zone's operations.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => apiGateway.listOperations.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((op) => toAttributes(op, zone.id)))), 
        // A freshly-minted scoped token can transiently 403; ride out
        // the blip, then skip zones the token genuinely can't read.
        Effect.retry({
            while: (e) => e._tag === "Forbidden",
            schedule: Schedule.exponential("500 millis"),
            times: 5,
        }), Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ olds, news }) {
        const o = olds;
        const n = news;
        if (o?.endpoint === undefined)
            return undefined;
        // The tuple is the operation's identity — any change replaces.
        if (o.method !== n.method || o.host !== n.host) {
            return { action: "replace" };
        }
        // Cloudflare normalizes `{name}` templates to `{varN}`; compare
        // normalized forms so `/users/{id}` -> `/users/{userId}` is a no-op.
        if (normalizeEndpoint(o.endpoint) !== normalizeEndpoint(n.endpoint)) {
            return { action: "replace" };
        }
        // zoneId is Input<string>; compare only once both are concrete.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (zoneId === undefined)
            return undefined;
        // Owned path: refresh by our persisted operation id.
        if (output?.operationId) {
            const observed = yield* getOperation(zoneId, output.operationId);
            if (observed)
                return toAttributes(observed, zoneId);
        }
        // Cold path: an operation with this tuple may already exist on the
        // zone (state was lost, or it was registered out-of-band). The tuple
        // is pure identity and carries no ownership markers, so report it as
        // `Unowned` and let the adopt policy gate the takeover.
        const tuple = output ?? olds;
        if (tuple?.endpoint !== undefined && typeof tuple.host === "string") {
            const observed = yield* findByTuple(zoneId, {
                method: tuple.method,
                host: tuple.host,
                endpoint: tuple.endpoint,
            });
            if (observed)
                return Unowned(toAttributes(observed, zoneId));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the operation id cached on `output` is a hint, not a
        //    guarantee: a missing operation falls through to ensure.
        const observed = output?.operationId
            ? yield* getOperation(zoneId, output.operationId)
            : undefined;
        if (observed)
            return toAttributes(observed, zoneId);
        // 2. Ensure — Cloudflare upserts by identity: registering an existing
        //    `(method, host, endpoint)` tuple returns the existing operation,
        //    so there is no AlreadyExists race to tolerate.
        const created = yield* apiGateway.createOperation({
            zoneId,
            method: news.method,
            host: news.host,
            endpoint: news.endpoint,
        });
        return toAttributes(created, zoneId);
        // 3. Sync — nothing to do: an operation is existence-only.
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* apiGateway
            .deleteOperation({
            zoneId: output.zoneId,
            operationId: output.operationId,
        })
            .pipe(Effect.catchTag("OperationNotFound", () => Effect.void));
    }),
});
/**
 * Normalize an endpoint path the way Cloudflare does on insertion: each
 * `{placeholder}` is replaced left-to-right with `{var1}`, `{var2}`, …
 */
export const normalizeEndpoint = (endpoint) => {
    let n = 0;
    return endpoint.replace(/\{[^}]*\}/g, () => {
        n += 1;
        return `{var${n}}`;
    });
};
/**
 * Read an operation by id, mapping "gone" (`OperationNotFound`, Cloudflare
 * error code 10404) to `undefined`.
 */
const getOperation = (zoneId, operationId) => apiGateway.getOperation({ zoneId, operationId }).pipe(Effect.map((op) => op), Effect.catchTag("OperationNotFound", () => Effect.succeed(undefined)));
/**
 * Find an operation by its exact `(method, host, endpoint)` tuple. The
 * tuple is the operation's identity, so at most one can match. Endpoint
 * comparison uses Cloudflare's normalized form.
 */
const findByTuple = (zoneId, tuple) => apiGateway.listOperations
    .items({ zoneId, host: [tuple.host], method: [tuple.method] })
    .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((op) => op.method === tuple.method &&
    op.host === tuple.host &&
    op.endpoint === normalizeEndpoint(tuple.endpoint))));
const toAttributes = (op, zoneId) => ({
    operationId: op.operationId,
    zoneId,
    // Distilled widens generated string enums to open unions (`string & {}`).
    method: op.method,
    host: op.host,
    endpoint: op.endpoint,
    lastUpdated: op.lastUpdated,
});
//# sourceMappingURL=Operation.js.map