import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* SshKey(...)` and `SshKey(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * SSH key identity injected at create time. Accepts a `Hetzner.SshKey`
 * resource or a `{ id }` stub.
 */
export type ServerSshKey = {
    readonly id: number;
};
/**
 * Private Network identity. Accepts a `Hetzner.Network` resource or a
 * `{ networkId }` stub.
 */
export type ServerNetwork = {
    readonly networkId: number;
};
/**
 * Firewall identity applied to the public NIC. Accepts a
 * `Hetzner.Firewall` resource or a `{ id }` stub.
 */
export type ServerFirewall = {
    readonly id: number;
};
/**
 * Volume identity attached at create/sync time. Accepts a
 * `Hetzner.Volume` resource or a `{ id }` stub.
 */
export type ServerVolume = {
    readonly id: number;
};
/**
 * Placement Group identity. Accepts a `Hetzner.PlacementGroup` resource
 * or a `{ id }` stub.
 */
export type ServerPlacementGroup = {
    readonly id: number;
};
export type ServerStatus = "running" | "initializing" | "starting" | "stopping" | "off" | "deleting" | "migrating" | "rebuilding" | "unknown";
export interface ServerProps {
    /**
     * Server name. Must be unique per project and a valid RFC 1123
     * hostname (letters, digits, periods, dashes). If omitted, a unique
     * name is generated from the stack, stage and logical ID.
     */
    name?: string;
    /**
     * Server type name (`cpx12`, `cx23`, …) or numeric id. Cannot be
     * changed after creation — changing it replaces the Server.
     */
    serverType: string;
    /**
     * Image name (`ubuntu-24.04`, …) or numeric id the Server is created
     * from. Cannot be changed after creation — changing it replaces the
     * Server.
     */
    image: string;
    /**
     * Location name (`nbg1`, `fsn1`, `hel1`, …) or numeric id. Cannot be
     * changed after creation — changing it replaces the Server.
     *
     * @default "nbg1"
     */
    location?: string;
    /**
     * SSH keys injected at create time. Accepts `Hetzner.SshKey` resources
     * or `{ id }` stubs. Hetzner cannot change injected keys after
     * create — this list is applied only when the Server is provisioned.
     */
    sshKeys?: Array<Ref<ServerSshKey>>;
    /**
     * Private Networks to attach. Accepts `Hetzner.Network` resources or
     * `{ networkId }` stubs. Synced on update when set.
     */
    networks?: Array<Ref<ServerNetwork>>;
    /**
     * Firewalls applied to the public NIC. Accepts `Hetzner.Firewall`
     * resources or `{ id }` stubs. Synced on update when set.
     */
    firewalls?: Array<Ref<ServerFirewall>>;
    /**
     * Volumes to attach. Accepts `Hetzner.Volume` resources or `{ id }`
     * stubs. Synced on update when set. Omit to leave Volume-side attach
     * alone.
     */
    volumes?: Array<Ref<ServerVolume>>;
    /**
     * Placement Group to assign. Accepts a `Hetzner.PlacementGroup` or
     * `{ id }`. Synced on update when set.
     */
    placementGroup?: Ref<ServerPlacementGroup>;
    /**
     * Cloud-init user data run on the Server's **first boot** — the place to
     * install packages, write config files, or add users.
     *
     * Accepts a shell script (`#!/bin/bash …`), a `#cloud-config` document,
     * or a bare shell snippet (a `#!/bin/bash` shebang is added for you).
     * Alchemy combines it with its own bootstrap script (which preinstalls
     * Node 26 for `Hetzner.Service`) into a multipart cloud-init document, so
     * both run — the bootstrap first. A document that already starts with a
     * `Content-Type:` / `MIME-Version:` header is passed through untouched,
     * taking over the whole payload including the bootstrap.
     *
     * Capped at 32 KiB (Hetzner's limit) after composition.
     *
     * Cloud-init only runs once, on first boot, so changing this replaces
     * the Server.
     */
    userData?: string;
    /**
     * Attach a public IPv4. Applied only at create time.
     *
     * @default true
     */
    enableIpv4?: boolean;
    /**
     * Attach a public IPv6. Applied only at create time.
     *
     * @default true
     */
    enableIpv6?: boolean;
    /**
     * Power the Server on after create.
     *
     * @default true
     */
    startAfterCreate?: boolean;
    /**
     * Prevent the Server from being deleted or rebuilt via the API until
     * this is cleared. The provider disables protection before delete.
     *
     * @default false
     */
    deleteProtection?: boolean;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack` /
     * `alchemy.stage` / `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
}
export type Server = Resource<"Hetzner.Server", ServerProps, {
    /** Numeric Hetzner Server ID. */
    id: number;
    /**
     * Same as {@link id}. Present so Volume / Firewall `server` /
     * `applyTo` props accept this resource directly.
     */
    serverId: number;
    /** Server name (unique per project). */
    name: string;
    /** Server status. */
    status: ServerStatus;
    /** Server type name (`cx22`, …). */
    serverType: string;
    /** Numeric Server type id. */
    serverTypeId: number;
    /** Image name, or `undefined` for snapshot/backup images without a name. */
    image: string | undefined;
    /** Numeric Image id, or `undefined` if no image is attached. */
    imageId: number | undefined;
    /** Location name (`nbg1`, `fsn1`, …). */
    location: string;
    /** Numeric location ID. */
    locationId: number;
    /** Public IPv4 address, or `undefined` if IPv4 is disabled. */
    ipv4: string | undefined;
    /** Public IPv6 network (`…/64`), or `undefined` if IPv6 is disabled. */
    ipv6: string | undefined;
    /** Attached Volume IDs. */
    volumeIds: number[];
    /** Attached private Network IDs. */
    networkIds: number[];
    /** Firewall IDs applied to the public NIC. */
    firewallIds: number[];
    /** Placement Group ID, or `undefined` if unassigned. */
    placementGroupId: number | undefined;
    /** Whether delete/rebuild protection is enabled. */
    deleteProtection: boolean;
    /** RFC3339 creation timestamp. */
    created: string;
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
    /**
     * Alchemy-managed deploy SSH private key (PKCS8 PEM). Injected at
     * create via a companion SSH key so `Hetzner.Ssh` / `Hetzner.Service`
     * can reach the box. Persisted in state; not present on adopted
     * foreign servers.
     */
    privateKey?: Redacted.Redacted<string>;
    /** Numeric id of the Alchemy-managed deploy SSH key. */
    deploySshKeyId?: number;
}, {
    /** Environment variables collected from bindings. */
    env?: Record<string, any>;
    /**
     * Volumes to attach and mount. Collected from `Hetzner.MountVolume`
     * when the Server is the bind host.
     */
    volumes?: Array<{
        volumeId: number;
        path: string;
    }>;
}, Providers>;
/**
 * A Hetzner Cloud Server — a virtual machine in a Location, created from
 * a Server type and an Image. `serverType`, `image`, and `location` are
 * immutable (changing any of them replaces the Server). Name, labels,
 * delete protection, and (when set) Networks / Firewalls / Volumes /
 * Placement Group update in place. SSH keys are injected only at create.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#servers
 *
 * ### Creating a Server
 * **Example:** Basic Server
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * ```
 *
 * **Example:** Named Server with labels
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   name: "app-web",
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 *   labels: { role: "web" },
 * });
 * ```
 *
 * ### Attachments
 * **Example:** SSH key and Placement Group
 * ```typescript
 * const key = yield* Hetzner.SshKey("deploy", {
 *   publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI… user@host",
 * });
 * const group = yield* Hetzner.PlacementGroup("web");
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 *   sshKeys: [key],
 *   placementGroup: group,
 * });
 * ```
 *
 * ### Custom init script
 * **Example:** Install packages on first boot
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   userData: `#!/bin/bash
 * apt-get update
 * DEBIAN_FRONTEND=noninteractive apt-get install -y nginx
 * systemctl enable --now nginx`,
 * });
 * ```
 *
 * **Example:** cloud-config document
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   userData: `#cloud-config
 * packages:
 *   - nginx
 *   - postgresql-client`,
 * });
 * ```
 *
 * `userData` is merged with Alchemy's own bootstrap script into a
 * multipart cloud-init document, so both run. It is applied on first boot
 * only — changing it replaces the Server.
 *
 * @resource
 */
export declare const Server: import("../Resource.ts").ResourceClass<Server>;
declare const ServerNotResolved_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.ServerNotResolved";
} & Readonly<A>;
export declare class ServerNotResolved extends ServerNotResolved_base<{
    name: string;
}> {
}
declare const ServerUserDataTooLarge_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.ServerUserDataTooLarge";
} & Readonly<A>;
/**
 * The composed cloud-init document (Alchemy's bootstrap plus the Server's
 * `userData`) exceeds Hetzner's 32 KiB user-data limit.
 */
export declare class ServerUserDataTooLarge extends ServerUserDataTooLarge_base<{
    name: string;
    bytes: number;
    limit: number;
}> {
}
/**
 * Compose the cloud-init document sent at create: Alchemy's bootstrap
 * script plus the caller's `userData`, if any.
 */
export declare const composeUserData: (userData: string | undefined) => string;
export declare const ServerProvider: () => import("effect/Layer").Layer<Provider.Provider<Server>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Server.d.ts.map