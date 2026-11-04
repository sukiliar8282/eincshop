import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type KeyPairId<ID extends string = string> = `key-${ID}`;
/** Key algorithm for a generated EC2 key pair. */
export type KeyPairType = "rsa" | "ed25519";
/** Private-key file format for a generated EC2 key pair. */
export type KeyPairFormat = "pem" | "ppk";
export interface KeyPairProps {
    /**
     * Name of the key pair. If omitted, a unique name is generated from the
     * stack, stage, and logical id. Changing it replaces the key pair.
     */
    keyName?: string;
    /**
     * Algorithm used when Alchemy generates the key pair. Ignored when
     * {@link publicKeyMaterial} is supplied (an imported key keeps its own type).
     * Changing it replaces the key pair.
     * @default "rsa"
     */
    keyType?: KeyPairType;
    /**
     * Format of the returned private key material. Only meaningful when Alchemy
     * generates the key pair. Changing it replaces the key pair.
     * @default "pem"
     */
    keyFormat?: KeyPairFormat;
    /**
     * Public key material (PEM or OpenSSH) to import instead of generating a new
     * key pair. When set, AWS stores only the public key — no `privateKey` is
     * returned. Changing it replaces the key pair.
     */
    publicKeyMaterial?: string;
    /**
     * Tags to assign to the key pair. Merged with the alchemy auto-tags.
     */
    tags?: Record<string, string>;
}
export interface KeyPair extends Resource<"AWS.EC2.KeyPair", KeyPairProps, {
    /** The ID of the key pair (e.g. `key-0123456789abcdef0`). */
    keyPairId: KeyPairId;
    /** The name of the key pair. */
    keyName: string;
    /** SHA-1/MD5 fingerprint of the key pair. */
    keyFingerprint: string;
    /** The algorithm of the key pair. */
    keyType: KeyPairType;
    /**
     * The unencrypted PEM/PPK private key material. Only present when Alchemy
     * generated the key pair (not when {@link KeyPairProps.publicKeyMaterial}
     * was imported). AWS returns this exactly once, at create time; it is then
     * persisted as a secret in alchemy state.
     */
    privateKey?: Redacted.Redacted<string>;
}, never, Providers> {
}
/**
 * An EC2 key pair used to grant SSH access to instances launched with its
 * `keyName`.
 *
 * By default Alchemy asks EC2 to generate the key pair and captures the
 * private key (returned only once, at create time) as a secret in state. Pass
 * {@link KeyPairProps.publicKeyMaterial} to import your own public key instead,
 * in which case no private key is stored.
 *
 * ### Creating a Key Pair
 * **Example:** Generated key pair
 * ```typescript
 * const keyPair = yield* AWS.EC2.KeyPair("DeployKey", {
 *   keyType: "ed25519",
 * });
 * // keyPair.keyName       -> pass to AWS.EC2.Instance({ keyName })
 * // keyPair.privateKey    -> Redacted<string> (the PEM private key)
 * ```
 *
 * **Example:** Imported public key
 * ```typescript
 * const keyPair = yield* AWS.EC2.KeyPair("ImportedKey", {
 *   publicKeyMaterial: "ssh-ed25519 AAAAC3Nz... user@host",
 * });
 * ```
 *
 * @resource
 */
export declare const KeyPair: import("../../Resource.ts").ResourceClass<KeyPair>;
export declare const KeyPairProvider: () => import("effect/Layer").Layer<Provider.Provider<KeyPair>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=KeyPair.d.ts.map