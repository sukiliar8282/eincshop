import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PlaybackKeyPairProps {
    /**
     * The PEM-encoded ECDSA P-384 public key to import. The corresponding
     * private key is held by the caller and used to sign viewer playback
     * authorization tokens for private channels. Changing the key material
     * replaces the key pair (the fingerprint and ARN change).
     */
    publicKeyMaterial: string;
    /**
     * Name of the playback key pair. If omitted, a deterministic physical
     * name is generated. Key pairs have no update operation, so changing
     * the name replaces the key pair.
     */
    playbackKeyPairName?: string;
    /**
     * Tags to apply to the key pair. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface PlaybackKeyPair extends Resource<"AWS.IVS.PlaybackKeyPair", PlaybackKeyPairProps, {
    /**
     * The key pair's physical name.
     */
    playbackKeyPairName: string;
    /**
     * ARN of the imported playback key pair.
     */
    playbackKeyPairArn: string;
    /**
     * Fingerprint of the imported public key.
     */
    fingerprint: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon IVS playback key pair for private channels.
 *
 * Import the public half of an ECDSA P-384 key pair; sign viewer playback
 * authorization tokens with the private half. Channels created with
 * `authorized: true` require viewers to present a token signed by an
 * imported key pair.
 * ### Importing a Key Pair
 * **Example:** Private Channel Playback Authorization
 * ```typescript
 * import * as IVS from "alchemy/AWS/IVS";
 *
 * const keyPair = yield* IVS.PlaybackKeyPair("ViewerAuth", {
 *   publicKeyMaterial: PUBLIC_KEY_PEM, // ECDSA P-384 public key
 * });
 * const channel = yield* IVS.Channel("PrivateChannel", {
 *   authorized: true,
 * });
 * ```
 *
 * @resource
 */
export declare const PlaybackKeyPair: import("../../Resource.ts").ResourceClass<PlaybackKeyPair>;
declare const IvsPlaybackKeyPairIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsPlaybackKeyPairIncomplete";
} & Readonly<A>;
/**
 * Raised when the IVS API returns a playback key pair missing its ARN or
 * name.
 */
export declare class IvsPlaybackKeyPairIncomplete extends IvsPlaybackKeyPairIncomplete_base<{
    message: string;
}> {
}
export declare const PlaybackKeyPairProvider: () => import("effect/Layer").Layer<Provider.Provider<PlaybackKeyPair>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=PlaybackKeyPair.d.ts.map