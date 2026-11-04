import * as emailRouting from "@distilled.cloud/cloudflare/email-routing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type Reference } from "../Zone/index.ts";
import type { Action } from "./Rule.ts";
declare const CatchAllTypeId: "Cloudflare.Email.CatchAll";
type CatchAllTypeId = typeof CatchAllTypeId;
export type CatchAllProps = {
    /**
     * Zone whose catch-all rule to manage. Accepts a zone id, a zone name
     * (`example.com`), or a `{ zoneId, name? }` object. Stable — the
     * catch-all rule is a per-zone singleton, so changing the zone triggers
     * a replacement (the old zone's catch-all is restored to the state it
     * had before Alchemy managed it).
     */
    zone: Reference;
    /**
     * Display name for the catch-all rule. When omitted, the current name
     * on the rule is left untouched.
     */
    name?: string;
    /**
     * Whether the catch-all rule is active.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Actions to take for emails that match no other routing rule
     * (`drop`, `forward` to verified destination addresses, or `worker`).
     * Matchers are fixed to `[{ type: "all" }]` by the API.
     */
    actions: Action[];
};
export type CatchAllAttributes = {
    /** Routing rule identifier of the zone's catch-all rule. */
    ruleId: string;
    /** Zone the catch-all rule belongs to. */
    zoneId: string;
    /** Display name of the catch-all rule. */
    name: string;
    /** Whether the catch-all rule is active. */
    enabled: boolean;
    /** Actions taken for emails that match no other routing rule. */
    actions: Action[];
    /**
     * The name the catch-all rule had before Alchemy first managed it.
     * Restored on destroy.
     */
    initialName: string;
    /**
     * Whether the catch-all rule was enabled before Alchemy first managed
     * it. Restored on destroy.
     */
    initialEnabled: boolean;
    /**
     * The actions the catch-all rule had before Alchemy first managed it.
     * Restored on destroy.
     */
    initialActions: Action[];
};
export type CatchAll = Resource<CatchAllTypeId, CatchAllProps, CatchAllAttributes, never, Providers>;
/**
 * The Cloudflare Email Routing catch-all rule for a zone.
 *
 * The catch-all rule handles every inbound email that no other routing
 * rule matched. It is a per-zone singleton — once Email Routing is enabled
 * the rule always exists (disabled, dropping mail, by default), so this
 * resource never creates or deletes anything physical. Reconcile `PUT`s the
 * desired configuration; destroy restores the configuration the rule had
 * before Alchemy first managed it.
 *
 * Email Routing must be enabled on the zone first (see
 * `Cloudflare.Email.Routing`), and `forward` actions require the destination
 * address to be verified (see `Cloudflare.Email.Address`).
 * ### Catching unmatched mail
 * **Example:** Forward everything else to a verified destination
 * ```typescript
 * const routing = yield* Cloudflare.Email.Routing("Routing", {
 *   zone: "example.com",
 * });
 *
 * yield* Cloudflare.Email.CatchAll("CatchAll", {
 *   zone: routing.zoneId,
 *   actions: [{ type: "forward", value: ["ops@example.com"] }],
 * });
 * ```
 *
 * **Example:** Silently drop unmatched mail
 * ```typescript
 * yield* Cloudflare.Email.CatchAll("DropTheRest", {
 *   zone: routing.zoneId,
 *   name: "drop unmatched",
 *   actions: [{ type: "drop" }],
 * });
 * ```
 *
 * ### Workers
 * **Example:** Hand unmatched mail to an email Worker
 * ```typescript
 * yield* Cloudflare.Email.CatchAll("CatchAllWorker", {
 *   zone: routing.zoneId,
 *   actions: [{ type: "worker", value: ["my-email-worker"] }],
 * });
 * ```
 *
 * @resource
 * @product Email
 * @category Email
 */
export declare const CatchAll: import("../../Resource.ts").ResourceClass<CatchAll>;
/**
 * Returns true if the given value is an CatchAll resource.
 */
export declare const isCatchAll: (value: unknown) => value is CatchAll;
export declare const CatchAllProvider: () => import("effect/Layer").Layer<Provider.Provider<CatchAll>, never, CloudflareEnvironment | emailRouting.CloudflareOpContext>;
export {};
//# sourceMappingURL=CatchAll.d.ts.map