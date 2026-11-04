import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface NotificationHubProps {
    /**
     * The AWS region to enable as a notification hub (where User
     * Notifications stores and replicates notification events), e.g.
     * `us-west-2`. Changing the region replaces the hub.
     */
    region: string;
}
export interface NotificationHub extends Resource<"AWS.Notifications.NotificationHub", NotificationHubProps, {
    /** The region registered as a notification hub. */
    notificationHubRegion: string;
    /** Hub status: `ACTIVE`, `REGISTERING`, `DEREGISTERING` or `INACTIVE`. */
    status: string;
}, never, Providers> {
}
/**
 * An AWS User Notifications **notification hub** — a regional enablement
 * that stores and replicates notification events. An account can register
 * at most 3 hubs, and at least one ACTIVE hub must exist for notification
 * configurations to deliver events.
 *
 * Registration is a true upsert keyed by region (re-registering an existing
 * hub region is a no-op), so the hub behaves like a per-region singleton.
 *
 * **AWS refuses to deregister the last ACTIVE hub in the account**
 * (`ConflictException`). Destroying a stack containing the account's only
 * hub therefore fails — keep a baseline hub registered outside the stack,
 * or register a second hub first.
 *
 * ### Registering a Notification Hub
 * **Example:** Enable a region as a notification hub
 * ```typescript
 * import * as Notifications from "alchemy/AWS/Notifications";
 *
 * const hub = yield* Notifications.NotificationHub("Hub", {
 *   region: "us-east-2",
 * });
 * ```
 *
 * @resource
 */
export declare const NotificationHub: import("../../Resource.ts").ResourceClass<NotificationHub>;
export declare const NotificationHubProvider: () => import("effect/Layer").Layer<Provider.Provider<NotificationHub>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=NotificationHub.d.ts.map