import * as contacts from "@distilled.cloud/aws/ssm-contacts";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** The kind of contact: a person, an escalation plan, or an on-call schedule. */
export type ContactType = "PERSONAL" | "ESCALATION" | "ONCALL_SCHEDULE";
export interface ContactProps {
    /**
     * The unique, identifiable alias of the contact or escalation plan
     * (lowercase letters, numbers, `-`, `_`, `.`). Changing it replaces the
     * contact.
     *
     * @default ${app}-${id}-${stage}-${suffix} (lowercased)
     */
    alias?: string;
    /**
     * The full name of the contact or escalation plan.
     */
    displayName?: string;
    /**
     * `PERSONAL` for a single person, `ESCALATION` for an escalation plan that
     * engages contacts in phases, or `ONCALL_SCHEDULE` for a rotation-backed
     * schedule. Changing it replaces the contact.
     */
    type: ContactType;
    /**
     * The stages (engagement plan) that Incident Manager runs through when
     * engaging this contact. Stage targets are contact channels for `PERSONAL`
     * contacts and contacts for `ESCALATION` plans; `ONCALL_SCHEDULE` contacts
     * reference rotations via `RotationIds`.
     *
     * When omitted, an existing plan is left untouched so it can be managed by
     * the standalone `SSMContacts.Plan` resource.
     */
    plan?: contacts.Plan;
    /**
     * The contact's resource policy as a JSON policy document (string or
     * object) — shares the contact and its engagements with other accounts.
     * When omitted, any existing policy is left untouched (SSM Contacts has
     * no delete-policy API).
     */
    policy?: string | Record<string, unknown>;
    /**
     * Tags applied to the contact. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Contact extends Resource<"AWS.SSMContacts.Contact", ContactProps, {
    /** ARN of the contact. */
    contactArn: string;
    /** Alias of the contact. */
    alias: string;
    /** The contact type. */
    type: string;
    /** Display name of the contact. */
    displayName: string | undefined;
}, never, Providers> {
}
/**
 * An Incident Manager contact — a person Incident Manager engages during an
 * incident, an escalation plan that engages contacts in phases, or an
 * on-call schedule backed by rotations.
 *
 * Requires the account's Incident Manager replication set
 * (`SSMIncidents.ReplicationSet`) to exist.
 *
 * ### Creating Contacts
 * **Example:** Personal contact
 * ```typescript
 * const oncall = yield* SSMContacts.Contact("Oncall", {
 *   type: "PERSONAL",
 *   displayName: "Primary On-Call",
 * });
 * ```
 *
 * **Example:** Contact with an inline engagement plan
 * ```typescript
 * const channel = yield* SSMContacts.ContactChannel("Email", {
 *   contactId: oncall.contactArn,
 *   type: "EMAIL",
 *   deliveryAddress: { SimpleAddress: "oncall@example.com" },
 *   deferActivation: true,
 * });
 * const escalation = yield* SSMContacts.Contact("Escalation", {
 *   type: "ESCALATION",
 *   plan: {
 *     Stages: [
 *       {
 *         DurationInMinutes: 5,
 *         Targets: [
 *           { ContactTargetInfo: { ContactId: oncall.contactArn, IsEssential: true } },
 *         ],
 *       },
 *     ],
 *   },
 * });
 * ```
 */
declare const ContactResource: import("../../Resource.ts").ResourceClass<Contact>;
export { ContactResource as Contact };
/** Builds the ARN of a contact from its alias in the ambient account/region. */
export declare const contactArn: (alias: string) => Effect.Effect<string, never, AWSEnvironment>;
export declare const ContactProvider: () => import("effect/Layer").Layer<Provider.Provider<Contact>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Contact.d.ts.map