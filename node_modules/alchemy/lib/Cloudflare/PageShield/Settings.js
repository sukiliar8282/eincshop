import * as pageShield from "@distilled.cloud/cloudflare/page-shield";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.PageShield.Settings";
/**
 * The Page Shield configuration of a Cloudflare zone
 * (`/zones/{zone_id}/page_shield`).
 *
 * Page Shield monitors the JavaScript and connections loaded by your
 * visitors' browsers to detect supply-chain attacks (e.g. Magecart). The
 * configuration is a zone **singleton** — it always exists (default
 * disabled), so this resource never creates or deletes anything physical.
 * Reconcile PUTs the configuration when the observed flags differ from the
 * desired ones; destroy restores the flags the zone had before Alchemy
 * first managed them.
 *
 * Script/connection *monitoring data* requires a Business or Enterprise
 * zone plan, but the configuration endpoints themselves accept reads and
 * `enabled` writes on lower plans. Setting `useConnectionUrlPath: true`
 * or `useCloudflareReportingEndpoint: false` on a non-entitled zone fails
 * with the typed `NotEntitled` error.
 *
 * Only one `Settings` resource per zone makes sense — two
 * instances managing the same zone would fight over the singleton.
 * ### Managing Page Shield
 * **Example:** Enable Page Shield on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Analyze connection URL paths too
 * ```typescript
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 *   useConnectionUrlPath: true,
 * });
 * ```
 *
 * **Example:** Report CSP violations to the zone instead of Cloudflare
 * ```typescript
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 *   useCloudflareReportingEndpoint: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/page-shield/
 *
 * @resource
 * @product Page Shield
 * @category Application Security
 */
export const Settings = Resource(TypeId);
/**
 * Returns true if the given value is a Settings resource.
 */
export const isSettings = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
const desiredSettings = (props) => ({
    enabled: props.enabled ?? true,
    useCloudflareReportingEndpoint: props.useCloudflareReportingEndpoint ?? true,
    useConnectionUrlPath: props.useConnectionUrlPath ?? false,
});
export const SettingsProvider = () => Provider.succeed(Settings, {
    nuke: { singleton: true },
    stables: [
        "zoneId",
        "initialEnabled",
        "initialUseCloudflareReportingEndpoint",
        "initialUseConnectionUrlPath",
    ],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for this zone singleton — enumerate every
        // zone in the account and read its configuration (every zone has
        // one, defaulting to disabled).
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => pageShield.getPageShield({ zoneId }).pipe(
        // On a cold enumeration the observed flags are the zone's
        // current state and double as the `initial*` baseline.
        Effect.map((observed) => toAttributes(zoneId, observed, observed)), 
        // Zones the scoped token can't read (partial / restricted)
        // reject with the typed `Forbidden` error; skip them.
        Effect.catchTag("Forbidden", () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        // zoneId is the singleton's identity — moving the resource to a
        // different zone replaces it (restoring the old zone on delete).
        if (output !== undefined && output.zoneId !== news.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (!zoneId)
            return undefined;
        const observed = yield* pageShield.getPageShield({ zoneId });
        // The configuration is a singleton that always exists with a
        // Cloudflare default — there is nothing to "own", so a cold read
        // adopts freely (never `Unowned`). The observed flags at adoption
        // time become the `initial*` values restored on destroy.
        const initial = output !== undefined
            ? {
                enabled: output.initialEnabled,
                useCloudflareReportingEndpoint: output.initialUseCloudflareReportingEndpoint,
                useConnectionUrlPath: output.initialUseConnectionUrlPath,
            }
            : observed;
        return toAttributes(zoneId, observed, initial);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the configuration always exists; read its live state.
        const observed = yield* pageShield.getPageShield({ zoneId });
        // 2. Capture — the pre-management flags, restored on destroy.
        //    `output` (including an adoption read) already carries them;
        //    otherwise this is our first touch and the observed flags are
        //    the zone's original.
        const initial = output !== undefined
            ? {
                enabled: output.initialEnabled,
                useCloudflareReportingEndpoint: output.initialUseCloudflareReportingEndpoint,
                useConnectionUrlPath: output.initialUseConnectionUrlPath,
            }
            : observed;
        // 3. Sync — PUT the full desired body only when something differs.
        const desired = desiredSettings(news);
        if (sameSettings(observed, desired)) {
            return toAttributes(zoneId, observed, initial);
        }
        const updated = yield* pageShield.putPageShield({
            zoneId,
            ...desired,
        });
        return toAttributes(zoneId, updated, initial);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { zoneId } = output;
        const initial = {
            enabled: output.initialEnabled,
            useCloudflareReportingEndpoint: output.initialUseCloudflareReportingEndpoint,
            useConnectionUrlPath: output.initialUseConnectionUrlPath,
        };
        // Observe, then restore the pre-management flags; skip the call
        // when they already match (idempotent re-delete after a crash).
        const observed = yield* pageShield.getPageShield({ zoneId });
        if (sameSettings(observed, initial))
            return;
        yield* pageShield.putPageShield({ zoneId, ...initial });
    }),
});
const sameSettings = (a, b) => a.enabled === b.enabled &&
    a.useCloudflareReportingEndpoint === b.useCloudflareReportingEndpoint &&
    a.useConnectionUrlPath === b.useConnectionUrlPath;
const toAttributes = (zoneId, observed, initial) => ({
    zoneId,
    enabled: observed.enabled,
    useCloudflareReportingEndpoint: observed.useCloudflareReportingEndpoint,
    useConnectionUrlPath: observed.useConnectionUrlPath,
    updatedAt: observed.updatedAt,
    initialEnabled: initial.enabled,
    initialUseCloudflareReportingEndpoint: initial.useCloudflareReportingEndpoint,
    initialUseConnectionUrlPath: initial.useConnectionUrlPath,
});
//# sourceMappingURL=Settings.js.map