import * as healthchecks from "@distilled.cloud/cloudflare/healthchecks";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { arrayEqualsUnordered } from "../../Util/equal.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.Healthcheck.Healthcheck";
/**
 * A Cloudflare standalone Health Check — monitors an origin server from
 * Cloudflare's edge and powers Health Check notifications and analytics.
 *
 * Zone-scoped and available on paid zone plans (Pro: 2 checks,
 * Business: 10, Enterprise: more). Distinct from Load Balancing
 * *Monitors*, which are account-scoped and attached to LB pools.
 *
 * Every property except `zoneId` is mutable in place (the API supports
 * full PUT updates, including renames); changing the zone triggers a
 * replacement.
 *
 * Safety: health checks carry no ownership markers, so when there is no
 * prior state `read` matches by deterministic name and reports an
 * existing check as `Unowned` — the engine refuses to take it over
 * unless `--adopt` (or `adopt(true)`) is set.
 * ### Creating a Health Check
 * **Example:** Basic HTTP health check
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("origin-check", {
 *   zoneId: zone.zoneId,
 *   address: "origin.example.com",
 * });
 * ```
 *
 * **Example:** HTTPS health check with custom path and expected codes
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("api-health", {
 *   zoneId: zone.zoneId,
 *   address: "api.example.com",
 *   type: "HTTPS",
 *   interval: 60,
 *   retries: 2,
 *   timeout: 5,
 *   httpConfig: {
 *     path: "/healthz",
 *     expectedCodes: ["200"],
 *     followRedirects: true,
 *   },
 * });
 * ```
 *
 * ### TCP health checks
 * **Example:** Probe a TCP port
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("db-port", {
 *   zoneId: zone.zoneId,
 *   address: "db.example.com",
 *   type: "TCP",
 *   tcpConfig: { port: 5432 },
 * });
 * ```
 *
 * ### Suspending a check
 * **Example:** Temporarily stop probing the origin
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("origin-check", {
 *   zoneId: zone.zoneId,
 *   address: "origin.example.com",
 *   suspended: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/health-checks/
 *
 * @resource
 * @product Health Checks
 * @category Performance & Reliability
 */
export const Healthcheck = Resource(TypeId, {
    aliases: ["Cloudflare.Healthcheck"],
});
/**
 * Returns true if the given value is a Healthcheck resource.
 */
export const isHealthcheck = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const HealthcheckProvider = () => Provider.succeed(Healthcheck, {
    stables: ["healthcheckId", "zoneId", "createdOn"],
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; by diff time both sides are concrete
        // strings when statically known.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        // Owned path: we have persisted state (our own id) — refresh it.
        if (output?.healthcheckId) {
            const observed = yield* getHealthcheck(output.zoneId, output.healthcheckId);
            if (observed)
                return toAttributes(observed, output.zoneId);
            return undefined;
        }
        // Adoption path: no state of our own, but a check with our
        // deterministic name may already exist. Health checks carry no
        // ownership markers we can inspect, so we cannot prove we created
        // it — brand it `Unowned` so the engine refuses to take over
        // unless `adopt` is set.
        const zoneId = olds?.zoneId;
        if (!zoneId)
            return undefined;
        const name = yield* createHealthcheckName(id, olds?.name);
        const match = yield* findByName(zoneId, name);
        if (match) {
            const attrs = toAttributes(match, zoneId);
            if (attrs)
                return Unowned(attrs);
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const name = yield* createHealthcheckName(id, news.name);
        const desired = buildDesiredBody(news, name);
        // 1. Observe — the id cached on `output` is a hint, not a
        //    guarantee: a 404 falls through to "missing".
        let observed;
        if (output?.healthcheckId) {
            observed = yield* getHealthcheck(zoneId, output.healthcheckId);
        }
        // Fall back to matching by name (names are unique per zone), which
        // also recovers from lost ids after the adopt gate has passed.
        if (!observed) {
            observed = yield* findByName(zoneId, name);
        }
        // 2. Ensure — create when missing; a concurrent create of the same
        //    name surfaces as `HealthcheckAlreadyExists`, which we treat as
        //    a race: re-read by name and converge via update below.
        let justCreated = false;
        if (!observed) {
            observed = yield* healthchecks
                .createHealthcheck({ zoneId, ...desired })
                .pipe(Effect.map((created) => created), Effect.catchTag("HealthcheckAlreadyExists", () => findByName(zoneId, name)));
            justCreated = observed !== undefined;
        }
        // 3. Sync — the update endpoint is a PUT that takes the full body;
        //    diff observed cloud state against desired and skip the call
        //    entirely on a no-op.
        if (observed?.id &&
            !justCreated &&
            !desiredEqualsObserved(desired, observed)) {
            observed = yield* healthchecks.updateHealthcheck({
                zoneId,
                healthcheckId: observed.id,
                ...desired,
            });
        }
        // 4. Return.
        const attrs = observed ? toAttributes(observed, zoneId) : undefined;
        if (!attrs) {
            return yield* Effect.fail(new Error(`Cloudflare did not return a usable health check for "${name}"`));
        }
        return attrs;
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* healthchecks
            .deleteHealthcheck({
            zoneId: output.zoneId,
            healthcheckId: output.healthcheckId,
        })
            .pipe(
        // Already gone — deletion is idempotent.
        Effect.catchTag("HealthcheckNotFound", () => Effect.void));
    }),
    // Health checks are zone-scoped (`/zones/{zone_id}/healthchecks`) with no
    // account-wide enumeration API, so fan out over every zone and list per
    // zone. A scoped token may lack permission on a zone (eventual consistency)
    // or a zone may be partially provisioned — skip those zones (-> []) rather
    // than failing the whole enumeration.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => healthchecks.listHealthchecks.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).flatMap((h) => {
            const attrs = toAttributes(h, zone.id);
            return attrs ? [attrs] : [];
        }))), Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read a health check by id, mapping "gone" (`HealthcheckNotFound`,
 * HTTP 404) to `undefined`.
 */
