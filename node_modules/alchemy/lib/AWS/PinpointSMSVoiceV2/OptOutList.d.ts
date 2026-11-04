import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface OptOutListProps {
    /**
     * Name of the opt-out list (`[A-Za-z0-9_-]+`, 1-64 characters).
     * Changing the name replaces the opt-out list.
     * @default ${app}-${stage}-${id}
     */
    optOutListName?: string;
    /**
     * Tags to apply to the opt-out list. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface OptOutList extends Resource<"AWS.PinpointSMSVoiceV2.OptOutList", OptOutListProps, {
    /**
     * Name of the opt-out list.
     */
    optOutListName: string;
    /**
     * ARN of the opt-out list.
     */
    optOutListArn: string;
}, never, Providers> {
}
/**
 * An AWS End User Messaging SMS (Pinpoint SMS Voice v2) opt-out list — a
 * list of destination phone numbers that opted out of receiving your SMS
 * or voice messages.
 *
 * When an end user replies with a supported opt-out keyword (STOP,
 * CANCEL, OPTOUT, ...), their number is added to the list automatically
 * and further messages to it are suppressed.
 * ### Creating Opt-Out Lists
 * **Example:** Basic Opt-Out List
 * ```typescript
 * import * as PinpointSMSVoiceV2 from "alchemy/AWS/PinpointSMSVoiceV2";
 *
 * const optOuts = yield* PinpointSMSVoiceV2.OptOutList("OptOuts");
 * ```
 *
 * **Example:** Named Opt-Out List with Tags
 * ```typescript
 * const optOuts = yield* PinpointSMSVoiceV2.OptOutList("OptOuts", {
 *   optOutListName: "marketing-opt-outs",
 *   tags: { team: "growth" },
 * });
 * ```
 *
 * @resource
 */
export declare const OptOutList: import("../../Resource.ts").ResourceClass<OptOutList>;
declare const SmsVoiceOptOutListMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SmsVoiceOptOutListMissing";
} & Readonly<A>;
/**
 * Raised when an opt-out list cannot be observed immediately after it
 * was created — the create call succeeded (or raced a peer) but the
 * follow-up describe found nothing.
 */
export declare class SmsVoiceOptOutListMissing extends SmsVoiceOptOutListMissing_base<{
    message: string;
}> {
}
export declare const OptOutListProvider: () => import("effect/Layer").Layer<Provider.Provider<OptOutList>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=OptOutList.d.ts.map