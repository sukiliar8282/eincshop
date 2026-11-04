import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ChannelAssociationProps {
    /**
     * The ARN of the {@link NotificationConfiguration} to deliver from.
     * Changing the configuration replaces the association.
     */
    notificationConfigurationArn: string;
    /**
     * The ARN of the delivery channel to associate. Supported channels are
     * email contacts (`AWS.NotificationsContacts.EmailContact`), Amazon Q
     * Developer in chat applications (AWS Chatbot) channels, and AWS Console
     * Mobile Application devices. Changing the channel replaces the
     * association.
     *
     * An email contact can be associated while still `inactive` (unverified);
     * AWS begins delivering to it once the address owner activates it.
     */
    channelArn: string;
}
export interface ChannelAssociation extends Resource<"AWS.Notifications.ChannelAssociation", ChannelAssociationProps, {
    /** The ARN of the associated delivery channel. */
    channelArn: string;
    /** The ARN of the parent notification configuration. */
    notificationConfigurationArn: string;
}, never, Providers> {
}
/**
 * An AWS User Notifications **channel association** — attaches a delivery
 * channel (an email contact, an Amazon Q Developer chat channel, or a
 * Console Mobile Application device) to a
 * {@link NotificationConfiguration}, so matching events are actually
 * delivered somewhere beyond the Console notification center.
 *
 * The association is existence-only (there is nothing mutable): changing
 * either ARN replaces it.
 *
 * ### Associating a Channel
 * **Example:** Deliver notifications to an email contact
 * ```typescript
 * import * as Notifications from "alchemy/AWS/Notifications";
 * import * as NotificationsContacts from "alchemy/AWS/NotificationsContacts";
 *
 * const config = yield* Notifications.NotificationConfiguration("Alerts", {
 *   description: "Deployment alerts",
 * });
 * const contact = yield* NotificationsContacts.EmailContact("OnCall", {
 *   emailAddress: "oncall@example.com",
 * });
 * const association = yield* Notifications.ChannelAssociation("OnCallEmail", {
 *   notificationConfigurationArn: config.notificationConfigurationArn,
 *   channelArn: contact.emailContactArn,
 * });
 * ```
 *
 * @resource
 */
export declare const ChannelAssociation: import("../../Resource.ts").ResourceClass<ChannelAssociation>;
export declare const ChannelAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ChannelAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ChannelAssociation.d.ts.map