import * as Redacted from "effect/Redacted";
import * as Provider from "./Provider.ts";
import { Resource } from "./Resource.ts";
export type KeyPairAlgorithm = "ed25519" | "rsa" | "ec";
export interface KeyPairProps {
    /**
     * Key algorithm used to generate the pair.
     * @default "ed25519"
     */
    algorithm?: KeyPairAlgorithm;
    /**
     * Modulus length in bits. Only used when {@link algorithm} is `"rsa"`.
     * @default 2048
     */
    modulusLength?: number;
    /**
     * Named curve. Only used when {@link algorithm} is `"ec"`.
     * @default "P-256"
     */
    namedCurve?: string;
}
export type KeyPair = Resource<"Alchemy.KeyPair", KeyPairProps, {
    algorithm: KeyPairAlgorithm;
    privateKey: Redacted.Redacted<string>;
    publicKey: string;
}>;
/**
 * A deterministic-in-state public/private keypair generator.
 *
 * The keypair is generated once on first reconcile and then persisted in
 * state so subsequent deploys keep the same keys unless the resource is
 * replaced. `privateKey` is PEM-encoded `pkcs8` and `publicKey` is
 * PEM-encoded `spki`.
 *
 *
 * ### Generating a Keypair
 * **Example:** Default ed25519 keypair
 * ```typescript
 * const keys = yield* KeyPair("signing-key");
 * // keys.privateKey: Redacted<string>  (PEM pkcs8)
 * // keys.publicKey:  string            (PEM spki)
 * // keys.algorithm:  "ed25519"
 * ```
 *
 * **Example:** RSA keypair
 * ```typescript
 * const keys = yield* KeyPair("rsa-key", {
 *   algorithm: "rsa",
 *   modulusLength: 2048,
 * });
 * ```
 *
 * **Example:** EC keypair on a named curve
 * ```typescript
 * const keys = yield* KeyPair("ec-key", {
 *   algorithm: "ec",
 *   namedCurve: "P-256",
 * });
 * ```
 *
 * ### Consuming the Keys
 * **Example:** Pass the private key to a Worker as a secret
 * ```typescript
 * const keys = yield* KeyPair("signing-key");
 * export const Worker = Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   bindings: {
 *     SIGNING_KEY: keys.privateKey,
 *     PUBLIC_KEY: keys.publicKey,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const KeyPair: import("./Resource.ts").ResourceClass<KeyPair>;
export declare const KeyPairProvider: () => import("effect/Layer").Layer<Provider.Provider<KeyPair>, never, never>;
//# sourceMappingURL=KeyPair.d.ts.map