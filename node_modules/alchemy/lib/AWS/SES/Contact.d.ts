import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A contact's subscription preference for a single topic. Pass the distilled
 * shape directly: `TopicName` and a `SubscriptionStatus` of `"OPT_IN"` or
 * `"OPT_OUT"`.
 */
export type ContactTopicPreference = sesv2.TopicPreference;
export interface ContactProps {
    /**
     * Name of the contact list this contact belongs to. Typically the
     * `contactListName` output of a `SES.ContactList`. Changing it replaces the
     * contact.
     */
    contactListName: string;
    /**
     * The contact's email address — the stable identifier within the list.
     * Changing it replaces the contact.
     */
    emailAddress: string;
    /**
     * The contact's per-topic subscription preferences. Replaced wholesale when
     * set — pass the full desired set. Leave undefined to keep whatever SES
     * currently has.
     */
    topicPreferences?: ContactTopicPreference[];
    /**
     * Whether the contact is unsubscribed from all topics. Leave undefined to
     * keep SES's current setting.
     * @default false
     */
    unsubscribeAll?: boolean;
    /**
     * Arbitrary application metadata attached to the contact. Serialized to the
     * JSON string SES stores; equivalent representations (key order, whitespace)
     * are ignored when detecting drift. Leave undefined to keep whatever SES
     * currently has.
     */
    attributes?: Record<string, unknown>;
}
export interface Contact extends Resource<"AWS.SES.Contact", ContactProps, {
    /** Name of the contact list the contact belongs to. */
    contactListName: string;
    /** The contact's email address. */
    emailAddress: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 contact — a single email address on a `SES.ContactList`,
 * with its own topic subscription preferences and unsubscribe state.
 * ### Adding Contacts
 * **Example:** Basic Contact
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const list = yield* SES.ContactList("Newsletter", {});
 * const contact = yield* SES.Contact("Subscriber", {
 *   contactListName: list.contactListName,
 *   emailAddress: "reader@example.com",
 * });
 * ```
 *
 * **Example:** Contact with Topic Preferences
 * ```typescript
 * const contact = yield* SES.Contact("Subscriber", {
 *   contactListName: list.contactListName,
 *   emailAddress: "reader@example.com",
 *   topicPreferences: [
 *     { TopicName: "product-updates", SubscriptionStatus: "OPT_IN" },
 *     { TopicName: "promotions", SubscriptionStatus: "OPT_OUT" },
 *   ],
 * });
 * ```
 *
 * **Example:** Unsubscribe a Contact from Everything
 * ```typescript
 * // unsubscribeAll overrides every per-topic preference.
 * const contact = yield* SES.Contact("Subscriber", {
 *   contactListName: list.contactListName,
 *   emailAddress: "reader@example.com",
 *   unsubscribeAll: true,
 * });
 * ```
 *
 * ### Application Metadata
 * **Example:** Attach Your Own Data to a Contact
 * ```typescript
 * // Serialized to the JSON string SES stores; re-ordering the keys is not a
 * // change, so this does not churn on every deploy.
 * const contact = yield* SES.Contact("Subscriber", {
 *   contactListName: list.contactListName,
 *   emailAddress: "reader@example.com",
 *   attributes: { plan: "pro", signupSource: "docs" },
 * });
 * ```
 *
 * @resource
 */
export declare const Contact: import("../../Resource.ts").ResourceClass<Contact>;
export declare const ContactProvider: () => import("effect/Layer").Layer<Provider.Provider<Contact>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Contact.d.ts.map