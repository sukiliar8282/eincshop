import * as iam from "@distilled.cloud/aws/iam";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SSHPublicKeyProps {
    /**
     * User that owns the SSH public key.
     */
    userName: string;
    /**
     * SSH public key body.
     */
    sshPublicKeyBody: string;
    /**
     * Desired key status.
     * @default "Active"
     */
    status?: iam.StatusType;
}
export interface SSHPublicKey extends Resource<"AWS.IAM.SSHPublicKey", SSHPublicKeyProps, {
    /** The IAM user the SSH public key belongs to. */
    userName: string;
    /** The unique ID of the SSH public key. */
    sshPublicKeyId: string;
    /** The MD5 fingerprint of the SSH public key. */
    fingerprint: string;
    /** The SSH public key material. */
    sshPublicKeyBody: string;
    /** Whether the key is `Active` or `Inactive`. */
    status: iam.StatusType;
    /** When the key was uploaded. */
    uploadDate: Date | undefined;
}, never, Providers> {
}
/**
 * An IAM SSH public key for CodeCommit-compatible workflows.
 *
 * `SSHPublicKey` uploads and manages a user's public key for services such as
 * AWS CodeCommit that authenticate through IAM-backed SSH credentials.
 * ### Managing SSH Keys
 * **Example:** Upload an SSH Public Key
 * ```typescript
 * const user = yield* User("GitUser", {
 *   userName: "codecommit-user",
 * });
 *
 * const key = yield* SSHPublicKey("GitKey", {
 *   userName: user.userName,
 *   sshPublicKeyBody: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample codecommit-user",
 * });
 * ```
 *
 * @resource
 */
export declare const SSHPublicKey: import("../../Resource.ts").ResourceClass<SSHPublicKey>;
export declare const SSHPublicKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<SSHPublicKey>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=SSHPublicKey.d.ts.map