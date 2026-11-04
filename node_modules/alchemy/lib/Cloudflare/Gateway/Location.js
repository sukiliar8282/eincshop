import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { arrayEqualsUnordered } from "../../Util/equal.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Gateway.Location";
/**
 * A Cloudflare Zero Trust Gateway DNS location — a configured source of
 * DNS traffic (an office, a home network, a device fleet) with its own
 * DNS-over-HTTPS endpoint and optional dedicated destination IPs.
 *
 * Cloudflare assigns each location a stable `dohSubdomain`; point your
 * network's DoH resolver at
 * `https://<dohSubdomain>.cloudflare-gateway.com/dns-query` and Gateway
 * DNS policies apply to its traffic. All declared properties converge in
 * place — nothing on a location forces a replacement.
 * ### Creating a Location
 * **Example:** DoH-only location
 * ```typescript
 * const office = yield* Cloudflare.Gateway.Location("Office", {
 *   ecsSupport: false,
 * });
 * // Point your resolver at the assigned DoH endpoint:
 * const doh = office.dohSubdomain;
 * ```
 *
 * **Example:** Location with IPv4 source networks
 * ```typescript
 * const office = yield* Cloudflare.Gateway.Location("Office", {
 *   networks: [{ network: "203.0.113.0/24" }],
 *   endpoints: {
 *     doh: { enabled: true },
 *     dot: { enabled: false },
 *     ipv4: { enabled: true },
 *     ipv6: { enabled: false },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/agentless/dns/locations/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export const Location = Resource(TypeId);
/**
 * Returns true if the given value is a Location resource.
 */
export const isLocation = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
/**
 * Right after a location create/update, Cloudflare's edge intermittently
 * answers the write with a 401 `Unauthorized` carrying "This account does
 * not have access to this feature." even though the account is fully
 * entitled — the same transient edge/token-propagation blip the read path
 * rides out as a 403 `Forbidden`. It clears within a few hundred ms, so we
 * retry the mutation while we see exactly that message. A genuine
 * entitlement loss carries the same tag, but the bounded retry surfaces it
 * quickly instead of looping. Matching the message keeps real auth failures
 * (a bad/expired token) non-retryable.
 */
const isTransientFeatureAccessBlip = (e) => e._tag === "Unauthorized" &&
    (e.message ?? "").includes("does not have access to this feature");
export const LocationProvider = () => Provider.succeed(Location, {
    stables: ["locationId", "accountId", "dohSubdomain", "ip", "createdAt"],
    // Account-scoped collection: enumerate every Gateway location in the
    // ambient account, exhaustively paginating, and hydrate each into the
    // exact `read` Attributes shape. The list response already carries the
    // full per-location state, so no follow-up get is needed.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listGatewayLocations.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .map((l) => toAttributes(l, accountId))
            // The account's default location can't be deleted while it is
            // the client default (`CannotDeleteDefaultGatewayLocation`);
            // never enumerate it for account-wide teardown.
            .filter((l) => !l.clientDefault))));
    }),
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // Everything declared on a location converges via PUT.
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path — refresh by the cached location id.
        if (output?.locationId) {
            const observed = yield* getLocation(acct, output.locationId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold read — locate by deterministic name. Locations carry no
        // ownership markers, so report the match as Unowned to gate adoption.
        const name = yield* resolveName(id, olds?.name ?? output?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* resolveName(id, news.name);
        // 1. Observe — the cached id is a hint; fall back to a name scan so
        //    out-of-band deletes / lost state converge.
        let observed = output?.locationId
            ? yield* getLocation(accountId, output.locationId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create with the full desired body when missing. Names
        //    are not unique on Cloudflare's side, so there is no
        //    AlreadyExists race to tolerate.
        if (!observed) {
            const created = yield* zeroTrust
                .createGatewayLocation({
                accountId,
                name,
                clientDefault: news.clientDefault,
                ecsSupport: news.ecsSupport,
                dnsDestinationIpsId: news.dnsDestinationIpsId,
                endpoints: news.endpoints,
                networks: news.networks,
            })
                // See `isTransientFeatureAccessBlip` — ride out the transient
                // 401 "does not have access to this feature" edge blip.
                .pipe(Effect.retry({
                while: isTransientFeatureAccessBlip,
                schedule: Schedule.exponential("500 millis"),
                times: 8,
            }));
            return toAttributes(created, accountId);
        }
        // 3. Sync — diff observed cloud state against desired; the update
        //    API is a PUT of the full mutable state, so send everything but
        //    skip the call entirely on a no-op. Networks compare as an
        //    unordered set; endpoints stringify-compare only when declared.
        const desired = {
            name,
            clientDefault: news.clientDefault ?? observed.clientDefault ?? false,
            ecsSupport: news.ecsSupport ?? observed.ecsSupport ?? false,
            dnsDestinationIpsId: news.dnsDestinationIpsId,
            endpoints: news.endpoints,
            networks: news.networks,
        };
        const dirty = observed.name !== desired.name ||
            (observed.clientDefault ?? false) !== desired.clientDefault ||
            (observed.ecsSupport ?? false) !== desired.ecsSupport ||
            (news.dnsDestinationIpsId !== undefined &&
                observed.dnsDestinationIpsId !== news.dnsDestinationIpsId) ||
            (news.networks !== undefined &&
                !sameNetworks(observed.networks ?? [], news.networks)) ||
            (news.endpoints !== undefined &&
                !sameEndpoints(observed.endpoints, news.endpoints));
        if (dirty) {
            const updated = yield* zeroTrust
                .updateGatewayLocation({
                accountId,
                locationId: observed.id,
                name: desired.name,
                clientDefault: desired.clientDefault,
                ecsSupport: desired.ecsSupport,
                dnsDestinationIpsId: desired.dnsDestinationIpsId,
                endpoints: desired.endpoints,
                networks: desired.networks,
            })
                // See `isTransientFeatureAccessBlip` — ride out the transient
                // 401 "does not have access to this feature" edge blip.
                .pipe(Effect.retry({
                while: isTransientFeatureAccessBlip,
                schedule: Schedule.exponential("500 millis"),
                times: 8,
            }));
            return toAttributes(updated, accountId);
        }
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Deleting the default location while it is the client default is a
        // non-retryable 4xx (CannotDeleteDefaultGatewayLocation, code 1217)
        // and propagates. A missing location (GatewayLocationNotFound, code
        // 1103) means we're done.
        yield* zeroTrust
            .deleteGatewayLocation({
            accountId: output.accountId,
            locationId: output.locationId,
        })
            .pipe(Effect.catchTag("GatewayLocationNotFound", () => Effect.void));
    }),
});
/**
 * Read a location by id, mapping "gone" (`GatewayLocationNotFound`,
 * Cloudflare error code 1103) to `undefined`.
 */
