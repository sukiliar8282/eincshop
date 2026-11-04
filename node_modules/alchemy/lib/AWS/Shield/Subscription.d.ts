import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** Whether the Shield Advanced subscription renews automatically. */
export type SubscriptionAutoRenew = "ENABLED" | "DISABLED";
export interface SubscriptionProps {
    /**
     * Whether the subscription renews automatically at the end of the 1-year
     * commitment. Mutable — but AWS only allows changing it in the 30 days
     * before the current period ends.
     * @default "ENABLED"
     */
    autoRenew?: SubscriptionAutoRenew;
}
export interface Subscription extends Resource<"AWS.Shield.Subscription", SubscriptionProps, {
    /** ARN of the subscription. */
    subscriptionArn: string | undefined;
    /** Start of the current subscription period (ISO timestamp). */
    startTime: string | undefined;
    /** End of the current subscription period (ISO timestamp). */
    endTime: string | undefined;
    /** Length of the commitment, in seconds (1 year). */
    timeCommitmentInSeconds: number | undefined;
    /** Whether the subscription auto-renews. */
    autoRenew: string | undefined;
    /** Whether proactive engagement by the Shield Response Team is enabled. */
    proactiveEngagementStatus: string | undefined;
}, never, Providers> {
}
/**
 * The account-level AWS Shield Advanced subscription.
 *
 * :::caution
 * Creating this resource subscribes the account to Shield Advanced at
 * **$3,000/month with a mandatory 1-year commitment** (billed to the
 * Organizations payer account). AWS refuses `DeleteSubscription` until the
 * commitment ends, so destroying this resource before then leaves the
 * subscription in place (a warning is logged); after the commitment it is
 * cancelled for real.
 * :::
 *
 * ### Subscribing to Shield Advanced
 * **Example:** Subscribe with Auto-Renew
 * ```typescript
 * const subscription = yield* Shield.Subscription("Shield", {});
 * ```
 *
 * **Example:** Subscribe and Disable Auto-Renew
 * ```typescript
 * const subscription = yield* Shield.Subscription("Shield", {
 *   autoRenew: "DISABLED",
 * });
 * ```
 */
declare const SubscriptionResource: import("../../Resource.ts").ResourceClass<Subscription>;
export { SubscriptionResource as Subscription };
export declare const SubscriptionProvider: () => import("effect/Layer").Layer<Provider.Provider<Subscription>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Subscription.d.ts.map