import * as logs from "@distilled.cloud/cloudflare/logs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Logs.CmbConfig";
type TypeId = typeof TypeId;
export type CmbConfigProps = {
    /**
     * The Cloudflare account whose Customer Metadata Boundary (CMB) log
     * configuration is managed. The config is an account-level singleton, so
     * the account is the resource's identity — changing it triggers a
     * replacement.
     * @default the account from the active Cloudflare profile
     */
    accountId?: string;
    /**
     * Name of the region log data is restricted to (e.g. `"eu"`).
     *
     * Changing the CMB region affects where ALL logs for the account are
     * stored and processed — treat this as a destructive, account-wide
     * setting.
     */
    regions?: string;
    /**
     * Whether log data may be accessed from outside the configured region.
     * @default false
     */
    allowOutOfRegionAccess?: boolean;
};
export type CmbConfigAttributes = {
    /** The Cloudflare account the CMB config belongs to. */
    accountId: string;
    /** Name of the region log data is restricted to. */
    regions: string | undefined;
    /** Whether log data may be accessed from outside the configured region. */
    allowOutOfRegionAccess: boolean | undefined;
};
export type CmbConfig = Resource<TypeId, CmbConfigProps, CmbConfigAttributes, never, Providers>;
/**
 * The account-level Customer Metadata Boundary (CMB) configuration for
 * Cloudflare Logs (`/accounts/{account_id}/logs/control/cmb/config`).
 *
 * The CMB config is a true account singleton with PUT/DELETE semantics: the
 * POST endpoint is a full upsert, and DELETE removes the configuration
 * entirely (an account with no CMB config reads back as empty). Identity is
 * the account itself.
 *
 * CMB is part of Cloudflare's Data Localization Suite and requires an
 * Enterprise plan — on unentitled accounts every operation fails with the
 * typed `LogsControlNotAuthorized` error.
 *
 * :::warning
 * Changing the CMB region changes where ALL logs for the account are stored
 * and processed, and deleting the config lifts the boundary. Handle with
 * care in production accounts.
 * :::
 * ### Restricting logs to a region
 * **Example:** Keep all account logs in the EU
 * ```typescript
 * const cmb = yield* Cloudflare.LogsControl.CmbConfig("EuLogs", {
 *   regions: "eu",
 * });
 * ```
 *
 * **Example:** Allow out-of-region access
 * ```typescript
 * const cmb = yield* Cloudflare.LogsControl.CmbConfig("EuLogs", {
 *   regions: "eu",
 *   allowOutOfRegionAccess: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/data-localization/metadata-boundary/
 *
 * @resource
 * @product Logs
 * @category Observability & Analytics
 */
export declare const CmbConfig: import("../../Resource.ts").ResourceClass<CmbConfig>;
/**
 * Returns true if the given value is a CmbConfig resource.
 */
export declare const isCmbConfig: (value: unknown) => value is CmbConfig;
export declare const CmbConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<CmbConfig>, never, CloudflareEnvironment | logs.CloudflareOpContext>;
export {};
//# sourceMappingURL=CmbConfig.d.ts.map