const getLocation = (accountId, locationId) => zeroTrust.getGatewayLocation({ accountId, locationId }).pipe(Effect.map((l) => l), Effect.catchTag("GatewayLocationNotFound", () => Effect.succeed(undefined)));
/**
 * Find a location by exact name. Names are not unique on Cloudflare's
 * side; pick the oldest match for determinism.
 */
const findByName = (accountId, name) => zeroTrust.listGatewayLocations.items({ accountId }).pipe(Stream.filter((l) => l.name === name), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
    .at(0)));
const resolveName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({ id, lowercase: true });
});
const sameNetworks = (observed, desired) => arrayEqualsUnordered(observed.map((n) => n.network), desired.map((n) => n.network));
/**
 * Endpoints are a deeply nested object whose server echo includes extra
 * `null`/default fields. Compare only the fields the caller declared.
 */
const sameEndpoints = (observed, desired) => {
    if (!observed)
        return false;
    const sameNetworkList = (o, d) => d === undefined ||
        arrayEqualsUnordered((o ?? []).map((n) => n.network), (d ?? []).map((n) => n.network));
    const sameToggle = (o, d) => d === undefined || (o ?? false) === d;
    return (sameToggle(observed.doh.enabled, desired.doh.enabled) &&
        sameToggle(observed.doh.requireToken, desired.doh.requireToken) &&
        sameNetworkList(observed.doh.networks, desired.doh.networks) &&
        sameToggle(observed.dot.enabled, desired.dot.enabled) &&
        sameNetworkList(observed.dot.networks, desired.dot.networks) &&
        sameToggle(observed.ipv4.enabled, desired.ipv4.enabled) &&
        sameToggle(observed.ipv6.enabled, desired.ipv6.enabled) &&
        sameNetworkList(observed.ipv6.networks, desired.ipv6.networks));
};
const toAttributes = (location, accountId) => ({
    locationId: location.id ?? "",
    accountId,
    name: location.name ?? "",
    clientDefault: location.clientDefault ?? false,
    ecsSupport: location.ecsSupport ?? false,
    dohSubdomain: location.dohSubdomain ?? undefined,
    ip: location.ip ?? undefined,
    ipv4Destination: location.ipv4Destination ?? undefined,
    dnsDestinationIpsId: location.dnsDestinationIpsId ?? undefined,
    networks: (location.networks ?? []).map((n) => ({ network: n.network })),
    createdAt: location.createdAt ?? undefined,
    updatedAt: location.updatedAt ?? undefined,
});
//# sourceMappingURL=Location.js.map