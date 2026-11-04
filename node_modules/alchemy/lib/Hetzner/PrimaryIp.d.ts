import { Services } from "@distilled.cloud/hetzner";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type PrimaryIpType = "ipv4" | "ipv6";
export interface PrimaryIpProps {
    /**
     * Address family. Cannot be changed after creation — changing it
     * triggers a replacement.
     */
    type: PrimaryIpType;
    /**
     * Location name (`nbg1`, `fsn1`, `hel1`, …) or numeric Location ID.
     * Required unless `datacenter` is set. Cannot be changed after
     * creation — changing it triggers a replacement.
     */
    location?: string | number;
    /**
     * Datacenter name (`nbg1-dc3`, `fsn1-dc14`, …) or numeric Datacenter
     * ID. Alternative to `location`; a name is mapped onto the parent
     * Location (`nbg1-dc3` → `nbg1`). Cannot be changed after creation —
     * changing it triggers a replacement.
     */
    datacenter?: string | number;
    /**
     * Name of the Primary IP. Must be unique per Hetzner project. If
     * omitted, a unique name is generated from the stack, stage, and
     * logical ID.
     */
    name?: string;
    /**
     * If enabled, Hetzner deletes this Primary IP when its assigned
     * resource is deleted.
     * @default false
     */
    autoDelete?: boolean;
    /**
     * User-defined labels (`key`/`value` pairs) applied to the Primary IP.
     * Alchemy ownership labels are added automatically.
     */
    labels?: Record<string, string>;
    /**
     * Prevent the Primary IP from being deleted via the API.
     * @default false
     */
    deleteProtection?: boolean;
}
export type PrimaryIp = Resource<"Hetzner.PrimaryIp", PrimaryIpProps, {
    /**
     * Numeric Hetzner ID of the Primary IP.
     */
    id: number;
    /**
     * Name of the Primary IP.
     */
    name: string;
    /**
     * Address family of the Primary IP.
     */
    type: PrimaryIpType;
    /**
     * Assigned address. For `ipv6` this is the `/64` network.
     */
    ip: string;
    /**
     * Location name the IP is bound to (`nbg1`, `fsn1`, …).
     */
    location: string;
    /**
     * Numeric Location id.
     */
    locationId: number;
    /**
     * Datacenter name or id from props, when the resource was placed via
     * `datacenter`. Not returned by the API.
     */
    datacenter: string | undefined;
    /**
     * Whether Hetzner has blocked the Primary IP.
     */
    blocked: boolean;
    /**
     * Auto-delete flag.
     */
    autoDelete: boolean;
    /**
     * Assigned resource id, or `null` if unassigned.
     */
    assigneeId: number | null;
    /**
     * Assigned resource type (`server`), when assigned.
     */
    assigneeType: string | undefined;
    /**
     * RFC3339 timestamp when the Primary IP was created.
     */
    created: string;
    /**
     * User-defined labels (Alchemy ownership labels are stripped).
     */
    labels: Record<string, string>;
    /**
     * Whether delete protection is enabled.
     */
    deleteProtection: boolean;
}, never, Providers>;
/**
 * An unassigned Hetzner Cloud Primary IP. Provide `type` and either a
 * `location` or a `datacenter`; Alchemy generates a unique name unless
 * you set `name`. Assignee wiring is a later resource.
 *
 * `type`, `location`, and `datacenter` are immutable — changing any of
 * them replaces the Primary IP (new address). `name`, `autoDelete`,
 * `labels`, and `deleteProtection` update in place.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#primary-ips
 *
 * ### Creating a Primary IP
 * **Example:** IPv6 in Nuremberg
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("web-ipv6", {
 *   type: "ipv6",
 *   location: "nbg1",
 * });
 * ```
 *
 * **Example:** IPv4 placed by datacenter
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("web-ipv4", {
 *   type: "ipv4",
 *   datacenter: "nbg1-dc3",
 * });
 * ```
 *
 * ### Labels and auto-delete
 * **Example:** Named IP with labels
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("mail", {
 *   name: "mail-ipv4",
 *   type: "ipv4",
 *   location: "fsn1",
 *   autoDelete: false,
 *   labels: { role: "mail" },
 * });
 * ```
 *
 * @resource
 */
export declare const PrimaryIp: import("../Resource.ts").ResourceClass<PrimaryIp>;
declare const PrimaryIpPlacementRequired_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.PrimaryIpPlacementRequired";
} & Readonly<A>;
export declare class PrimaryIpPlacementRequired extends PrimaryIpPlacementRequired_base<{
    message: string;
}> {
}
/**
 * Hetzner datacenter names are `{location}-dc{n}` (e.g. `nbg1-dc3`).
 * Numeric ids are passed through — Locations use a different id space.
 */
export declare const locationFromDatacenter: (datacenter: string | number) => string | number;
export declare const PrimaryIpProvider: () => import("effect/Layer").Layer<Provider.Provider<PrimaryIp>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=PrimaryIp.d.ts.map