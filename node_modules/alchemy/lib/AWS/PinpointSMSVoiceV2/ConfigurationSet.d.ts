import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ConfigurationSetProps {
    /**
     * Name of the configuration set (`[A-Za-z0-9_-]+`, 1-64 characters).
     * Changing the name replaces the configuration set.
     * @default ${app}-${stage}-${id}
     */
    configurationSetName?: string;
    /**
     * Default message type applied to messages sent through this
     * configuration set. Use `TRANSACTIONAL` for time-sensitive messages
     * (e.g. one-time passcodes) and `PROMOTIONAL` for marketing content.
     * Omitting the prop clears the default.
     * @default no default message type
     */
    defaultMessageType?: "TRANSACTIONAL" | "PROMOTIONAL";
    /**
     * Tags to apply to the configuration set. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface ConfigurationSet extends Resource<"AWS.PinpointSMSVoiceV2.ConfigurationSet", ConfigurationSetProps, {
    /**
     * Name of the configuration set.
     */
    configurationSetName: string;
    /**
     * ARN of the configuration set.
     */
    configurationSetArn: string;
}, never, Providers> {
}
/**
 * An AWS End User Messaging SMS (Pinpoint SMS Voice v2) configuration
 * set — a named set of rules applied to SMS and voice messages sent
 * through it.
 *
 * Attach `EventDestination`s to a configuration set to route message
 * events (sends, deliveries, failures) to CloudWatch Logs, Kinesis Data
 * Firehose, or SNS.
 * ### Creating Configuration Sets
 * **Example:** Basic Configuration Set
 * ```typescript
 * import * as PinpointSMSVoiceV2 from "alchemy/AWS/PinpointSMSVoiceV2";
 *
 * const configSet = yield* PinpointSMSVoiceV2.ConfigurationSet("Messaging");
 * ```
 *
 * **Example:** Configuration Set with a Default Message Type
 * ```typescript
 * const configSet = yield* PinpointSMSVoiceV2.ConfigurationSet("Otp", {
 *   defaultMessageType: "TRANSACTIONAL",
 *   tags: { team: "auth" },
 * });
 * ```
 *
 * ### Event Destinations
 * **Example:** Stream message events to SNS
 * ```typescript
 * const events = yield* SNS.Topic("SmsEvents");
 * const destination = yield* PinpointSMSVoiceV2.EventDestination("Events", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["ALL"],
 *   snsDestination: { topicArn: events.topicArn },
 * });
 * ```
 *
 * @resource
 */
export declare const ConfigurationSet: import("../../Resource.ts").ResourceClass<ConfigurationSet>;
declare const SmsVoiceConfigurationSetMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SmsVoiceConfigurationSetMissing";
} & Readonly<A>;
/**
 * Raised when a configuration set cannot be observed immediately after
 * it was created — the create call succeeded (or raced a peer) but the
 * follow-up describe found nothing.
 */
export declare class SmsVoiceConfigurationSetMissing extends SmsVoiceConfigurationSetMissing_base<{
    message: string;
}> {
}
export declare const ConfigurationSetProvider: () => import("effect/Layer").Layer<Provider.Provider<ConfigurationSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ConfigurationSet.d.ts.map