import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Stream.SigningKey";
type TypeId = typeof TypeId;
export type SigningKeyProps = {};
export type SigningKeyAttributes = {
    /**
     * The unique identifier of the signing key.
     */
    keyId: string;
    /**
     * The Cloudflare account the signing key belongs to.
     */
    accountId: string;
    /**
     * The date and time the signing key was created.
     */
    created: string | undefined;
    /**
     * The signing key in PEM format. Only returned by Cloudflare at
     * creation time — preserved in state thereafter.
     */
    pem: Redacted.Redacted<string>;
    /**
     * The signing key in JWK format. Only returned by Cloudflare at
     * creation time — preserved in state thereafter.
     */
    jwk: Redacted.Redacted<string>;
};
export type SigningKey = Resource<TypeId, SigningKeyProps, SigningKeyAttributes, never, Providers>;
/**
 * A Cloudflare Stream signing key — an RSA key pair used to sign viewer
 * playback tokens for videos that require signed URLs.
 *
 * The key material (`pem`/`jwk`) is returned by Cloudflare **only at
 * creation time**; it is persisted as redacted attributes in state and
 * can never be re-read from the API. If the key is deleted out-of-band,
 * reconcile creates a brand-new key with new material — anything derived
 * from the old key (signed tokens) must be re-derived from the new
 * attributes.
 *
 * Requires the Stream subscription to be enabled on the account.
 * ### Creating a signing key
 * **Example:** Signing key for signed playback URLs
 * ```typescript
 * const key = yield* Cloudflare.Stream.SigningKey("PlaybackKey", {});
 *
 * // key.pem / key.jwk are Redacted<string> — use them server-side to
 * // sign playback tokens for videos with requireSignedURLs enabled.
 * const pem = key.pem;
 * ```
 *
 * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
 *
 * @resource
 * @product Stream
 * @category Media
 */
export declare const SigningKey: import("../../Resource.ts").ResourceClass<SigningKey>;
/**
 * Returns true if the given value is a SigningKey resource.
 */
export declare const isSigningKey: (value: unknown) => value is SigningKey;
export declare const SigningKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<SigningKey>, never, CloudflareEnvironment | stream.CloudflareOpContext>;
export {};
//# sourceMappingURL=SigningKey.d.ts.map