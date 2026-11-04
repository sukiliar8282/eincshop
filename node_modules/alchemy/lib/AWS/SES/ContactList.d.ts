import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A subscription topic on a contact list. Pass the distilled shape directly:
 * `TopicName` (the stable id), `DisplayName`, an optional `Description`, and a
 * `DefaultSubscriptionStatus` of `"OPT_IN"` or `"OPT_OUT"`.
 */
export type ContactListTopic = sesv2.Topic;
export interface ContactListProps {
    /**
     * Name of the contact list. May contain letters, numbers, dashes and
     * underscores, up to 64 characters. If omitted, a deterministic physical
     * name is generated from the app, stage, and logical ID. Changing the name
     * replaces the contact list.
     */
    contactListName?: string;
    /**
     * A human-readable description of the contact list. Leave undefined to keep
     * whatever SES currently has.
     */
    description?: string;
    /**
     * The interest topics contacts can subscribe to. Replaced wholesale when
     * set — pass the full desired set. Leave undefined to keep whatever SES
     * currently has.
     */
    topics?: ContactListTopic[];
    /**
     * Tags to apply to the contact list. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ContactList extends Resource<"AWS.SES.ContactList", ContactListProps, {
    /** Name of the contact list. */
    contactListName: string;
    /** ARN of the contact list. */
    contactListArn: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 contact list — a named audience of email contacts with
 * subscription topics, used with SES's list-management and unsubscribe
 * handling.
 *
 * Add contacts with `SES.Contact`. Deleting the list deletes all of its
 * contacts.
 *
 * SES allows only **one contact list per AWS account**, so renaming a list
 * replaces it by deleting the old list (and its contacts) before creating the
 * new one — a create-then-delete replacement would exceed the account limit.
 * ### Creating Contact Lists
 * **Example:** Basic Contact List
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const list = yield* SES.ContactList("Newsletter", {
 *   description: "Weekly product newsletter",
 * });
 * ```
 *
 * **Example:** Contact List with Topics
 * ```typescript
 * const list = yield* SES.ContactList("Newsletter", {
 *   topics: [
 *     {
 *       TopicName: "product-updates",
 *       DisplayName: "Product Updates",
 *       DefaultSubscriptionStatus: "OPT_IN",
 *     },
 *     {
 *       TopicName: "promotions",
 *       DisplayName: "Promotions",
 *       DefaultSubscriptionStatus: "OPT_OUT",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Contact List with Tags
 * ```typescript
 * const list = yield* SES.ContactList("Newsletter", {
 *   tags: { Team: "growth", Environment: "prod" },
 * });
 * ```
 *
 * ### Populating the List
 * **Example:** Add Contacts to the List
 * ```typescript
 * const list = yield* SES.ContactList("Newsletter", {
 *   topics: [
 *     {
 *       TopicName: "product-updates",
 *       DisplayName: "Product Updates",
 *       DefaultSubscriptionStatus: "OPT_IN",
 *     },
 *   ],
 * });
 *
 * for (const email of ["a@example.com", "b@example.com"]) {
 *   yield* SES.Contact(`Subscriber-${email}`, {
 *     contactListName: list.contactListName,
 *     emailAddress: email,
 *     topicPreferences: [
 *       { TopicName: "product-updates", SubscriptionStatus: "OPT_IN" },
 *     ],
 *   });
 * }
 * ```
 *
 * @resource
 */
export declare const ContactList: import("../../Resource.ts").ResourceClass<ContactList>;
export declare const ContactListProvider: () => import("effect/Layer").Layer<Provider.Provider<ContactList>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ContactList.d.ts.map