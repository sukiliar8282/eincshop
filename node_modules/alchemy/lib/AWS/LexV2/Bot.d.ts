import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface BotProps {
    /**
     * Name of the bot. Mutable — renames update the bot in place (identity is
     * the generated bot ID).
     * @default ${app}-${id}-${stage}-${suffix}
     */
    botName?: string;
    /**
     * ARN of an IAM role that Amazon Lex assumes to call AWS services on the
     * bot's behalf (e.g. Polly for speech). The role must trust
     * `lexv2.amazonaws.com`.
     */
    roleArn: string;
    /**
     * COPPA data-privacy declaration. Set `childDirected: true` when the bot
     * is directed at children under 13.
     * @default { childDirected: false }
     */
    dataPrivacy?: {
        /** Whether the bot is directed at children under 13 (COPPA). */
        childDirected: boolean;
    };
    /**
     * How long Amazon Lex retains a conversation session after the last user
     * input (60 seconds to 24 hours). Accepts any `Duration.Input` (e.g.
     * `"10 minutes"`, `Duration.minutes(10)`; a bare number is milliseconds);
     * the wire unit is whole seconds.
     * @default 300 seconds
     */
    idleSessionTTL?: Duration.Input;
    /**
     * Description of the bot.
     */
    description?: string;
    /**
     * Tags to associate with the bot.
     */
    tags?: Record<string, string>;
}
export interface Bot extends Resource<"AWS.LexV2.Bot", BotProps, {
    /** Unique identifier assigned to the bot. */
    botId: string;
    /** Name of the bot. */
    botName: string;
    /** ARN of the bot. */
    botArn: string;
    /** Current status of the bot (e.g. `Available`). */
    botStatus: string;
    /** ARN of the IAM role the bot assumes. */
    roleArn: string;
    /** Tags currently associated with the bot. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Lex V2 conversational bot. The bot is the container for locales,
 * intents, and slot types; conversations run against an alias of a built
 * version.
 *
 * ### Creating a Bot
 * **Example:** Basic Bot
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const role = yield* AWS.IAM.Role("BotRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "lexv2.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 * });
 *
 * const bot = yield* AWS.LexV2.Bot("OrderBot", {
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Bot with Session and Privacy Settings
 * ```typescript
 * const bot = yield* AWS.LexV2.Bot("KidsBot", {
 *   roleArn: role.roleArn,
 *   dataPrivacy: { childDirected: true },
 *   idleSessionTTL: "10 minutes",
 *   description: "A bot for children",
 * });
 * ```
 *
 * ### Building the Conversation Graph
 * **Example:** Locale, Intent, and Alias
 * ```typescript
 * const locale = yield* AWS.LexV2.BotLocale("En", {
 *   botId: bot.botId,
 *   localeId: "en_US",
 * });
 * const intent = yield* AWS.LexV2.Intent("Greet", {
 *   botId: locale.botId,
 *   localeId: locale.localeId,
 *   sampleUtterances: ["hello", "hi"],
 * });
 * const version = yield* AWS.LexV2.BotVersion("V1", {
 *   botId: intent.botId,
 *   localeIds: [intent.localeId],
 * });
 * const alias = yield* AWS.LexV2.BotAlias("Live", {
 *   botId: version.botId,
 *   botVersion: version.botVersion,
 * });
 * ```
 *
 * @resource
 */
export declare const Bot: import("../../Resource.ts").ResourceClass<Bot>;
export declare const BotProvider: () => import("effect/Layer").Layer<Provider.Provider<Bot>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Bot.d.ts.map