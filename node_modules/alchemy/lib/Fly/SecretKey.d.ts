import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { App } from "./App.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* App(...)` and `App(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
export interface SecretKeyProps {
    /**
     * Parent Fly App. Changing it replaces the secret key.
     */
    app: Ref<App>;
    /**
     * Secret key name, unique per App. If omitted, a unique name is generated
     * from the stack, stage and logical ID (the ownership stamp). Changing it
     * replaces the key.
     */
    name?: string;
    /**
     * Fly key type (`nacl_sign`, `nacl_box`, `hs256`, `hs384`, `hs512`,
     * `xaes256gcm`, `nacl_auth`, `nacl_secretbox`, `es256`). Changing it
     * replaces the key.
     */
    type?: string;
    /**
     * Raw key material. If omitted, Fly generates a key via
     * `generateSecretKey`. If set, the key is created or updated with
     * `setSecretKey`. Never persisted in state.
     */
    value?: ReadonlyArray<number>;
}
export type SecretKey = Resource<"Fly.SecretKey", SecretKeyProps, {
    /** Parent Fly App name. */
    appName: string;
    /** Secret key name (unique per App). */
    name: string;
    /** Observed Fly key type. */
    type: string | undefined;
    /** Public key (base64), when the type has one. Never private material. */
    publicKey: string | undefined;
    /** RFC3339 creation timestamp. */
    createdAt: string | undefined;
    /** RFC3339 last-update timestamp. */
    updatedAt: string | undefined;
}, never, Providers>;
declare const SecretKeyResource: import("../Resource.ts").ResourceClass<SecretKey>;
/**
 * A Fly.SecretKey is an App KMS key, not an env secret. Generate a
 * random key or set raw material. Private bytes never appear in
 * attributes.
 *
 * Use it at runtime with {@link Encrypt}, {@link Decrypt}, {@link Sign},
 * and {@link Verify}. Generate, set, and delete stay on this resource.
 *
 * @see https://docs.machines.dev/secrets/Secretkeys_list
 *
 * ### Generate a key
 * Omit `value` and Fly generates a key via `generateSecretKey`. `type`
 * is Fly's key type (`nacl_sign`, `nacl_box`, `nacl_secretbox`,
 * `hs256`, `hs384`, `hs512`, `xaes256gcm`, `nacl_auth`, `es256`, …).
 *
 * **Example:** Signing key
 * ```typescript
 * export const Signing = Fly.SecretKey("Signing", {
 *   app: Site,
 *   type: "nacl_sign",
 * });
 * ```
 *
 * :::caution[Changing `app`, `name`, or `type` replaces the key]
 * The new key is created. The old one is deleted. Ciphertext from the
 * old key will not decrypt.
 * :::
 *
 * ### Set raw material
 * Pass `value` as bytes. The key is created or updated with
 * `setSecretKey`. Never persisted in state.
 *
 * **Example:** HS256
 * ```typescript
 * const hmac = yield* Fly.SecretKey("Hmac", {
 *   app: Site,
 *   type: "hs256",
 *   value: hmacBytes,
 * });
 * ```
 *
 * ### Encrypt
 * Bind {@link Encrypt} to a box/secretbox/AEAD key. Provide
 * {@link EncryptHttp}. Optional `associatedData` is AEAD associated
 * data.
 *
 * Fly crypto ops need a KMS token. Org API tokens are typed
 * `Forbidden`. Encrypt and sign from a {@link Service}, not a laptop
 * Action.
 *
 * **Example:** Encrypt a payload
 * ```typescript
 * const encrypt = yield* Fly.Encrypt(Box);
 * const { ciphertext } = yield* encrypt({
 *   plaintext: new TextEncoder().encode("attack at dawn"),
 * });
 * ```
 *
 * ### Decrypt
 * Bind {@link Decrypt} to the same key. Plaintext comes back
 * `Redacted`. Unwrap with `Redacted.value`. `associatedData` must
 * match encryption. Provide {@link DecryptHttp}.
 *
 * **Example:** Decrypt a payload
 * ```typescript
 * const decrypt = yield* Fly.Decrypt(Box);
 * const { plaintext } = yield* decrypt({ ciphertext });
 * const bytes = Redacted.value(plaintext);
 * ```
 *
 * ### Sign
 * Bind {@link Sign} to a signing key (`nacl_sign`, `hs256`, `es256`,
 * …). The private key never leaves Fly KMS. Provide {@link SignHttp}.
 *
 * **Example:** Sign a payload
 * ```typescript
 * const sign = yield* Fly.Sign(Signing);
 * const { signature } = yield* sign({
 *   plaintext: new TextEncoder().encode("release-manifest-v1"),
 * });
 * ```
 *
 * ### Verify
 * Bind {@link Verify} to the same key. A bad signature is a typed
 * error from the Machines API. Provide {@link VerifyHttp}.
 *
 * **Example:** Verify a signature
 * ```typescript
 * const verify = yield* Fly.Verify(Signing);
 * const { valid } = yield* verify({ plaintext, signature });
 * ```
 *
 * @resource
 */
export declare const SecretKey: typeof SecretKeyResource;
declare const SecretKeyNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.SecretKeyNotCreated";
} & Readonly<A>;
export declare class SecretKeyNotCreated extends SecretKeyNotCreated_base<{
    appName: string;
    name: string;
}> {
}
declare const SecretKeyAppRequired_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.SecretKeyAppRequired";
} & Readonly<A>;
export declare class SecretKeyAppRequired extends SecretKeyAppRequired_base<{
    message: string;
}> {
}
export declare const SecretKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<SecretKey>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | machines.FlyIoOpContext>;
export {};
//# sourceMappingURL=SecretKey.d.ts.map