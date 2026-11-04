import * as schemaValidation from "@distilled.cloud/cloudflare/schema-validation";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.SchemaValidation.Settings";
/**
 * Zone-level schema validation settings
 * (`/zones/{zone_id}/schema_validation/settings`) — the default mitigation
 * action applied to requests that do not conform to an enabled schema, plus
 * an optional zone-wide kill switch.
 *
 * The settings are a zone singleton: they always exist (Cloudflare default
 * is `none`), so this resource never creates or deletes anything physical.
 * Reconcile PUTs the desired state when the observed state differs; destroy
 * restores the values the zone had before Alchemy first managed them.
 *
 * The `log` action is plan-gated (API Shield entitlement) on some zones —
 * setting it there fails with the typed `UnentitledMitigationAction` error.
 * ### Managing the zone default
 * **Example:** Block non-conforming requests
 * ```typescript
 * yield* Cloudflare.SchemaValidation.Settings("Validation", {
 *   zoneId: zone.zoneId,
 *   validationDefaultMitigationAction: "block",
 * });
 * ```
 *
 * ### Kill switch
 * **Example:** Temporarily disable validation zone-wide
 * ```typescript
 * yield* Cloudflare.SchemaValidation.Settings("Validation", {
 *   zoneId: zone.zoneId,
 *   validationDefaultMitigationAction: "block",
 *   // overrides every schema and per-operation setting:
 *   validationOverrideMitigationAction: "none",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/schema-validation/
 *
 * @resource
 * @product Schema Validation
 * @category Application Security
 */
export const Settings = Resource(TypeId);
/**
 * Returns true if the given value is a Settings resource.
 */
export const isSettings = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const SettingsProvider = () => Provider.succeed(Settings, {
    nuke: { singleton: true },
    stables: [
        "zoneId",
        "initialDefaultMitigationAction",
        "initialOverrideMitigationAction",
    ],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for this zone singleton — enumerate every
        // zone in the account and read its setting (every zone has one,
        // defaulting to `none`).
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => schemaValidation.getSetting({ zoneId }).pipe(
        // A cold read adopts freely; the observed state is the
        // initial state (nothing has been managed yet).
        Effect.map((observed) => toAttributes(zoneId, observed, observedState(observed))), 
        // A scoped token may lack access to some zones; skip them.
        Effect.catchTag("Forbidden", () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; compare only once both sides are concrete.
        const oldZoneId = output?.zoneId ?? (typeof o.zoneId === "string" ? o.zoneId : undefined);
        if (oldZoneId !== undefined &&
            typeof n.zoneId === "string" &&
            oldZoneId !== n.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (zoneId === undefined)
            return undefined;
        const observed = yield* schemaValidation.getSetting({ zoneId });
        // The settings are a singleton that always exists with a Cloudflare
        // default — there is nothing to "own", so a cold read adopts freely
        // (never `Unowned`). The observed values at adoption time become the
        // initial values restored on destroy.
        return toAttributes(zoneId, observed, output !== undefined
            ? {
                defaultAction: output.initialDefaultMitigationAction,
                overrideAction: output.initialOverrideMitigationAction,
            }
            : observedState(observed));
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const desired = {
            defaultAction: news.validationDefaultMitigationAction,
            overrideAction: news.validationOverrideMitigationAction ?? null,
        };
        // 1. Observe — the settings always exist; read the live state.
        const observed = yield* schemaValidation.getSetting({ zoneId });
        // 2. Capture — the pre-management values, restored on destroy.
        //    `output` (including an adoption read) already carries them;
        //    otherwise this is our first touch and the observed state is the
        //    zone's original.
        const initial = output !== undefined
            ? {
                defaultAction: output.initialDefaultMitigationAction,
                overrideAction: output.initialOverrideMitigationAction,
            }
            : observedState(observed);
        // 3. Sync — PUT the full desired state only when it differs.
        const current = observedState(observed);
        if (current.defaultAction === desired.defaultAction &&
            current.overrideAction === desired.overrideAction) {
            return toAttributes(zoneId, observed, initial);
        }
        const updated = yield* schemaValidation.putSetting({
            zoneId,
            validationDefaultMitigationAction: desired.defaultAction,
            validationOverrideMitigationAction: desired.overrideAction,
        });
        return toAttributes(zoneId, updated, initial);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { zoneId, initialDefaultMitigationAction, initialOverrideMitigationAction, } = output;
        // The singleton cannot be deleted — restore the pre-management
        // state. Skip the call when it already matches (idempotent re-delete
        // after a crashed run).
        const observed = yield* schemaValidation.getSetting({ zoneId });
        const current = observedState(observed);
        if (current.defaultAction === initialDefaultMitigationAction &&
            current.overrideAction === initialOverrideMitigationAction) {
            return;
        }
        yield* schemaValidation.putSetting({
            zoneId,
            validationDefaultMitigationAction: initialDefaultMitigationAction,
            validationOverrideMitigationAction: initialOverrideMitigationAction,
        });
        yield* Effect.logInfo("Cloudflare schema validation settings are a zone singleton and cannot be deleted; restored the pre-management values instead.");
    }),
});
const observedState = (setting) => ({
    // Distilled widens the generated enum to an open union (`string & {}`).
    defaultAction: setting.validationDefaultMitigationAction,
    overrideAction: setting.validationOverrideMitigationAction ?? null,
});
const toAttributes = (zoneId, setting, initial) => {
    const current = observedState(setting);
    return {
        zoneId,
        validationDefaultMitigationAction: current.defaultAction,
        validationOverrideMitigationAction: current.overrideAction,
        initialDefaultMitigationAction: initial.defaultAction,
        initialOverrideMitigationAction: initial.overrideAction,
    };
};
//# sourceMappingURL=Settings.js.map