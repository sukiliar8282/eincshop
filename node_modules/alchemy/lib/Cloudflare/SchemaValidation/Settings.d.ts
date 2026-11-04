import * as schemaValidation from "@distilled.cloud/cloudflare/schema-validation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.SchemaValidation.Settings";
type TypeId = typeof TypeId;
/**
 * Mitigation action applied when a request does not conform to a schema:
 * `log` records the request, `block` denies it, `none` does nothing.
 */
export type MitigationAction = "none" | "log" | "block";
export interface SettingsProps {
    /**
     * Zone the settings belong to. Stable — changing the zone triggers a
     * replacement (the old zone's settings are restored to the values they
     * had before Alchemy managed them).
     */
    zoneId: string;
    /**
     * The default mitigation action used when a request does not conform to
     * an enabled schema: `log` records it, `block` denies it, `none` does
     * nothing. `log` and `block` may be plan-gated (API Shield entitlement).
     */
    validationDefaultMitigationAction: MitigationAction;
    /**
     * Zone-wide kill switch. When set to `"none"`, schema validation is
     * skipped entirely for every request, overriding both the zone default
     * and any per-operation settings. `null` clears the override.
     * @default null
     */
    validationOverrideMitigationAction?: "none" | null;
}
export interface SettingsAttributes {
    /** Zone the settings belong to. */
    zoneId: string;
    /** The default mitigation action for non-conforming requests. */
    validationDefaultMitigationAction: MitigationAction;
    /** The zone-wide override (`"none"` = validation disabled), if set. */
    validationOverrideMitigationAction: "none" | (string & {}) | null;
    /**
     * The default action the zone had before Alchemy first managed these
     * settings. Restored on destroy.
     */
    initialDefaultMitigationAction: MitigationAction;
    /**
     * The override the zone had before Alchemy first managed these settings.
     * Restored on destroy.
     */
    initialOverrideMitigationAction: "none" | (string & {}) | null;
}
export type Settings = Resource<TypeId, SettingsProps, SettingsAttributes, never, Providers>;
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
export declare const Settings: import("../../Resource.ts").ResourceClass<Settings>;
/**
 * Returns true if the given value is a Settings resource.
 */
export declare const isSettings: (value: unknown) => value is Settings;
export declare const SettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<Settings>, never, CloudflareEnvironment | schemaValidation.CloudflareOpContext>;
export {};
//# sourceMappingURL=Settings.d.ts.map