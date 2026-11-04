import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Workers.AccountSetting";
type TypeId = typeof TypeId;
export type AccountSettingProps = {
    /**
     * Default usage model applied to new Workers in this account (e.g.
     * `"standard"`). Mostly legacy since Workers Standard pricing — new
     * accounts only support `"standard"`.
     *
     * Mutable — updated in place. When omitted, the account's current value
     * is left untouched.
     * @default keep the account's current value
     */
    defaultUsageModel?: string;
    /**
     * Whether Green Compute is enabled for the account. When enabled,
     * scheduled (cron) Workers run only on hardware powered by renewable
     * energy.
     *
     * Mutable — updated in place. When omitted, the account's current value
     * is left untouched.
     * @default keep the account's current value
     */
    greenCompute?: boolean;
};
export type AccountSettingAttributes = {
    /** The Cloudflare account these settings belong to. */
    accountId: string;
    /** Resolved default usage model for the account. */
    defaultUsageModel: string | undefined;
    /** Resolved Green Compute flag for the account. */
    greenCompute: boolean | undefined;
    /**
     * The `defaultUsageModel` the account had before Alchemy first managed
     * this singleton. Restored on destroy.
     */
    initialDefaultUsageModel: string | undefined;
    /**
     * The `greenCompute` flag the account had before Alchemy first managed
     * this singleton. Restored on destroy.
     */
    initialGreenCompute: boolean | undefined;
};
export type AccountSetting = Resource<TypeId, AccountSettingProps, AccountSettingAttributes, never, Providers>;
/**
 * The account-wide Workers settings singleton
 * (`/accounts/{account_id}/workers/account-settings`): the default usage
 * model for new Workers and the Green Compute flag for scheduled Workers.
 *
 * This is a singleton — it always exists on every account with Cloudflare
 * defaults, so this resource never creates or deletes anything physical.
 * Reconcile PUTs the settings when the observed values differ from the
 * desired ones; destroy restores the values the account had before Alchemy
 * first managed it (captured as `initialDefaultUsageModel` /
 * `initialGreenCompute`).
 * ### Managing account settings
 * **Example:** Enable Green Compute for scheduled Workers
 * ```typescript
 * yield* Cloudflare.Workers.AccountSetting("GreenCompute", {
 *   greenCompute: true,
 * });
 * ```
 *
 * **Example:** Pin the default usage model
 * ```typescript
 * yield* Cloudflare.Workers.AccountSetting("UsageModel", {
 *   defaultUsageModel: "standard",
 *   greenCompute: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/workers/subresources/account_settings/
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const AccountSetting: import("../../Resource.ts").ResourceClass<AccountSetting>;
/**
 * Returns true if the given value is a AccountSetting resource.
 */
export declare const isAccountSetting: (value: unknown) => value is AccountSetting;
export declare const AccountSettingProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountSetting>, never, CloudflareEnvironment | workers.CloudflareOpContext>;
export {};
//# sourceMappingURL=AccountSetting.d.ts.map