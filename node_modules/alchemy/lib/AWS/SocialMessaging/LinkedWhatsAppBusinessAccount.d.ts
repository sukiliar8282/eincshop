import * as socialmessaging from "@distilled.cloud/aws/socialmessaging";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type RegistrationStatus = socialmessaging.RegistrationStatus;
export type WhatsAppPhoneNumberSummary = socialmessaging.WhatsAppPhoneNumberSummary;
/**
 * An event destination (Amazon SNS topic) that AWS End User Messaging Social
 * publishes WhatsApp events (messages, message status updates) to.
 */
export interface LinkedWhatsAppBusinessAccountEventDestination {
    /**
     * ARN of the SNS topic that receives WhatsApp events for this account.
     */
    eventDestinationArn: string;
    /**
     * ARN of an IAM role the service assumes to publish to the topic. Omit to
     * publish with a service principal.
     */
    roleArn?: string;
}
export interface LinkedWhatsAppBusinessAccountProps {
    /**
     * The unique identifier of the WhatsApp Business Account already linked to
     * your AWS account (format `waba-...`).
     *
     * WhatsApp Business onboarding requires the Meta embedded-signup OAuth flow
     * in the AWS console and cannot be automated — this resource adopts and
     * manages an account that has already been linked. Changing the identifier
     * replaces the resource.
     */
    accountId: string;
    /**
     * Event destinations (SNS topics) to publish WhatsApp events to. When set,
     * the full list is synced (the API replaces the whole list). When omitted,
     * existing event destinations are left untouched.
     */
    eventDestinations?: LinkedWhatsAppBusinessAccountEventDestination[];
    /**
     * Tags to associate with the linked WhatsApp Business Account.
     */
    tags?: Record<string, string>;
}
export interface LinkedWhatsAppBusinessAccount extends Resource<"AWS.SocialMessaging.LinkedWhatsAppBusinessAccount", LinkedWhatsAppBusinessAccountProps, {
    /**
     * ARN of the linked WhatsApp Business Account.
     */
    arn: string;
    /**
     * The unique identifier of the linked WhatsApp Business Account
     * (`waba-...`).
     */
    id: string;
    /**
     * The WhatsApp Business Account ID from Meta.
     */
    wabaId: string;
    /**
     * The name of the WhatsApp Business Account.
     */
    wabaName: string;
    /**
     * Registration status of the linked account (`COMPLETE` | `INCOMPLETE`).
     */
    registrationStatus: RegistrationStatus;
    /**
     * ISO-8601 date the WhatsApp Business Account was linked.
     */
    linkDate: string;
    /**
     * Event destinations currently configured on the account.
     */
    eventDestinations: LinkedWhatsAppBusinessAccountEventDestination[];
    /**
     * Phone numbers registered to the WhatsApp Business Account.
     */
    phoneNumbers: WhatsAppPhoneNumberSummary[];
    /**
     * Current tags reported for the account.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A WhatsApp Business Account (WABA) linked to your AWS account through
 * AWS End User Messaging Social.
 *
 * :::caution
 * Linking a WhatsApp Business Account requires the Meta embedded-signup
 * OAuth flow in the AWS console and cannot be automated. This resource
 * adopts an already-linked account by its `waba-...` identifier and manages
 * its event destinations and tags. Destroying the resource disassociates
 * the WhatsApp Business Account from your AWS account.
 * :::
 * ### Managing a Linked Account
 * **Example:** Adopt a console-linked WABA and route events to SNS
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const events = yield* AWS.SNS.Topic("WhatsAppEvents", {});
 *
 * const waba = yield* AWS.SocialMessaging.LinkedWhatsAppBusinessAccount(
 *   "Business",
 *   {
 *     // from the AWS End User Messaging Social console after onboarding
 *     accountId: "waba-0123456789abcdef0123456789abcdef",
 *     eventDestinations: [{ eventDestinationArn: events.topicArn }],
 *     tags: { team: "growth" },
 *   },
 * );
 * ```
 *
 * ### Consuming WhatsApp Events
 * **Example:** Handle Inbound Messages in a Lambda
 * WhatsApp events (inbound messages, message status updates) are delivered
 * exclusively to the SNS topics listed in `eventDestinations` — there is no
 * separate event source for this service. Compose the resource with
 * `AWS.SNS.consumeTopicNotifications` on the destination topic:
 * ```typescript
 * const events = yield* AWS.SNS.Topic("WhatsAppEvents", {});
 *
 * const waba = yield* AWS.SocialMessaging.LinkedWhatsAppBusinessAccount(
 *   "Business",
 *   {
 *     accountId: "waba-0123456789abcdef0123456789abcdef",
 *     eventDestinations: [{ eventDestinationArn: events.topicArn }],
 *   },
 * );
 *
 * // inside a Lambda Function's init effect
 * yield* AWS.SNS.consumeTopicNotifications(events, (stream) =>
 *   stream.pipe(
 *     Stream.runForEach((notification) =>
 *       Effect.log("whatsapp event", notification.Message),
 *     ),
 *   ),
 * );
 * ```
 *
 * @resource
 */
export declare const LinkedWhatsAppBusinessAccount: import("../../Resource.ts").ResourceClass<LinkedWhatsAppBusinessAccount>;
declare const WhatsAppBusinessAccountNotLinked_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "WhatsAppBusinessAccountNotLinked";
} & Readonly<A>;
/**
 * The referenced WhatsApp Business Account is not linked to this AWS
 * account. Linking requires the Meta embedded-signup flow in the AWS
 * console and cannot be performed by the provider.
 */
export declare class WhatsAppBusinessAccountNotLinked extends WhatsAppBusinessAccountNotLinked_base<{
    readonly accountId: string;
}> {
}
export declare const LinkedWhatsAppBusinessAccountProvider: () => import("effect/Layer").Layer<Provider.Provider<LinkedWhatsAppBusinessAccount>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=LinkedWhatsAppBusinessAccount.d.ts.map