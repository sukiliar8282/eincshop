import * as Layer from "effect/Layer";
import * as Lambda from "../Lambda/Function.ts";
import { CodeHookEventSource, type CodeHookEvent } from "./CodeHookEventSource.ts";
/**
 * An Amazon Lex V2 code hook invocation — the
 * `messageVersion`/`invocationSource`/`bot`/`sessionState` envelope Lex
 * sends to dialog and fulfillment Lambda functions.
 */
export declare const isCodeHookEvent: (event: any) => event is CodeHookEvent;
/**
 * Connects an Amazon Lex V2 bot alias's Lambda code hook to the current
 * Lambda function.
 *
 * At deploy time this layer injects the function ARN into the alias's
 * `botAliasLocaleSettings` through the alias's binding contract and
 * materializes the `lambda:InvokeFunction` Permission for
 * `lexv2.amazonaws.com`; at runtime it dispatches matching code hook events
 * (matched on the bot id, alias id, and locale) to the registered handler
 * and returns the handler's response to Lex.
 * ### Handling Code Hooks
 * **Example:** Fulfill an intent
 * ```typescript
 * yield* LexV2.onCodeHook(alias, { localeId: "en_US" }, (event) =>
 *   Effect.succeed(LexV2.fulfillIntent(event, { message: "Done!" })),
 * );
 * ```
 *
 * @binding
 */
export declare const LambdaCodeHookEventSource: Layer.Layer<CodeHookEventSource, never, Lambda.Function>;
//# sourceMappingURL=LambdaCodeHookEventSource.d.ts.map