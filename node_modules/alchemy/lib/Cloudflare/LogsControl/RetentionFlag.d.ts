import * as logs from "@distilled.cloud/cloudflare/logs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Logs.RetentionFlag";
type TypeId = typeof TypeId;
export type LogsRetentionFlagProps = {
    /**
     * Zone whose Logpull retention flag is managed. The flag is a zone-level
     * singleton, so the zone is the resource's identity — changing it
     * triggers a replacement (the old zone's flag is restored to the value
     * it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Logpull log retention is enabled for the zone. Mutable —
     * re-posted in place.
     */
    flag: boolean;
};
export type LogsRetentionFlagAttributes = {
    /** Zone the retention flag belongs to. */
    zoneId: string;
    /** Whether Logpull log retention is enabled. */
    flag: boolean;
    /**
     * The value the flag had before Alchemy first managed it. Restored on
     * destroy, so deleting the resource puts the zone back the way it was
     * found.
     */
    initialFlag: boolean;
};
export type LogsRetentionFlag = Resource<TypeId, LogsRetentionFlagProps, LogsRetentionFlagAttributes, never, Providers>;
/**
 * The zone-level Logpull retention flag
 * (`/zones/{zone_id}/logs/control/retention/flag`) pinned to a desired
 * value.
 *
 * The flag is a singleton that always exists on every zone, so this
 * resource never creates or deletes anything physical. Reconcile re-posts
 * the flag when the observed value differs from the desired one; destroy
 * restores the value the flag had before Alchemy first managed it
 * (captured as `initialFlag`) — there is no DELETE endpoint.
 *
 * Logpull is an Enterprise feature — on unentitled zones every operation
 * fails with the typed `LogsControlNotAuthorized` error.
 * ### Managing log retention
 * **Example:** Enable Logpull retention on a zone
 * ```typescript
 * const retention = yield* Cloudflare.LogsControl.LogsRetentionFlag("Retention", {
 *   zoneId: zone.zoneId,
 *   flag: true,
 * });
 * ```
 *
 * **Example:** Explicitly disable retention
 * ```typescript
 * yield* Cloudflare.LogsControl.LogsRetentionFlag("Retention", {
 *   zoneId: zone.zoneId,
 *   flag: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/logs/logpull/enabling-log-retention/
 *
 * @resource
 * @product Logs
 * @category Observability & Analytics
 */
export declare const LogsRetentionFlag: import("../../Resource.ts").ResourceClass<LogsRetentionFlag>;
/**
 * Returns true if the given value is a LogsRetentionFlag resource.
 */
export declare const isLogsRetentionFlag: (value: unknown) => value is LogsRetentionFlag;
export declare const LogsRetentionFlagProvider: () => import("effect/Layer").Layer<Provider.Provider<LogsRetentionFlag>, never, CloudflareEnvironment | logs.CloudflareOpContext>;
export {};
//# sourceMappingURL=RetentionFlag.d.ts.map