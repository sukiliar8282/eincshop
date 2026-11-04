import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface StreamKeyProps {
    /**
     * ARN of the channel the stream key authorizes broadcasts to.
     * Changing the channel replaces the stream key.
     */
    channelArn: string;
    /**
     * Tags to apply to the stream key. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface StreamKey extends Resource<"AWS.IVS.StreamKey", StreamKeyProps, {
    /**
     * ARN of the stream key.
     */
    streamKeyArn: string;
    /**
     * ARN of the channel the stream key authorizes broadcasts to.
     */
    channelArn: string;
    /**
     * The secret stream key value used by broadcast software to
     * authenticate against the channel's ingest endpoint.
     */
    value: Redacted.Redacted<string> | undefined;
}, never, Providers> {
}
/**
 * An Amazon IVS stream key — the secret credential broadcast software
 * uses to authenticate against a channel's ingest endpoint.
 *
 * IVS allows at most one stream key per channel, and `CreateChannel`
 * provisions one automatically. This resource therefore *manages the
 * channel's stream key*: if the channel already has its auto-created key,
 * the resource takes ownership of it (tagging it with Alchemy's internal
 * tags) instead of failing the per-channel quota.
 * ### Creating Stream Keys
 * **Example:** Stream Key for a Channel
 * ```typescript
 * import * as IVS from "alchemy/AWS/IVS";
 *
 * const channel = yield* IVS.Channel("LiveChannel");
 * const streamKey = yield* IVS.StreamKey("LiveKey", {
 *   channelArn: channel.channelArn,
 * });
 * ```
 *
 * @resource
 */
export declare const StreamKey: import("../../Resource.ts").ResourceClass<StreamKey>;
declare const IvsStreamKeyIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsStreamKeyIncomplete";
} & Readonly<A>;
/**
 * Raised when the IVS API returns a stream key missing its ARN or channel
 * ARN.
 */
export declare class IvsStreamKeyIncomplete extends IvsStreamKeyIncomplete_base<{
    message: string;
}> {
}
export declare const StreamKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<StreamKey>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=StreamKey.d.ts.map