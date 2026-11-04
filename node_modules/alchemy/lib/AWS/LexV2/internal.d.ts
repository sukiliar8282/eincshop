import * as lexm from "@distilled.cloud/aws/lex-models-v2";
import * as Effect from "effect/Effect";
declare const LexOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "LexOperationFailed";
} & Readonly<A>;
/** A Lex V2 resource ended in a terminal `Failed` state (or never settled). */
export declare class LexOperationFailed extends LexOperationFailed_base<{
    readonly resourceId: string;
    readonly status: string;
    readonly reasons: readonly string[];
}> {
}
/**
 * Coerce a generated physical name into Lex's name pattern
 * `^([0-9a-zA-Z][_-]?){1,100}$` — every `-`/`_` must be preceded by an
 * alphanumeric (no leading or consecutive separators).
 */
export declare const toLexName: (name: string) => string;
/** Convert a Lex wire tag map (values may be undefined) into a plain record. */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Retry `ConflictException`s on a bounded schedule. Lex serializes most
 * mutations per bot — a concurrent build/version/update surfaces as a
 * transient conflict.
 *
 * The explicit `Effect.Effect<A, E, R>` return annotation is load-bearing:
 * inlining retry/repeat combinators in provider lifecycle code lets their
 * conditional return types survive into declaration emit and widen the
 * provider layer to `unknown` (see `../EC2/VolumeAttachment.ts`).
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Poll `describeBot` until the bot leaves its transient statuses
 * (`Creating`/`Versioning`/`Updating`/`Importing`). Fails typed on `Failed`.
 * Bot mutations settle in seconds — budget ~80s.
 */
export declare const waitForBotSettled: (botId: string) => Effect.Effect<lexm.DescribeBotResponse, LexOperationFailed | lexm.DescribeBotError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Poll `describeBotLocale` until the DRAFT locale leaves its create-time
 * transient statuses (settles at `NotBuilt`/`Built`/`ReadyExpressTesting`).
 * Fails typed on `Failed`.
 */
export declare const waitForLocaleSettled: (botId: string, localeId: string) => Effect.Effect<lexm.DescribeBotLocaleResponse, LexOperationFailed | lexm.DescribeBotLocaleError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Poll `describeBotLocale` until a triggered build lands on `Built`.
 * `Building` and `ReadyExpressTesting` are intermediate build states. A tiny
 * bot normally builds in under a minute; keep the poll bounded to ~90 seconds
 * so a stalled AWS build fails promptly.
 */
export declare const waitForLocaleBuilt: (botId: string, localeId: string) => Effect.Effect<lexm.DescribeBotLocaleResponse, LexOperationFailed | lexm.DescribeBotLocaleError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Poll `describeBotAlias` until the alias leaves `Creating`. Fails typed on
 * `Failed`.
 */
export declare const waitForAliasSettled: (botId: string, botAliasId: string) => Effect.Effect<lexm.DescribeBotAliasResponse, LexOperationFailed | lexm.DescribeBotAliasError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Read the observed tags of a Lex resource by ARN. Best-effort — a race with
 * deletion reports no tags.
 */
export declare const readLexTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a Lex resource: diff OBSERVED cloud tags against the desired
 * set and apply only the delta.
 */
export declare const syncLexTags: (arn: string, observed: Record<string, string>, desired: Record<string, string>) => Effect.Effect<void, lexm.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=internal.d.ts.map