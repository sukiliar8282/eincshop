import { Random } from "../../Random.ts";
import * as Effect from "effect/Effect";
import * as Secret from "../SecretsStore/Secret.ts";
import { Store as SecretsStore } from "../SecretsStore/SecretsStore.ts";
/**
 * The account-wide Secrets Store that backs every secret used by the
 * state store worker. `SecretsStore` adopts the single store that
 * already exists on the account, or creates one if none exists.
 */
export declare const Store: Effect.Effect<SecretsStore, never, import("../Providers.ts").Providers>;
/**
 * The randomly generated bearer token value. Generated once on create
 * and persisted in alchemy state, so subsequent deploys keep the same
 * value unless the resource is replaced.
 */
export declare const TokenValue: Effect.Effect<Random, never, import("../../Provider.ts").Provider<Random>>;
/**
 * The name of the secret in the Cloudflare Secrets Store that contains the bearer token.
 */
export declare const AuthTokenSecretName: "AlchemyStateStoreToken";
/**
 * The bearer token used to authenticate every request to the state
 * store worker. The value comes from {@link TokenValue} and lives in
 * the account-wide Cloudflare Secrets Store so it can be bound into
 * the worker without bundling the raw string.
 */
export declare const AuthToken: Effect.Effect<Secret.Secret, never, import("../../Provider.ts").Provider<Random> | import("../Providers.ts").Providers>;
/**
 * A 32-byte (256-bit) random value, hex-encoded, that seeds the
 * AES-CTR key used to encrypt resource state at rest. Generated once
 * and persisted, so the ciphertext stored by the Durable Object can
 * always be decrypted by subsequent worker boots.
 */
export declare const EncryptionKeyValue: Effect.Effect<Random, never, import("../../Provider.ts").Provider<Random>>;
export declare const EncryptionKeySecretName: "AlchemyStateStoreEncryptionKey";
/**
 * The encryption key secret. The raw hex-encoded bytes live inside
 * Cloudflare's Secrets Store; the Durable Object binds to it at
 * runtime to derive an AES-CTR `CryptoKey` via Web Crypto's
 * `subtle.importKey`.
 */
export declare const EncryptionKey: Effect.Effect<Secret.Secret, never, import("../../Provider.ts").Provider<Random> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Token.d.ts.map