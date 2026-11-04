import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccountConfigurationProps {
    /**
     * How long before certificate expiration ACM starts emitting daily
     * `ACM Certificate Approaching Expiration` EventBridge events for each
     * certificate in the account.
     *
     * The wire unit is whole days and AWS accepts between 1 and 45 days.
     * Accepts any `Duration.Input` (e.g. `"30 days"`); the provider converts to
     * whole days.
     *
     * @default "45 days" (the AWS account default)
     */
    daysBeforeExpiry?: Duration.Input;
}
export interface AccountConfiguration extends Resource<"AWS.ACM.AccountConfiguration", AccountConfigurationProps, {
    /**
     * Days before certificate expiration when ACM starts emitting expiry
     * events, as currently configured on the account.
     */
    daysBeforeExpiry: number;
}, never, Providers> {
}
/**
 * Account-level ACM configuration (`AWS::CertificateManager::Account`).
 *
 * ACM emits one `ACM Certificate Approaching Expiration` EventBridge event
 * per day per certificate starting `daysBeforeExpiry` days before each
 * certificate expires. This account-global singleton manages that threshold
 * via `acm:PutAccountConfiguration`. Deleting the resource resets the
 * threshold to the AWS default of 45 days.
 *
 * Like the {@link Certificate} resource, the provider pins its API calls to
 * `us-east-1`.
 *
 * ### Configuring Expiry Events
 * **Example:** Start Expiry Events 30 Days Before Expiration
 * ```typescript
 * const config = yield* AccountConfiguration("AcmAccount", {
 *   daysBeforeExpiry: "30 days",
 * });
 * ```
 *
 * **Example:** Consume the Expiry Events
 * ```typescript
 * // The events arrive on the default EventBridge bus with source "aws.acm".
 * yield* AWS.ACM.consumeExpiryEvents({}, (events) =>
 *   Stream.runForEach(events, (event) =>
 *     Effect.log(
 *       `${event.detail.CommonName} expires in ${event.detail.DaysToExpiry} days`,
 *     ),
 *   ),
 * );
 * ```
 *
 * @resource
 */
export declare const AccountConfiguration: import("../../Resource.ts").ResourceClass<AccountConfiguration>;
export declare const AccountConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccountConfiguration.d.ts.map