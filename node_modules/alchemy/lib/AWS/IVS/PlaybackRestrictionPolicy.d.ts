import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PlaybackRestrictionPolicyProps {
    /**
     * ISO 3166-1 alpha-2 country codes playback is allowed from. An empty
     * array denies playback from every country.
     */
    allowedCountries: string[];
    /**
     * Origins (per the HTTP `Origin` header) playback is allowed from, e.g.
     * `https://example.com`. An empty array denies playback from every
     * origin.
     */
    allowedOrigins: string[];
    /**
     * Whether to enforce the origin restriction strictly (checks the
     * viewer's origin on every video segment request, not just the initial
     * playlist request).
     * @default false
     */
    enableStrictOriginEnforcement?: boolean;
    /**
     * Name of the playback restriction policy. If omitted, a deterministic
     * physical name is generated. Names are mutable — changing the name
     * updates the policy in place.
     */
    playbackRestrictionPolicyName?: string;
    /**
     * Tags to apply to the policy. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface PlaybackRestrictionPolicy extends Resource<"AWS.IVS.PlaybackRestrictionPolicy", PlaybackRestrictionPolicyProps, {
    /**
     * ARN of the playback restriction policy.
     */
    playbackRestrictionPolicyArn: string;
    /**
     * The policy's physical name.
     */
    playbackRestrictionPolicyName: string | undefined;
    /**
     * Country codes playback is allowed from.
     */
    allowedCountries: string[];
    /**
     * Origins playback is allowed from.
     */
    allowedOrigins: string[];
    /**
     * Whether strict origin enforcement is enabled.
     */
    enableStrictOriginEnforcement: boolean | undefined;
}, never, Providers> {
}
/**
 * An Amazon IVS playback restriction policy, constraining channel playback
 * by viewer country and/or request origin.
 *
 * Attach the policy to a channel via the channel's
 * `playbackRestrictionPolicyArn` prop. All policy settings are mutable and
 * update in place.
 * ### Restricting Playback
 * **Example:** Restrict Playback by Country and Origin
 * ```typescript
 * import * as IVS from "alchemy/AWS/IVS";
 *
 * const policy = yield* IVS.PlaybackRestrictionPolicy("GeoFence", {
 *   allowedCountries: ["US", "CA"],
 *   allowedOrigins: ["https://example.com"],
 * });
 * const channel = yield* IVS.Channel("LiveChannel", {
 *   playbackRestrictionPolicyArn: policy.playbackRestrictionPolicyArn,
 * });
 * ```
 *
 * **Example:** Strict Origin Enforcement
 * ```typescript
 * const policy = yield* IVS.PlaybackRestrictionPolicy("StrictFence", {
 *   allowedCountries: ["US"],
 *   allowedOrigins: ["https://example.com"],
 *   enableStrictOriginEnforcement: true,
 * });
 * ```
 *
 * @resource
 */
export declare const PlaybackRestrictionPolicy: import("../../Resource.ts").ResourceClass<PlaybackRestrictionPolicy>;
declare const IvsPlaybackRestrictionPolicyIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsPlaybackRestrictionPolicyIncomplete";
} & Readonly<A>;
/**
 * Raised when the IVS API returns a playback restriction policy missing
 * its ARN.
 */
export declare class IvsPlaybackRestrictionPolicyIncomplete extends IvsPlaybackRestrictionPolicyIncomplete_base<{
    message: string;
}> {
}
export declare const PlaybackRestrictionPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<PlaybackRestrictionPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=PlaybackRestrictionPolicy.d.ts.map