const getHealthcheck = (zoneId, healthcheckId) => healthchecks
    .getHealthcheck({ zoneId, healthcheckId })
    .pipe(Effect.catchTag("HealthcheckNotFound", () => Effect.succeed(undefined)));
/**
 * Find a health check by exact name. Names are unique per zone, so the
 * first exact match is the resource.
 */
const findByName = (zoneId, name) => healthchecks.listHealthchecks.items({ zoneId }).pipe(Stream.filter((h) => h.name === name), Stream.runHead, Effect.map((h) => Option.getOrUndefined(h)));
const createHealthcheckName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
/**
 * The full desired body sent on both create and PUT update. Documented
 * Cloudflare defaults are filled in so the observed-vs-desired diff is
 * exact and removing a prop converges back to the default.
 */
const buildDesiredBody = (news, name) => ({
    name,
    address: news.address,
    type: news.type ?? "HTTP",
    description: news.description ?? "",
    checkRegions: news.checkRegions,
    consecutiveFails: news.consecutiveFails ?? 1,
    consecutiveSuccesses: news.consecutiveSuccesses ?? 1,
    interval: news.interval ?? 60,
    retries: news.retries ?? 2,
    timeout: news.timeout ?? 5,
    suspended: news.suspended ?? false,
    httpConfig: news.httpConfig,
    tcpConfig: news.tcpConfig,
});
const desiredEqualsObserved = (desired, observed) => {
    if (desired.name !== observed.name)
        return false;
    if (desired.address !== observed.address)
        return false;
    if (desired.type !== observed.type)
        return false;
    if (desired.description !== (observed.description ?? ""))
        return false;
    if (desired.checkRegions !== undefined &&
        !arrayEqualsUnordered(desired.checkRegions, observed.checkRegions ?? [])) {
        return false;
    }
    if (desired.consecutiveFails !== (observed.consecutiveFails ?? 1)) {
        return false;
    }
    if (desired.consecutiveSuccesses !== (observed.consecutiveSuccesses ?? 1)) {
        return false;
    }
    if (desired.interval !== (observed.interval ?? 60))
        return false;
    if (desired.retries !== (observed.retries ?? 2))
        return false;
    if (desired.timeout !== (observed.timeout ?? 5))
        return false;
    if (desired.suspended !== (observed.suspended ?? false))
        return false;
    if (desired.httpConfig !== undefined &&
        !httpConfigEquals(desired.httpConfig, observed.httpConfig ?? undefined)) {
        return false;
    }
    if (desired.tcpConfig !== undefined &&
        !tcpConfigEquals(desired.tcpConfig, observed.tcpConfig ?? undefined)) {
        return false;
    }
    return true;
};
/**
 * Compare only the http_config fields the user actually specified —
 * Cloudflare fills the rest with plan/type-dependent defaults we should
 * not fight.
 */
const httpConfigEquals = (desired, observed) => {
    if (observed === undefined)
        return false;
    if (desired.allowInsecure !== undefined &&
        desired.allowInsecure !== (observed.allowInsecure ?? false)) {
        return false;
    }
    if (desired.expectedBody !== undefined &&
        desired.expectedBody !== (observed.expectedBody ?? "")) {
        return false;
    }
    if (desired.expectedCodes !== undefined &&
        !arrayEqualsUnordered(desired.expectedCodes, observed.expectedCodes ?? [])) {
        return false;
    }
    if (desired.followRedirects !== undefined &&
        desired.followRedirects !== (observed.followRedirects ?? false)) {
        return false;
    }
    if (desired.method !== undefined && desired.method !== observed.method) {
        return false;
    }
    if (desired.path !== undefined && desired.path !== observed.path) {
        return false;
    }
    if (desired.port !== undefined && desired.port !== observed.port) {
        return false;
    }
    if (desired.header !== undefined &&
        !headerEquals(desired.header, observed.header)) {
        return false;
    }
    return true;
};
const headerEquals = (desired, observed) => {
    const obs = observed ?? {};
    const keys = Object.keys(desired);
    if (keys.length !== Object.keys(obs).length)
        return false;
    return keys.every((k) => {
        const o = obs[k];
        return (Array.isArray(o) && arrayEqualsUnordered(desired[k] ?? [], o.map(String)));
    });
};
const tcpConfigEquals = (desired, observed) => {
    if (observed === undefined)
        return false;
    if (desired.method !== undefined &&
        desired.method !== (observed.method ?? "connection_established")) {
        return false;
    }
    if (desired.port !== undefined && desired.port !== observed.port) {
        return false;
    }
    return true;
};
const toAttributes = (observed, zoneId) => {
    if (!observed.id || !observed.name || !observed.address || !observed.type) {
        return undefined;
    }
    return {
        healthcheckId: observed.id,
        zoneId,
        name: observed.name,
        address: observed.address,
        type: observed.type,
        status: (observed.status ?? "unknown"),
        failureReason: observed.failureReason ?? undefined,
        suspended: observed.suspended ?? false,
        interval: observed.interval ?? 60,
        retries: observed.retries ?? 2,
        timeout: observed.timeout ?? 5,
        createdOn: observed.createdOn ?? undefined,
        modifiedOn: observed.modifiedOn ?? undefined,
    };
};
//# sourceMappingURL=Healthcheck.js.map