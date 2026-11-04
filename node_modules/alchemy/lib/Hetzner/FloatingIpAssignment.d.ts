import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
declare const FloatingIpAssignmentError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FloatingIpAssignmentError";
} & Readonly<A>;
export declare class FloatingIpAssignmentError extends FloatingIpAssignmentError_base<{
    message: string;
}> {
}
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* FloatingIp(...)` and `FloatingIp(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Floating IP identity this assignment binds. Accepts a
 * `Hetzner.FloatingIp` resource or an `{ id }` stub.
 */
export type FloatingIpAssignmentIp = {
    readonly id: number;
};
/**
 * Server identity a Floating IP can be assigned to. Accepts a
 * `Hetzner.Server` resource or a `{ serverId }` stub.
 */
export type FloatingIpAssignmentServer = {
    readonly serverId: number;
};
export interface FloatingIpAssignmentProps {
    /**
     * Floating IP to assign. Accepts a `Hetzner.FloatingIp` or `{ id }`.
     * Changing it updates the assignment in place (previous IP is
     * unassigned).
     */
    floatingIp: Ref<FloatingIpAssignmentIp>;
    /**
     * Server to assign the Floating IP to. Accepts a `Hetzner.Server` or
     * `{ serverId }`. Changing it updates the assignment in place.
     */
    server: Ref<FloatingIpAssignmentServer>;
}
export type FloatingIpAssignment = Resource<"Hetzner.FloatingIpAssignment", FloatingIpAssignmentProps, {
    /**
     * Numeric Hetzner ID of the assigned Floating IP.
     */
    floatingIpId: number;
    /**
     * Numeric Hetzner ID of the Server the Floating IP is assigned to.
     */
    serverId: number;
}, never, Providers>;
/**
 * Assigns a Hetzner Cloud {@link FloatingIp} to a Server. The assignment
 * is existence-only: observe the Floating IP and ensure it is bound to
 * the Server. Changing either reference updates in place (the previous
 * IP is unassigned, then the new pair is assigned).
 *
 * A Floating IP can be assigned to at most one Server at a time. A Server
 * may hold many Floating IPs. Destroying the assignment unassigns the IP
 * but leaves both the Floating IP and the Server in place.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#floating-ip-actions-assign-a-floating-ip-to-a-server
 *
 * ### Assigning a Floating IP
 * **Example:** Assign an IPv4 to a Server
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   image: "ubuntu-24.04",
 *   serverType: "cx23",
 *   location: "nbg1",
 * });
 * const ip = yield* Hetzner.FloatingIp("public-ip", {
 *   type: "ipv4",
 *   homeLocation: "nbg1",
 * });
 * const assignment = yield* Hetzner.FloatingIpAssignment("public-ip-web", {
 *   floatingIp: ip,
 *   server,
 * });
 * ```
 *
 * **Example:** Assign with stub identities
 * ```typescript
 * const assignment = yield* Hetzner.FloatingIpAssignment("public-ip-web", {
 *   floatingIp: { id: 123 },
 *   server: { serverId: 42 },
 * });
 * ```
 *
 * @resource
 */
export declare const FloatingIpAssignment: import("../Resource.ts").ResourceClass<FloatingIpAssignment>;
export declare const FloatingIpAssignmentProvider: () => import("effect/Layer").Layer<Provider.Provider<FloatingIpAssignment>, never, Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=FloatingIpAssignment.d.ts.map