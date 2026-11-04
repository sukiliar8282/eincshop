import * as waitingRooms from "@distilled.cloud/cloudflare/waiting-rooms";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.WaitingRoom.Settings";
type TypeId = typeof TypeId;
export type SettingsProps = {
    /**
     * Zone whose waiting room settings are managed. Stable — changing the
     * zone triggers a replacement (the old zone's settings are restored to
     * the value they had before Alchemy managed them).
     */
    zoneId: string;
    /**
     * Whether to allow verified search engine crawlers to bypass all waiting
     * rooms on this zone. Enabling the bypass requires the Waiting Room
     * Advanced subscription. Mutable.
     * @default false
     */
    searchEngineCrawlerBypass?: boolean;
};
export type SettingsAttributes = {
    /** Zone the settings belong to. */
    zoneId: string;
    /** Whether verified search engine crawlers bypass all waiting rooms. */
    searchEngineCrawlerBypass: boolean;
    /**
     * The value the setting had before Alchemy first managed it. Restored on
     * destroy, so deleting the resource puts the zone back the way it was
     * found.
     */
    initialSearchEngineCrawlerBypass: boolean;
};
export type Settings = Resource<TypeId, SettingsProps, SettingsAttributes, never, Providers>;
/**
 * Zone-wide Cloudflare Waiting Room settings
 * (`/zones/{zone_id}/waiting_rooms/settings`).
 *
 * The settings object is a zone singleton — it always exists with
 * Cloudflare defaults, so this resource never creates or deletes anything
 * physical. Reconcile PUTs the settings when the observed value differs
 * from the desired one; destroy restores the value the zone had before
 * Alchemy first managed it.
 *
 * Writes are plan-gated: on zones without a Waiting Rooms entitlement
 * (Business/Enterprise) every PUT fails with the typed `ZoneNotEntitled`
 * error (Cloudflare code 1034). Reads work on every plan, and a no-op
 * reconcile (desired equals observed) skips the API call entirely.
 * ### Managing settings
 * **Example:** Let search engine crawlers bypass waiting rooms
 * ```typescript
 * yield* Cloudflare.WaitingRoom.Settings("CrawlerBypass", {
 *   zoneId: zone.zoneId,
 *   searchEngineCrawlerBypass: true,
 * });
 * ```
 *
 * **Example:** Pin the settings to their defaults
 * ```typescript
 * yield* Cloudflare.WaitingRoom.Settings("Defaults", {
 *   zoneId: zone.zoneId,
 *   searchEngineCrawlerBypass: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waiting-room/
 *
 * @resource
 * @product Waiting Rooms
 * @category Performance & Reliability
 */
export declare const Settings: import("../../Resource.ts").ResourceClass<Settings>;
/**
 * Returns true if the given value is a Settings resource.
 */
export declare const isSettings: (value: unknown) => value is Settings;
export declare const SettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<Settings>, never, CloudflareEnvironment | waitingRooms.CloudflareOpContext>;
export {};
//# sourceMappingURL=Settings.d.ts.map