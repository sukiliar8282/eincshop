import * as emailSending from "@distilled.cloud/cloudflare/email-sending";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const SendingSubdomainTypeId = "Cloudflare.Email.SendingSubdomain";
/**
 * Registers a Cloudflare Email Sending subdomain on a zone, enabling the
 * account to send transactional email from addresses on that subdomain.
 *
 * Creating the subdomain provisions DKIM, SPF, and return-path
 * configuration; for zones on Cloudflare DNS the required DNS records are
 * created automatically and `enabled` flips to `true` once they validate
 * (usually immediately).
 *
 * The resource is existence-only: the API offers create, get, list, and
 * delete but no update, so changing `name` or `zoneId` triggers a
 * replacement.
 *
 * Safety: sending subdomains carry no ownership markers. When there is no
 * prior state, `read` scans the zone for an existing subdomain with the
 * same name and reports it as `Unowned`, so the engine refuses to take it
 * over unless `--adopt` (or `adopt(true)`) is set.
 * ### Registering a sending subdomain
 * **Example:** Send mail from `mail.example.com`
 * ```typescript
 * const sending = yield* Cloudflare.Email.SendingSubdomain("Mail", {
 *   zoneId: zone.zoneId,
 *   name: "mail.example.com",
 * });
 * // sending.enabled — true once DNS records validated
 * // sending.dkimSelector / sending.returnPathDomain — provisioned config
 * ```
 *
 * ### Externally-hosted zones
 * **Example:** Look up the DNS records to create manually
 * ```typescript
 * import * as emailSending from "@distilled.cloud/cloudflare/email-sending";
 *
 * // For zones not on Cloudflare DNS, fetch the expected records and add
 * // them at your DNS host; `enabled` flips to true once they validate.
 * const records = yield* emailSending.getSubdomainDns.items({
 *   zoneId: sending.zoneId,
 *   subdomainId: sending.subdomainId,
 * }).pipe(Stream.runCollect);
 * ```
 *
 * @see https://developers.cloudflare.com/email-sending/
 *
 * @resource
 * @product Email
 * @category Email
 */
export const SendingSubdomain = Resource(SendingSubdomainTypeId, { aliases: ["Cloudflare.EmailSendingSubdomain"] });
/**
 * Returns true if the given value is an SendingSubdomain resource.
 */
export const isSendingSubdomain = (value) => Predicate.hasProperty(value, "Type") && value.Type === SendingSubdomainTypeId;
export const SendingSubdomainProvider = () => Provider.succeed(SendingSubdomain, {
    // No update API exists — every attribute is stable across updates.
    stables: [
        "subdomainId",
        "zoneId",
        "name",
        "dkimSelector",
        "returnPathDomain",
        "created",
    ],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Sending subdomains are zone-scoped (`/zones/{id}/email/sending/
        // subdomains`) with no account-wide list — enumerate every zone and
        // list its subdomains, then flatten.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => emailSending.listSubdomains.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((subdomain) => toAttributes(subdomain, zone.id)))), 
        // Email Sending may be unavailable / plan-gated on a zone —
        // skip those zones rather than fail the whole enumeration.
        Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // The API has no update operation — any prop change is a replace.
        if (o.name !== undefined && o.name !== n.name) {
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
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (!zoneId)
            return undefined;
        // Owned path: refresh by our persisted subdomain id.
        if (output?.subdomainId) {
            const observed = yield* getSubdomain(zoneId, output.subdomainId);
            if (observed)
                return toAttributes(observed, zoneId);
        }
        // Adoption path: a subdomain with this name may already exist on the
        // zone. Sending subdomains carry no ownership markers, so we cannot
        // prove we created it — brand it `Unowned` so the engine refuses to
        // take over unless `adopt` is set.
        const name = output?.name ?? olds?.name;
        if (name) {
            const observed = yield* findByName(zoneId, name);
            if (observed)
                return Unowned(toAttributes(observed, zoneId));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the subdomain id cached on `output` is a hint, not a
        //    guarantee: a missing subdomain falls through to the name scan
        //    and then to create.
        let observed = output?.subdomainId
            ? yield* getSubdomain(zoneId, output.subdomainId)
            : undefined;
        // 2. Fall back to scanning the zone for a name match. Ownership has
        //    already been verified upstream — `read` reports existing
        //    subdomains as `Unowned` and the engine gates takeover behind
        //    the adopt policy before reconcile ever runs.
        if (!observed) {
            observed = yield* findByName(zoneId, news.name);
        }
        // 3. Ensure — create when missing. A concurrent create surfaces as
        //    `SendingSubdomainAlreadyExists` (Cloudflare code 2040):
        //    converge by re-scanning for the subdomain that won the race.
        if (!observed) {
            observed = yield* emailSending
                .createSubdomain({ zoneId, name: news.name })
                .pipe(Effect.catchTag("SendingSubdomainAlreadyExists", (error) => findByName(zoneId, news.name).pipe(Effect.flatMap((existing) => existing ? Effect.succeed(existing) : Effect.fail(error)))));
        }
        // 4. Sync — nothing is mutable; the only convergence left is DNS
        //    validation. Cloudflare auto-creates the records on CF-hosted
        //    zones but validation is eventually consistent: poll briefly
        //    for `enabled` to flip, and return the observed state either
        //    way (an externally-hosted zone stays disabled until the user
        //    adds the records — that is not a deploy failure).
        const ensured = observed;
        const final = ensured.enabled
            ? ensured
            : yield* getSubdomain(zoneId, ensured.tag).pipe(Effect.map((latest) => latest ?? ensured), Effect.repeat({
                schedule: Schedule.spaced("5 seconds"),
                until: (latest) => latest.enabled,
                times: 12,
            }));
        // 5. Return.
        return toAttributes(final, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Idempotent — an already-gone subdomain answers with Cloudflare
        // code 2033 (`SendingSubdomainNotFound`), which is success here.
        yield* emailSending
            .deleteSubdomain({
            zoneId: output.zoneId,
            subdomainId: output.subdomainId,
        })
            .pipe(Effect.catchTag("SendingSubdomainNotFound", () => Effect.void));
    }),
});
/**
 * Read a sending subdomain by id, mapping "gone" (`SendingSubdomainNotFound`,
 * Cloudflare error code 2033) to `undefined`.
 */
const getSubdomain = (zoneId, subdomainId) => emailSending.getSubdomain({ zoneId, subdomainId }).pipe(Effect.map((subdomain) => subdomain), Effect.catchTag("SendingSubdomainNotFound", () => Effect.succeed(undefined)));
/**
 * Find a sending subdomain by exact name within the zone. The name is the
 * subdomain's identity — Cloudflare rejects duplicates with code 2040 — so
 * at most one can match.
 */
const findByName = (zoneId, name) => emailSending.listSubdomains.items({ zoneId }).pipe(Stream.filter((subdomain) => subdomain.name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
const toAttributes = (subdomain, zoneId) => ({
    subdomainId: subdomain.tag,
    zoneId,
    name: subdomain.name,
    enabled: subdomain.enabled,
    dkimSelector: subdomain.dkimSelector ?? undefined,
    returnPathDomain: subdomain.returnPathDomain ?? undefined,
    created: subdomain.created ?? undefined,
    modified: subdomain.modified ?? undefined,
});
//# sourceMappingURL=SendingSubdomain.js.map