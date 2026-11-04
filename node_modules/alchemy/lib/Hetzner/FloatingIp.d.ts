import { Services } from "@distilled.cloud/hetzner";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type FloatingIpType = "ipv4" | "ipv6";
export interface FloatingIpProps {
    /**
     * Address family of the Floating IP. Cannot be changed after creation —
     * changing it triggers a replacement.
     */
    type: FloatingIpType;
    /**
     * Home Location for the Floating IP (`nbg1`, `fsn1`, `hel1`, …) or the
     * Location's numeric id. Routing is optimized for this Location. Cannot
     * be changed after creation — changing it triggers a replacement.
     */
    homeLocation: string | number;
    /**
     * Name of the Floating IP. Must be unique per Hetzner project. If
     * omitted, a unique name is generated from the stack, stage, and
     * logical ID.
     */
    name?: string;
    /**
     * Free-form description shown in the Hetzner Cloud Console.
     */
    description?: string | null;
    /**
     * User-defined labels (`key`/`value` pairs) applied to the Floating IP.
     * Alchemy ownership labels are added automatically.
     */
    labels?: Record<string, string>;
    /**
     * Prevent the Floating IP from being deleted via the API.
     * @default false
     */
    deleteProtection?: boolean;
}
export type FloatingIp = Resource<"Hetzner.FloatingIp", FloatingIpProps, {
    /**
     * Numeric Hetzner ID of the Floating IP.
     */
    id: number;
    /**
     * Name of the Floating IP.
     */
    name: string;
    /**
     * Address family of the Floating IP.
     */
    type: FloatingIpType;
    /**
     * Assigned address. For `ipv6` this is the `/64` network.
     */
    ip: string;
    /**
     * Home Location name (`nbg1`, `fsn1`, …).
     */
    homeLocation: string;
    /**
     * Numeric ID of the home Location.
     */
    homeLocationId: number;
    /**
     * Description of the Floating IP, or `null` if unset.
     */
    description: string | null;
    /**
     * Whether Hetzner has blocked the Floating IP.
     */
    blocked: boolean;
    /**
     * Whether delete protection is enabled.
     */
    deleteProtection: boolean;
    /**
     * User-defined labels (Alchemy ownership labels are stripped).
     */
    labels: Record<string, string>;
    /**
     * RFC3339 timestamp when the Floating IP was created.
     */
    created: string;
    /**
     * Numeric Server ID this Floating IP is assigned to, or `null` if
     * unassigned. Assignment is managed by `FloatingIpAssignment`.
     */
    serverId: number | null;
}, never, Providers>;
/**
 * An unassigned Hetzner Cloud Floating IP. Provide `type` and a
 * `homeLocation`; Alchemy generates a unique name unless you set `name`.
 * Assignment to a Server is a separate `FloatingIpAssignment` resource.
 *
 * `type` and `homeLocation` are immutable — changing either replaces the
 * Floating IP (new address). `name`, `description`, `labels`, and
 * `deleteProtection` update in place.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#floating-ips
 *
 * ### Creating a Floating IP
 * **Example:** Unassigned IPv4 in nbg1
 * ```typescript
 * const ip = yield* Hetzner.FloatingIp("public-ip", {
 *   type: "ipv4",
 *   homeLocation: "nbg1",
 * });
 * ```
 *
 * **Example:** IPv6 with description and labels
 * ```typescript
 * const ip = yield* Hetzner.FloatingIp("v6", {
 *   type: "ipv6",
 *   homeLocation: "nbg1",
 *   description: "edge anycast",
 *   labels: { role: "edge" },
 * });
 * ```
 *
 * ### Updating a Floating IP
 * **Example:** Rename and relabel
 * ```typescript
 * const ip = yield* Hetzner.FloatingIp("public-ip", {
 *   type: "ipv4",
 *   homeLocation: "nbg1",
 *   name: "public-ip-prod",
 *   description: "production frontend",
 *   labels: { env: "prod" },
 * });
 * ```
 *
 * @resource
 */
export declare const FloatingIp: import("../Resource.ts").ResourceClass<FloatingIp>;
declare const FloatingIpNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.FloatingIpNotCreated";
} & Readonly<A>;
export declare class FloatingIpNotCreated extends FloatingIpNotCreated_base<{
    name: string;
}> {
}
export declare const FloatingIpProvider: () => import("effect/Layer").Layer<Provider.Provider<FloatingIp>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=FloatingIp.d.ts.map