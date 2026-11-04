import * as waitingRooms from "@distilled.cloud/cloudflare/waiting-rooms";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.WaitingRoom.WaitingRoom";
type TypeId = typeof TypeId;
/**
 * Queueing method used by a waiting room. Changing this from the default
 * `fifo` requires the Waiting Room Advanced subscription.
 */
export type QueueingMethod = "fifo" | "random" | "passthrough" | "reject";
/**
 * HTTP status code returned to a user while in the queue.
 */
export type QueueingStatusCode = 200 | 202 | 429;
/**
 * Which Turnstile widget type the waiting room uses for detecting bot
 * traffic.
 */
export type TurnstileMode = "off" | "invisible" | "visible_non_interactive" | "visible_managed";
/**
 * What to do when Turnstile detects a bot: `log` only records it in
 * analytics; `infinite_queue` sends the bot to a queue that never lets it
 * through.
 */
export type TurnstileAction = "log" | "infinite_queue";
/**
 * Cookie attributes for the waiting room cookie (`__cf_waitingroom`).
 */
export interface CookieAttributes {
    /**
     * SameSite attribute of the waiting room cookie.
     * @default "auto"
     */
    samesite?: "auto" | "lax" | "none" | "strict";
    /**
     * Secure attribute of the waiting room cookie.
     * @default "auto"
     */
    secure?: "auto" | "always" | "never";
}
/**
 * An additional hostname + path combination the waiting room is applied to.
 * Only available with the Waiting Room Advanced subscription.
 */
