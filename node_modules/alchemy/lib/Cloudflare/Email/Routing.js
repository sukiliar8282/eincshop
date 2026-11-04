import * as emailRouting from "@distilled.cloud/cloudflare/email-routing";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { resolveZoneId } from "../Zone/index.js";
import { listAllZones } from "../Zone/lookup.js";
const toAttributes = (zoneId, result) => ({
    routingId: result.id,
    zoneId,
    name: result.name,
    enabled: result.enabled,
    status: (result.status ?? undefined),
});
/**
 * Enables Cloudflare Email Routing on a zone. This is the prerequisite for
 * receiving mail at any address on the domain and for sending email from a
 * Worker via `send_email` bindings.
 * ### Enabling Email Routing
 * **Example:** Enable on a zone you own
 * ```typescript
 * const routing = yield* Cloudflare.Email.Routing("Routing", {
 *   zone: "example.com",
 * });
 * ```
 *
 * @resource
 * @product Email
 * @category Email
 */
export const Routing = Resource("Cloudflare.Email.Routing", {
    aliases: ["Cloudflare.EmailRouting"],
});
const resolve = Effect.fn(function* (zone) {
    const { accountId } = yield* yield* CloudflareEnvironment;
    return yield* resolveZoneId({
        accountId,
        zone,
        hostname: typeof zone === "string" ? zone : (zone.name ?? ""),
    });
});
export const RoutingProvider = () => Provider.succeed(Routing, {
    nuke: { singleton: true },
    stables: ["zoneId", "routingId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Email Routing settings are a per-zone singleton — no account-wide
        // enumeration API. Enumerate every zone in the account and read the
        // settings in each (every zone has one).
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => emailRouting.getEmailRouting({ zoneId }).pipe(Effect.map((result) => toAttributes(zoneId, result)), 
        // Plan-gated or partial zones reject the route; skip them.
        Effect.catchTag("InvalidRoute", () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!output)
            return undefined;
        if (!isResolved(news))
            return undefined;
        const zoneId = yield* resolve(news.zone);
        if (zoneId !== output.zoneId) {
            return { action: "replace" };
        }
        if ((news.enabled ?? true) !== output.enabled) {
            return { action: "update" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        if (!output?.zoneId)
            return undefined;
        const result = yield* emailRouting.getEmailRouting({
            zoneId: output.zoneId,
        });
        return {
            routingId: result.id,
            zoneId: output.zoneId,
            name: result.name,
            enabled: result.enabled,
            status: (result.status ?? undefined),
        };
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const zoneId = output?.zoneId ?? (yield* resolve(news.zone));
        const desired = news.enabled ?? true;
        if (desired) {
            const result = yield* emailRouting.enableEmailRouting({ zoneId });
            return {
                routingId: result.id,
                zoneId,
                name: result.name,
                enabled: result.enabled,
                status: (result.status ?? undefined),
            };
        }
        else {
            const result = yield* emailRouting.disableEmailRouting({ zoneId });
            return {
                routingId: result.id,
                zoneId,
                name: result.name,
                enabled: result.enabled,
                status: (result.status ?? undefined),
            };
        }
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* emailRouting
            .disableEmailRouting({ zoneId: output.zoneId })
            .pipe(Effect.catch(() => Effect.void));
    }),
});
//# sourceMappingURL=Routing.js.map