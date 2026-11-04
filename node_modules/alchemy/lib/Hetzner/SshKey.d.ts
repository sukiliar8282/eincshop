import { Services } from "@distilled.cloud/hetzner";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type SshKeyProps = {
    /**
     * Name of the SSH key. Must be unique per Hetzner project. If omitted,
     * a unique name is generated from the stack, stage, and logical id.
     */
    name?: string;
    /**
     * OpenSSH-format public key. Changing it replaces the SSH key.
     */
    publicKey: string;
    /**
     * User-defined labels (`key/value` pairs). Alchemy ownership labels are
     * merged in automatically.
     */
    labels?: Record<string, string>;
};
export type SshKey = Resource<"Hetzner.SshKey", SshKeyProps, {
    /** Numeric Hetzner SSH key id. */
    id: number;
    /** Name of the SSH key (unique per project). */
    name: string;
    /** MD5 fingerprint of the public key (`aa:bb:…`). */
    fingerprint: string;
    /** Public key as stored by Hetzner. */
    publicKey: string;
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
    /** RFC3339 creation timestamp. */
    created: string;
}, never, Providers>;
/**
 * A Hetzner Cloud SSH key. Public keys are injected into Servers at create
 * time. The public key is immutable — changing it replaces the key.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#ssh-keys
 *
 * ### Creating an SSH Key
 * **Example:** Generated name
 * ```typescript
 * const key = yield* Hetzner.SshKey("deploy", {
 *   publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI… user@host",
 * });
 * ```
 *
 * **Example:** Explicit name and labels
 * ```typescript
 * const key = yield* Hetzner.SshKey("deploy", {
 *   name: "deploy-key",
 *   publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI… user@host",
 *   labels: { role: "deploy" },
 * });
 * ```
 *
 * @resource
 */
export declare const SshKey: import("../Resource.ts").ResourceClass<SshKey>;
declare const SshKeyNotResolved_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.SshKeyNotResolved";
} & Readonly<A>;
export declare class SshKeyNotResolved extends SshKeyNotResolved_base<{
    name: string;
}> {
}
export declare const SshKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<SshKey>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=SshKey.d.ts.map