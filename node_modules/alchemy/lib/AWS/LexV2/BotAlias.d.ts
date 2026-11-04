import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Lambda code hooks per locale (`localeId` → function ARN). Attached to the
 * alias's `botAliasLocaleSettings` as
 * `codeHookSpecification.lambdaCodeHook` with interface version `1.0`.
 */
export interface BotAliasCodeHooks extends Record<string, string> {
}
/**
 * The binding contract of a bot alias: event sources contribute Lambda code
 * hooks (`localeId` → function ARN) that the provider merges with
 * `props.codeHooks` and syncs onto the alias's `botAliasLocaleSettings`.
 */
export interface BotAliasBinding {
    /** Code hook entries injected by `LexV2.onCodeHook`. */
    codeHooks?: BotAliasCodeHooks;
}
declare const ConflictingCodeHook_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ConflictingCodeHook";
} & Readonly<A>;
/**
 * Two different Lambda functions were registered as the code hook of the
 * same alias locale — Lex supports exactly one dialog/fulfillment function
 * per alias locale.
 */
export declare class ConflictingCodeHook extends ConflictingCodeHook_base<{
    readonly localeId: string;
    readonly functionArns: readonly string[];
}> {
}
export interface BotAliasProps {
    /**
     * ID of the bot the alias belongs to. Changing it replaces the alias.
     */
    botId: string;
    /**
     * Name of the alias. Mutable — renames update the alias in place (identity
     * is the generated alias ID).
     * @default ${app}-${id}-${stage}-${suffix}
     */
    botAliasName?: string;
    /**
     * The numbered bot version the alias points at. Leave undefined to create
     * the alias unassociated and point it at a version later. Pass the
     * `botVersion` attribute of a `BotVersion` so the alias depends on it.
     */
    botVersion?: string;
    /**
     * Description of the alias.
     */
    description?: string;
    /**
     * Lambda code hooks per locale (`localeId` → function ARN). Merged with
     * code hook entries injected through the binding contract by
     * `LexV2.onCodeHook` — prefer the event source over declaring ARNs here,
     * since it also creates the invoke Permission and registers the runtime
     * handler.
     */
    codeHooks?: BotAliasCodeHooks;
    /**
     * Tags to associate with the alias.
     */
    tags?: Record<string, string>;
}
export interface BotAlias extends Resource<"AWS.LexV2.BotAlias", BotAliasProps, {
    /** Unique identifier assigned to the alias. */
    botAliasId: string;
    /** Name of the alias. */
    botAliasName: string;
    /** ARN of the alias (`arn:aws:lex:...:bot-alias/{botId}/{botAliasId}`). */
    botAliasArn: string;
    /** ID of the bot the alias belongs to. */
    botId: string;
    /** The bot version the alias points at, if associated. */
    botVersion: string | undefined;
    /** Current status of the alias (e.g. `Available`). */
    botAliasStatus: string;
    /** Tags currently associated with the alias. */
    tags: Record<string, string>;
}, BotAliasBinding, Providers> {
}
/**
 * An alias of an Amazon Lex V2 bot — a stable pointer to a numbered bot
 * version that runtime conversations (e.g. `RecognizeText`) target.
 *
 * ### Creating an Alias
 * **Example:** Alias on a Version
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const alias = yield* AWS.LexV2.BotAlias("Live", {
 *   botId: version.botId,
 *   botVersion: version.botVersion,
 * });
 * ```
 *
 * **Example:** Unassociated Alias
 * ```typescript
 * // point it at a version later without changing consumers
 * const alias = yield* AWS.LexV2.BotAlias("Staging", {
 *   botId: bot.botId,
 * });
 * ```
 *
 * ### Conversing at Runtime
 * **Example:** RecognizeText from a Lambda
 * ```typescript
 * const recognizeText = yield* AWS.LexV2.RecognizeText(alias);
 * const reply = yield* recognizeText({
 *   localeId: "en_US",
 *   sessionId: "user-123",
 *   text: "hello",
 * });
 * ```
 *
 * @resource
 */
export declare const BotAlias: import("../../Resource.ts").ResourceClass<BotAlias>;
export declare const BotAliasProvider: () => import("effect/Layer").Layer<Provider.Provider<BotAlias>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=BotAlias.d.ts.map