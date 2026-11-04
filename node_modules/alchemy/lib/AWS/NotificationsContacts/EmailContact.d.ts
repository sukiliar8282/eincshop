import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EmailContactProps {
    /**
     * Display name of the contact (1–64 characters). If omitted, a unique
     * name is generated from the app, stage and logical ID. Contacts have no
     * update API, so changing the name replaces the contact.
     */
    name?: string;
    /**
     * The email address that receives notifications. Unique per account —
     * AWS rejects a second contact with the same address. Changing the
     * address replaces the contact.
     *
     * A new contact is created in the unverified `inactive` state; AWS sends
     * notifications to it only after the address owner confirms the
     * activation email (`SendActivationCode` / the console).
     */
    emailAddress: string;
    /**
     * User tags to attach to the contact. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface EmailContact extends Resource<"AWS.NotificationsContacts.EmailContact", EmailContactProps, {
    /** The ARN of the email contact (regionless). */
    emailContactArn: string;
    /** The display name of the contact. */
    name: string;
    /** The email address of the contact. */
    emailAddress: string;
    /**
     * Verification status: `inactive` until the address owner confirms the
     * activation email, then `active`.
     */
    status: string;
}, never, Providers> {
}
/**
 * An AWS User Notifications Contacts **email contact** — an email address
 * that can be attached to a notification configuration as a delivery
 * channel.
 *
 * Contacts are created in the unverified `inactive` state; activation is a
 * human email-confirmation loop (AWS emails the address a confirmation
 * link), so Alchemy provisions the contact and leaves activation to the
 * address owner. Contacts are immutable (no update API) — changing the
 * name or address replaces the contact; tags update in place.
 *
 * ### Creating an Email Contact
 * **Example:** Basic email contact
 * ```typescript
 * import * as NotificationsContacts from "alchemy/AWS/NotificationsContacts";
 *
 * const contact = yield* NotificationsContacts.EmailContact("OnCall", {
 *   emailAddress: "oncall@example.com",
 * });
 * // contact.status === "inactive" until the address owner confirms
 * ```
 *
 * **Example:** Named contact with tags
 * ```typescript
 * const contact = yield* NotificationsContacts.EmailContact("OnCall", {
 *   name: "platform-oncall",
 *   emailAddress: "oncall@example.com",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const EmailContact: import("../../Resource.ts").ResourceClass<EmailContact>;
export declare const EmailContactProvider: () => import("effect/Layer").Layer<Provider.Provider<EmailContact>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EmailContact.d.ts.map