import * as zones from "@distilled.cloud/cloudflare/zones";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Equivalence from "effect/Equivalence";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { stripNullFields } from "../../Util/data.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { findZoneByName } from "./lookup.js";
/**
 * A Cloudflare Zone (DNS domain) managed by Alchemy.
 *
 * Zones default to **retain** on removal — destroying the stack does NOT
 * delete the zone in Cloudflare. Opt in to actual deletion by wrapping the
 * resource (or the whole stack) in {@link destroy}() from
 * `alchemy/RemovalPolicy`.
 * ### Creating a Zone
 * **Example:** Create a new zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("MyZone", {
 *   name: "example.com",
 * });
 * ```
 *
 * **Example:** Allow destruction
 * ```typescript
 * import { destroy } from "alchemy/RemovalPolicy";
 * yield* Cloudflare.Zone.Zone("MyZone", { name: "example.com" }).pipe(destroy());
 * ```
 *
 * ### Adopting an existing Zone
 * **Example:** Take over a zone that already exists in Cloudflare
 * ```typescript
 * import { adopt } from "alchemy/AdoptPolicy";
 * // A zone carries no ownership markers, so the engine refuses to take over a
 * // pre-existing zone unless you opt in with `adopt(true)`.
 * const zone = yield* Cloudflare.Zone.Zone("MyZone", {
 *   name: "example.com",
 * }).pipe(adopt(true));
 * // zone.zoneId, zone.nameServers, zone.accountId, ...
 * ```
 *
 * @resource
 * @product Zones
 * @category Domains & DNS
 */
