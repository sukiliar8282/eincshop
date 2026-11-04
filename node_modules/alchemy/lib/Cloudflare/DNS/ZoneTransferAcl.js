import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.DNS.ZoneTransferAcl";
/**
 * A Secondary DNS zone-transfer ACL
 * (`/accounts/{account_id}/secondary_dns/acls`) — an account-wide
 * IPv4/IPv6 range that may receive NOTIFYs for secondary zones and from
 * which Cloudflare accepts AXFR/IXFR requests for outgoing transfers.
 *
 * Requires the Secondary DNS (zone transfer) entitlement on the
 * account. Both `name` and `ipRange` are mutable in place.
 * ### Creating an ACL
 * **Example:** Allow a primary nameserver range
 * ```typescript
 * const acl = yield* Cloudflare.DNS.ZoneTransferAcl("PrimaryNs", {
 *   ipRange: "192.0.2.48/28",
 * });
 * ```
 *
 * **Example:** ACL with an explicit name
 * ```typescript
 * const acl = yield* Cloudflare.DNS.ZoneTransferAcl("PrimaryNs", {
 *   name: "primary-nameservers",
 *   ipRange: "2001:db8::/64",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/zone-setups/zone-transfers/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export const ZoneTransferAcl = Resource(TypeId, {
    aliases: ["Cloudflare.Dns.ZoneTransferAcl"],
});
/**
 * Returns true if the given value is a ZoneTransferAcl resource.
 */
export const isZoneTransferAcl = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ZoneTransferAclProvider = () => Provider.succeed(ZoneTransferAcl, {
    stables: ["aclId", "accountId"],
    // Account-scoped collection: enumerate every ACL in the ambient
    // account, paginating exhaustively, and hydrate into the exact `read`
    // Attributes shape.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* dns.listZoneTransferAcls.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((acl) => ({
            aclId: acl.id,
            accountId,
            name: acl.name,
            ipRange: acl.ipRange,
        })))));
    }),
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (output !== undefined && output.accountId !== accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.aclId) {
            const observed = yield* getAcl(acct, output.aclId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the
        // deterministic physical name. ACLs carry no ownership markers,
        // so gate takeover behind adoption.
        const name = yield* createAclName(id, olds?.name);
        const match = yield* findByName(acct, name);
        return match ? Unowned(toAttributes(match, acct)) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createAclName(id, news.name);
        // Inputs are resolved to concrete values by Plan.
        const ipRange = news.ipRange;
        // Observe — the id cached on `output` is a hint, not a guarantee.
        const observed = output?.aclId
            ? yield* getAcl(output.accountId ?? accountId, output.aclId)
            : undefined;
        if (!observed) {
            // Ensure — greenfield (or out-of-band delete). Names are not
            // unique on Cloudflare's side, so there is no AlreadyExists
            // race to tolerate.
            const created = yield* dns.createZoneTransferAcl({
                accountId,
                name,
                ipRange,
            });
            return toAttributes(created, accountId);
        }
        // Sync — the update API is a PUT with the full body; skip the
        // call entirely when nothing differs. Cloudflare normalizes
        // `ipRange` to the network address, so compare against the
        // observed (normalized) value.
        if (observed.name === name && observed.ipRange === ipRange) {
            return toAttributes(observed, output?.accountId ?? accountId);
        }
        const updated = yield* dns.updateZoneTransferAcl({
            accountId: output?.accountId ?? accountId,
            aclId: observed.id,
            name,
            ipRange,
        });
        return toAttributes(updated, output?.accountId ?? accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* dns
            .deleteZoneTransferAcl({
            accountId: output.accountId,
            aclId: output.aclId,
        })
            .pipe(Effect.catchTag("AclNotFound", () => Effect.void));
    }),
});
/** Read an ACL by id, mapping "gone" (404) to `undefined`. */
const getAcl = (accountId, aclId) => dns
    .getZoneTransferAcl({ accountId, aclId })
    .pipe(Effect.catchTag("AclNotFound", () => Effect.succeed(undefined)));
/**
 * Find an ACL by exact name. Names are not unique on Cloudflare's side;
 * pick the lexicographically-first id for determinism.
 */
const findByName = (accountId, name) => dns.listZoneTransferAcls.items({ accountId }).pipe(Stream.filter((a) => a.name === name), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => a.id.localeCompare(b.id))
    .at(0)));
const createAclName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const toAttributes = (acl, accountId) => ({
    aclId: acl.id,
    accountId,
    name: acl.name,
    ipRange: acl.ipRange,
});
//# sourceMappingURL=ZoneTransferAcl.js.map