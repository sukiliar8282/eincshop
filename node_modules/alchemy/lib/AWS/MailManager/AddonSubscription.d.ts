import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AddonSubscriptionProps {
    /**
     * Name of the Add On product to subscribe to (e.g. `TRENDMICRO_VSAPI`,
     * `SPAMHAUS_DBL`, `ABUSIX_MAIL_INTELLIGENCE`). Subscribing accepts the Add
     * On's terms of use and additional pricing. Immutable — changing the name
     * replaces the subscription.
     */
    addonName: string;
    /**
     * Tags applied to the subscription. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface AddonSubscription extends Resource<"AWS.MailManager.AddonSubscription", AddonSubscriptionProps, {
    /** Server-assigned ID of the Add On subscription. */
    addonSubscriptionId: string;
    /** ARN of the Add On subscription. */
    addonSubscriptionArn: string;
    /** Name of the subscribed Add On product. */
    addonName: string;
}, never, Providers> {
}
/**
 * An SES Mail Manager Add On subscription — the acceptance of a third-party
 * Add On's terms of use and additional pricing. An
 * {@link AddonInstance} created from the subscription is what rule sets and
 * traffic policies actually reference.
 *
 * Subscriptions are immutable after creation (only tags update in place).
 *
 * :::warning
 * Creating a subscription accepts the Add On's **additional pricing**.
 * :::
 * ### Subscribing to an Add On
 * **Example:** Spamhaus DBL
 * ```typescript
 * import * as MailManager from "alchemy/AWS/MailManager";
 *
 * const subscription = yield* MailManager.AddonSubscription("Spamhaus", {
 *   addonName: "SPAMHAUS_DBL",
 * });
 * const instance = yield* MailManager.AddonInstance("SpamhausInstance", {
 *   addonSubscriptionId: subscription.addonSubscriptionId,
 * });
 * ```
 *
 * @resource
 */
export declare const AddonSubscription: import("../../Resource.ts").ResourceClass<AddonSubscription>;
export declare const AddonSubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<AddonSubscription>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AddonSubscription.d.ts.map