export const Zone = Resource("Cloudflare.Zone.Zone", {
    defaultRemovalPolicy: "retain",
    aliases: ["Cloudflare.Zone"],
});
export const ZoneProvider = () => Provider.effect(Zone, Effect.gen(function* () {
    // const get = yield* zones.getZone;
    // const create = yield* zones.createZone;
    // const patch = yield* zones.patchZone;
    // const del = yield* zones.deleteZone;
    return {
        stables: ["name", "zoneId", "accountId"],
        diff: Effect.fn(function* ({ news, output }) {
            if (!output)
                return undefined;
            if (!isResolved(news))
                return undefined;
            if (news.name !== output.name) {
                return { action: "replace" };
            }
            const desiredType = news.type ?? "full";
            const desiredPaused = news.paused ?? false;
            const desiredVanity = news.vanityNameServers ?? [];
            if (desiredType !== output.type ||
                desiredPaused !== output.paused ||
                !stringArrayEq(desiredVanity, output.vanityNameServers ?? [])) {
                return { action: "update" };
            }
            return undefined;
        }),
        read: Effect.fn(function* ({ output, olds }) {
            const { accountId } = yield* yield* CloudflareEnvironment;
            const name = output?.name ?? olds?.name;
            // Owned path: we have persisted state (our own zoneId) — refresh it.
            if (output?.zoneId) {
                const result = yield* zones
                    .getZone({ zoneId: output.zoneId })
                    .pipe(Effect.catch(() => Effect.succeed(undefined)));
                if (result)
                    return toZoneAttributes(result, accountId);
            }
            // Adoption path: no state of our own, but a zone with this name
            // already exists in the cloud. Cloudflare zones carry no ownership
            // markers we can inspect, so we cannot prove we created it — brand
            // it `Unowned` so the engine refuses to take over unless `adopt` is
            // set.
            if (name) {
                const match = yield* findZoneByName({ accountId, name });
                if (!match)
                    return undefined;
                const result = yield* zones.getZone({ zoneId: match.id });
                return Unowned(toZoneAttributes(result, accountId));
            }
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ news, output }) {
            const { accountId } = yield* yield* CloudflareEnvironment;
            // 1. Observe — do we have a live zone for this name?
            let zoneId = output?.zoneId;
            if (!zoneId) {
                const match = yield* findZoneByName({
                    accountId,
                    name: news.name,
                });
                zoneId = match?.id;
            }
            // 2. Ensure — create if missing.
            if (!zoneId) {
                zoneId = yield* zones
                    .createZone({
                    account: { id: accountId },
                    name: news.name,
                    type: news.type ?? "full",
                })
                    .pipe(Effect.map((created) => created.id), 
                // A concurrent deploy (or a prior crashed run) may have created
                // the zone between our observe and create — recover by resolving
                // its id rather than failing the reconcile.
                Effect.catchTag("ZoneAlreadyExists", () => findZoneByName({ accountId, name: news.name }).pipe(Effect.flatMap((match) => match
                    ? Effect.succeed(match.id)
                    : Effect.fail(new Error(`Cloudflare reported zone ${news.name} already exists but it could not be found`))))));
            }
            // 3. Sync — apply mutable settings (type/paused/vanity NS).
            const observed = yield* zones.getZone({ zoneId });
            const desiredType = news.type ?? "full";
            const desiredPaused = news.paused ?? false;
            const desiredVanity = news.vanityNameServers ?? [];
            const needsPatch = (observed.type ?? "full") !== desiredType ||
                (observed.paused ?? false) !== desiredPaused ||
                !stringArrayEq(observed.vanityNameServers ?? [], desiredVanity);
            if (needsPatch) {
                yield* zones.patchZone({
                    zoneId,
                    type: desiredType,
                    paused: desiredPaused,
                    vanityNameServers: desiredVanity,
                });
            }
            const final = yield* zones.getZone({ zoneId });
            return toZoneAttributes(final, accountId);
        }),
        delete: Effect.fn(function* ({ output }) {
            if (!output.zoneId)
                return;
            yield* zones.deleteZone({ zoneId: output.zoneId }).pipe(
            // Zone already gone — idempotent delete.
            Effect.catchTag("InvalidZoneIdentifier", () => Effect.void));
        }),
        list: () => Effect.gen(function* () {
            const { accountId } = yield* yield* CloudflareEnvironment;
            // Enumerate every zone in the account, paginating exhaustively.
            const zoneIds = yield* zones.listZones
                .pages({ account: { id: accountId } })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.fromIterable(chunk).flatMap((page) => (page.result ?? []).map((zone) => zone.id))));
            // Hydrate each into the exact `read` Attributes shape via getZone,
            // tolerating zones that vanish mid-enumeration.
            const rows = yield* Effect.forEach(zoneIds, (zoneId) => zones.getZone({ zoneId }).pipe(Effect.map((result) => toZoneAttributes(result, accountId)), Effect.catchTag("InvalidZoneIdentifier", () => Effect.succeed(undefined))), { concurrency: 10 });
            return rows.filter((row) => row !== undefined);
        }),
    };
}));
/** @internal — shape a distilled zones API result into `Attributes`. */
export const toZoneAttributes = (result, fallbackAccountId) => {
    // Cloudflare returns `null` for absent fields; drop them so every optional
    // attribute is simply `undefined` (matching `Attributes`).
    const z = stripNullFields(result);
    return {
        zoneId: z.id,
        name: z.name,
        accountId: z.account.id ?? fallbackAccountId,
        accountName: z.account.name,
        type: z.type ?? "full",
        status: z.status,
        paused: z.paused ?? false,
        nameServers: z.nameServers,
        originalNameServers: z.originalNameServers,
        vanityNameServers: z.vanityNameServers,
        activatedOn: z.activatedOn,
        createdOn: z.createdOn,
        developmentMode: z.developmentMode,
        modifiedOn: z.modifiedOn,
        originalDnshost: z.originalDnshost,
        originalRegistrar: z.originalRegistrar,
        cnameSuffix: z.cnameSuffix,
        verificationKey: z.verificationKey,
        meta: z.meta,
        owner: z.owner,
        tenant: z.tenant,
        tenantUnit: z.tenantUnit,
    };
};
const stringArrayEq = Array.makeEquivalence(Equivalence.String);
//# sourceMappingURL=Zone.js.map