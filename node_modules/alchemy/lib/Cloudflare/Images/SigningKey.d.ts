import * as images from "@distilled.cloud/cloudflare/images";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Images.SigningKey";
type TypeId = typeof TypeId;
export interface SigningKeyProps {
    /**
     * Account the signing key is created in. Defaults to the ambient
     * Cloudflare account. Changing it triggers a replacement.
     */
    accountId?: string;
    /**
     * Name of the signing key — the PUT path identifier. If omitted, a unique
     * name is generated from the app, stage, and logical ID. Changing the
     * name triggers a replacement.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
}
export interface SigningKeyAttributes {
    /** The signing key's name (its API path identifier). */
    keyName: string;
    /** Account the key belongs to. */
    accountId: string;
    /** The HMAC key material used to sign image delivery URLs. */
    value: Redacted.Redacted<string>;
}
export type SigningKey = Resource<TypeId, SigningKeyProps, SigningKeyAttributes, never, Providers>;
/**
 * A Cloudflare Images signing key — an HMAC key used to generate signed
 * image delivery URLs (`?sig=` tokens) for images that require signed URLs.
 *
 * Cloudflare allows at most **two** keys per account, supporting a
 * create-second/migrate/delete-first rotation model, and refuses to delete
 * the last remaining key. Re-PUTting an existing key name **rotates** (i.e.
 * regenerates) its value, so this resource is existence-only: once the key
 * exists, redeploys never re-PUT and the key material stays stable.
 *
 * Requires the Cloudflare Images subscription; accounts without it receive
 * the typed `ImagesAccessNotEnabled` error.
 * ### Creating a Signing Key
 * **Example:** Key with a generated name
 * ```typescript
 * const key = yield* Cloudflare.Images.SigningKey("UrlSigner", {});
 * ```
 *
 * **Example:** Key with an explicit name
 * ```typescript
 * const key = yield* Cloudflare.Images.SigningKey("UrlSigner", {
 *   name: "my-app-signer",
 * });
 * ```
 *
 * ### Using the key
 * **Example:** Signing image delivery URLs server-side
 * ```typescript
 * // The key material is redacted — pass it to your URL signer:
 * const secret = key.value; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/images/manage-images/serve-images/serve-private-images/
 *
 * @resource
 * @product Images
 * @category Media
 */
export declare const SigningKey: import("../../Resource.ts").ResourceClass<SigningKey>;
/**
 * Returns true if the given value is an SigningKey resource.
 */
export declare const isSigningKey: (value: unknown) => value is SigningKey;
export declare const SigningKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<SigningKey>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | images.CloudflareOpContext>;
export {};
//# sourceMappingURL=SigningKey.d.ts.map