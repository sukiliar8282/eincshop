import * as botManagement from "@distilled.cloud/cloudflare/bot-management";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.BotManagement.BotManagement";
type TypeId = typeof TypeId;
/**
 * Action for AI scrapers and crawlers.
 */
export type AiBotsProtection = "block" | "disabled" | "only_on_ad_pages";
/**
 * Robots Access Control License variant.
 */
export type CfRobotsVariant = "off" | "policy_only";
/**
 * Super Bot Fight Mode action for definitely / likely automated traffic.
 */
export type SbfmAction = "allow" | "block" | "managed_challenge";
/**
 * Super Bot Fight Mode action for verified bot traffic.
 */
export type SbfmVerifiedBotsAction = "allow" | "block";
/**
 * The writable bot-management settings. Which fields the Cloudflare API
 * accepts depends on the zone's plan:
 *
 * - **Free** — `fightMode` (Bot Fight Mode)
 * - **Pro** — `sbfmDefinitelyAutomated`, `sbfmVerifiedBots`,
 *   `sbfmStaticResourceProtection`, `optimizeWordpress`
 * - **Business / Enterprise (without the Bot Management add-on)** — Pro
 *   fields plus `sbfmLikelyAutomated`
 * - **Enterprise with Bot Management add-on** — `autoUpdateModel`,
 *   `bmCookieEnabled`, `suppressSessionScore`
 *
 * `aiBotsProtection`, `crawlerProtection`, `contentBotsProtection`,
 * `cfRobotsVariant`, `enableJs`, and `isRobotsTxtManaged` are shared
 * across plans (though some accounts reject writes to a subset of them).
 *
 * Only fields you explicitly set are ever sent to Cloudflare — sending a
 * field outside the zone's plan shape fails validation server-side.
 */
export interface Settings {
    /**
     * Action for AI scrapers and crawlers ("block AI bots"). Note
     * `only_on_ad_pages` is not available for Enterprise zones.
     */
    aiBotsProtection?: AiBotsProtection;
    /**
     * Punish AI scrapers and crawlers via a link maze (AI Labyrinth).
     */
    crawlerProtection?: "enabled" | "disabled";
    /**
     * Block content bots — automated traffic with low bot scores, excluding
     * safe verified bot categories.
     */
    contentBotsProtection?: "block" | "disabled";
    /**
     * Robots Access Control License variant to use.
     */
    cfRobotsVariant?: CfRobotsVariant;
    /**
     * Use lightweight, invisible JavaScript detections to improve Bot
     * Management.
     */
    enableJs?: boolean;
    /**
     * Serve a Cloudflare-managed robots.txt. If the origin already serves
     * one, the managed file is prepended to it.
     */
    isRobotsTxtManaged?: boolean;
    /**
     * Bot Fight Mode (Free-plan zones). Mutually exclusive with the SBFM
     * fields below.
     */
    fightMode?: boolean;
    /**
     * Super Bot Fight Mode action for definitely automated requests
     * (Pro and above).
     */
    sbfmDefinitelyAutomated?: SbfmAction;
    /**
     * Super Bot Fight Mode action for likely automated requests
     * (Business and above).
     */
    sbfmLikelyAutomated?: SbfmAction;
    /**
     * Super Bot Fight Mode action for verified bot requests (Pro and above).
     */
    sbfmVerifiedBots?: SbfmVerifiedBotsAction;
    /**
     * Super Bot Fight Mode static resource protection (Pro and above).
     * Enabling can challenge legitimate static-asset consumers.
     */
    sbfmStaticResourceProtection?: boolean;
    /**
     * Optimize Super Bot Fight Mode protections for WordPress
     * (Pro and above).
     */
    optimizeWordpress?: boolean;
    /**
     * Automatically update to the newest bot detection model (Enterprise
     * Bot Management add-on).
     */
    autoUpdateModel?: boolean;
    /**
     * Whether the bot management cookie may be placed on end-user devices
     * (Enterprise Bot Management add-on).
     * @default true
     */
    bmCookieEnabled?: boolean;
    /**
     * Disable tracking the highest bot score for a session in the Bot
     * Management cookie (Enterprise Bot Management add-on).
     * @default false
     */
    suppressSessionScore?: boolean;
}
export interface Props extends Settings {
    /**
     * Zone whose bot-management configuration is managed. Stable — changing
     * the zone triggers a replacement (which simply re-adopts the new
     * zone's singleton and restores the old zone's snapshot).
     */
    zoneId: string;
}
export interface Attributes extends Settings {
    /**
     * Zone that owns this bot-management configuration.
     */
    zoneId: string;
    /**
     * Whether the zone is running the latest ML model (read-only,
     * Enterprise Bot Management add-on).
     */
    usingLatestModel: boolean | undefined;
    /**
     * Snapshot of the writable settings observed **before** this resource
     * first wrote to the zone. `delete` restores these values for the
     * fields this resource managed.
     */
    initialSettings: Settings;
}
export type BotManagement = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * The bot-management configuration of a Cloudflare zone — a zone-scoped
 * **singleton**: every zone always has exactly one bot-management config,
 * so there is no create or delete on the Cloudflare side. Reconciling this
 * resource adopts the singleton and PUTs only the fields you explicitly
 * set, leaving every other field untouched.
 *
 * Which fields are writable depends on the zone's plan (see
 * {@link Settings}). Setting a field outside the zone's plan
 * shape fails validation on Cloudflare's side.
 *
 * On destroy, the resource restores the fields it managed to the values
 * observed before its first write (the `initialSettings` snapshot).
 * Fields that were never set by this resource are not touched. Settings
 * changed out-of-band after the snapshot was taken, or fields the zone's
 * plan no longer accepts, cannot be restored.
 * ### Super Bot Fight Mode
 * **Example:** Challenge definitely automated traffic (Pro and above)
 * ```typescript
 * yield* Cloudflare.BotManagement.BotManagement("Bots", {
 *   zoneId: zone.zoneId,
 *   sbfmDefinitelyAutomated: "managed_challenge",
 *   sbfmVerifiedBots: "allow",
 * });
 * ```
 *
 * **Example:** Static resource protection and WordPress optimization
 * ```typescript
 * yield* Cloudflare.BotManagement.BotManagement("Bots", {
 *   zoneId: zone.zoneId,
 *   sbfmDefinitelyAutomated: "block",
 *   sbfmStaticResourceProtection: true,
 *   optimizeWordpress: true,
 * });
 * ```
 *
 * ### AI bot protection
 * **Example:** Block AI scrapers and crawlers
 * ```typescript
 * yield* Cloudflare.BotManagement.BotManagement("Bots", {
 *   zoneId: zone.zoneId,
 *   aiBotsProtection: "block",
 *   crawlerProtection: "enabled",
 * });
 * ```
 *
 * ### Bot Fight Mode (Free plans)
 * **Example:** Enable Bot Fight Mode
 * ```typescript
 * yield* Cloudflare.BotManagement.BotManagement("Bots", {
 *   zoneId: zone.zoneId,
 *   fightMode: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/bots/
 *
 * @resource
 * @product Bot Management
 * @category Application Security
 */
export declare const BotManagement: import("../../Resource.ts").ResourceClass<BotManagement>;
/**
 * Returns true if the given value is a BotManagement resource.
 */
export declare const isBotManagement: (value: unknown) => value is BotManagement;
export declare const BotManagementProvider: () => import("effect/Layer").Layer<Provider.Provider<BotManagement>, never, CloudflareEnvironment | botManagement.CloudflareOpContext>;
export {};
//# sourceMappingURL=BotManagement.d.ts.map