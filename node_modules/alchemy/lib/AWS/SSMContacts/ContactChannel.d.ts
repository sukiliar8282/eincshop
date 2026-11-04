import * as contacts from "@distilled.cloud/aws/ssm-contacts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** How Incident Manager engages the contact through this channel. */
export type ContactChannelType = "SMS" | "VOICE" | "EMAIL";
export interface ContactChannelProps {
    /**
     * The ARN of the contact this channel belongs to. Changing it replaces the
     * channel.
     */
    contactId: string;
    /**
     * The name of the contact channel.
     *
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * The channel type: `SMS`, `VOICE`, or `EMAIL`. Changing it replaces the
     * channel.
     */
    type: ContactChannelType;
    /**
     * The address of the channel: an E.164 phone number (`+15551234567`) for
     * `SMS`/`VOICE`, or an email address for `EMAIL`.
     */
    deliveryAddress: contacts.ContactChannelAddress;
    /**
     * When `true`, the channel is created without sending an activation code —
     * the contact's device does not receive a message. Activate later with
     * `sendActivationCode` + `activateContactChannel`.
     *
     * @default false (AWS sends an activation code on create)
     */
    deferActivation?: boolean;
}
/** @resource */
export interface ContactChannel extends Resource<"AWS.SSMContacts.ContactChannel", ContactChannelProps, {
    /** ARN of the contact channel. */
    contactChannelArn: string;
    /** ARN of the owning contact. */
    contactArn: string;
    /** Name of the channel. */
    name: string;
    /** The channel type. */
    type: string;
    /** `ACTIVATED` or `NOT_ACTIVATED`. */
    activationStatus: string | undefined;
}, never, Providers> {
}
/**
 * An Incident Manager contact channel — the method (SMS, voice, or email)
 * that Incident Manager uses to engage a contact during an incident.
 *
 * ### Creating Contact Channels
 * **Example:** Email channel without activation
 * ```typescript
 * const email = yield* SSMContacts.ContactChannel("Email", {
 *   contactId: oncall.contactArn,
 *   type: "EMAIL",
 *   deliveryAddress: { SimpleAddress: "oncall@example.com" },
 *   deferActivation: true,
 * });
 * ```
 *
 * **Example:** SMS channel
 * ```typescript
 * const sms = yield* SSMContacts.ContactChannel("Sms", {
 *   contactId: oncall.contactArn,
 *   type: "SMS",
 *   deliveryAddress: { SimpleAddress: "+15551234567" },
 * });
 * ```
 */
declare const ContactChannelResource: import("../../Resource.ts").ResourceClass<ContactChannel>;
export { ContactChannelResource as ContactChannel };
export declare const ContactChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<ContactChannel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ContactChannel.d.ts.map