export interface Route {
    /**
     * Hostname (no scheme, no wildcards).
     */
    host?: string;
    /**
     * Path within the host. There is an implied wildcard at the end.
     * @default "/"
     */
    path?: string;
}
export interface Props {
    /**
     * Zone the waiting room belongs to. Stable — changing the zone triggers
     * a replacement.
     */
    zoneId: string;
    /**
     * A unique name to identify the waiting room. Only alphanumeric
     * characters, hyphens, and underscores are allowed. If omitted, a unique
     * name is generated from the app, stage, and logical ID. Mutable.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The host name to which the waiting room will be applied (no
     * wildcards). Do not include the scheme. The host and path combination
     * must be unique per zone. Mutable.
     */
    host: string;
    /**
     * The path within the host to enable the waiting room on, including all
     * subpaths. Mutable.
     * @default "/"
     */
    path?: string;
    /**
     * Total number of active user sessions on the route at a point in time
     * (minimum 200). Mutable.
     */
    totalActiveUsers: number;
    /**
     * Number of new users that will be let into the route every minute
     * (minimum 200). Mutable.
     */
    newUsersPerMinute: number;
    /**
     * A note with more details about the waiting room. Mutable.
     * @default ""
     */
    description?: string;
    /**
     * Lifetime of a cookie (in minutes, 1–30) set for users who get access
     * to the route. Mutable.
     * @default 5
     */
    sessionDuration?: number;
    /**
     * Disables automatic renewal of session cookies (Waiting Room Advanced
     * only). Mutable.
     * @default false
     */
    disableSessionRenewal?: boolean;
    /**
     * If `true`, all traffic to the route is sent to the waiting room.
     * Mutable.
     * @default false
     */
    queueAll?: boolean;
    /**
     * Queueing method. Non-`fifo` methods require the Waiting Room Advanced
     * subscription. Mutable.
     * @default "fifo"
     */
    queueingMethod?: QueueingMethod;
    /**
     * HTTP status code returned to a user while in the queue. Mutable.
     * @default "200"
     */
    queueingStatusCode?: QueueingStatusCode;
    /**
     * Suspends the waiting room — traffic flows straight to the route.
     * Mutable.
     * @default false
     */
    suspended?: boolean;
    /**
     * If `true`, requests with `Accept: application/json` receive a JSON
     * response describing the queue (Waiting Room Advanced only). Mutable.
     * @default false
     */
    jsonResponseEnabled?: boolean;
    /**
     * Custom HTML template rendered at the edge instead of the default
     * waiting room page (Waiting Room Advanced only). Mutable.
     */
    customPageHtml?: string;
    /**
     * Language of the default page template. Mutable.
     * @default "en-US"
     */
    defaultTemplateLanguage?: string;
    /**
     * Appends `_` + this suffix to the waiting room cookie name. Mutable.
     */
    cookieSuffix?: string;
    /**
     * Cookie attributes for the waiting room cookie. Mutable.
     */
    cookieAttributes?: CookieAttributes;
    /**
     * Additional hostname/path combinations the waiting room applies to
     * (Waiting Room Advanced only). Mutable.
     */
    additionalRoutes?: Route[];
    /**
     * Enabled origin commands (currently only `revoke`). Mutable.
     * @default []
     */
    enabledOriginCommands?: "revoke"[];
    /**
     * Turnstile widget type used for detecting bot traffic. Mutable.
     * @default "off"
     */
    turnstileMode?: TurnstileMode;
    /**
     * Action taken when Turnstile detects a bot. Mutable.
     * @default "log"
     */
    turnstileAction?: TurnstileAction;
}
export interface Attributes {
    /** Cloudflare-assigned identifier of the waiting room. */
    waitingRoomId: string;
    /** Zone the waiting room belongs to. */
    zoneId: string;
    /** The waiting room's unique name. */
    name: string;
    /** Host the waiting room is applied to. */
    host: string;
    /** Path within the host the waiting room is enabled on. */
    path: string;
    /** Total number of active user sessions allowed on the route. */
    totalActiveUsers: number;
    /** Number of new users let into the route per minute. */
    newUsersPerMinute: number;
    /** Note describing the waiting room. */
    description: string;
    /** Session cookie lifetime in minutes. */
    sessionDuration: number;
    /** Whether all traffic is sent to the waiting room. */
    queueAll: boolean;
    /** Queueing method in effect. */
    queueingMethod: QueueingMethod;
    /** HTTP status code returned to queued users. */
    queueingStatusCode: QueueingStatusCode;
    /** Whether the waiting room is suspended. */
    suspended: boolean;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type WaitingRoom = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Cloudflare Waiting Room — places visitors in a virtual queue when
 * traffic to a host + path exceeds the configured thresholds, protecting
 * the origin from overload.
 *
 * Waiting Rooms require a Business or Enterprise zone plan; on unentitled
 * zones every write fails with the typed `ZoneNotEntitled` error
 * (Cloudflare code 1034). Several props (`additionalRoutes`,
 * `customPageHtml`, non-`fifo` `queueingMethod`, `disableSessionRenewal`,
 * `jsonResponseEnabled`) additionally require the Waiting Room Advanced
 * subscription.
 *
 * Everything except the zone is mutable in place via a full-body PUT.
 * Waiting rooms carry no ownership markers, so when state is lost `read`
 * matches by name and reports the room as `Unowned` — the engine refuses
 * to take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Creating a Waiting Room
 * **Example:** Basic waiting room on a host
 * ```typescript
 * const room = yield* Cloudflare.WaitingRoom.WaitingRoom("checkout", {
 *   zoneId: zone.zoneId,
 *   host: "shop.example.com",
 *   path: "/checkout",
 *   totalActiveUsers: 200,
 *   newUsersPerMinute: 200,
 * });
 * ```
 *
 * **Example:** Queue all traffic during an incident
 * ```typescript
 * yield* Cloudflare.WaitingRoom.WaitingRoom("incident-gate", {
 *   zoneId: zone.zoneId,
 *   host: "example.com",
 *   totalActiveUsers: 500,
 *   newUsersPerMinute: 200,
 *   queueAll: true,
 *   queueingStatusCode: 429,
 * });
 * ```
 *
 * ### Customizing behavior
 * **Example:** Short sessions with a custom cookie suffix
 * ```typescript
 * yield* Cloudflare.WaitingRoom.WaitingRoom("flash-sale", {
 *   zoneId: zone.zoneId,
 *   host: "example.com",
 *   path: "/sale",
 *   totalActiveUsers: 1000,
 *   newUsersPerMinute: 500,
 *   sessionDuration: 1,
 *   cookieSuffix: "sale",
 *   defaultTemplateLanguage: "de-DE",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waiting-room/
 *
 * @resource
 * @product Waiting Rooms
 * @category Performance & Reliability
 */
export declare const WaitingRoom: import("../../Resource.ts").ResourceClass<WaitingRoom>;
/**
 * Returns true if the given value is a WaitingRoom resource.
 */
export declare const isWaitingRoom: (value: unknown) => value is WaitingRoom;
export declare const WaitingRoomProvider: () => import("effect/Layer").Layer<Provider.Provider<WaitingRoom>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | waitingRooms.CloudflareOpContext>;
export {};
//# sourceMappingURL=WaitingRoom.d.ts.map