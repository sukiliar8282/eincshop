import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { App } from "./App.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* App(...)` and `App(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Fly IP family allocated onto an App. Dedicated `v4` is billed and may
 * be rejected when the org has no IPv4 quota. Prefer `v6` (free) or
 * `shared_v4` (free) in tests.
 */
export type IpAssignmentType = "v4" | "v6" | "shared_v4";
export interface IpAssignmentProps {
    /**
     * Parent Fly App. Accepts a `Fly.App` resource or an Effect that
     * produces one. Changing the App replaces the assignment.
     */
    app: Ref<App>;
    /**
     * Address family to allocate. `v6` is a dedicated IPv6 (free).
     * `shared_v4` is a shared Anycast IPv4 (free). `v4` is a dedicated
     * IPv4 (billed; may 400 when the org is over quota). Changing type
     * replaces the assignment.
     */
    type: IpAssignmentType;
    /**
     * Region for a dedicated address. Changing it replaces the assignment.
     */
    region?: string;
    /**
     * Isolated network name. Create-only; changing it replaces.
     */
    network?: string;
    /**
     * Organization slug. Defaults to the current token's org. Not a
     * replacement key.
     */
    orgSlug?: string;
    /**
     * Fly proxy service this address is bound to. Changing it replaces
     * the assignment.
     */
    serviceName?: string;
}
export type IpAssignment = Resource<"Fly.IpAssignment", IpAssignmentProps, {
    /** Physical Fly App name the address is assigned to. */
    appName: string;
    /** Allocated address. Identity of the assignment. */
    ip: string;
    /** Observed address family. */
    type: IpAssignmentType;
    /** Region for a dedicated address, if set. */
    region: string | undefined;
    /** Fly proxy service this address is bound to, if set. */
    serviceName: string | undefined;
    /** Whether the address is a shared Anycast IPv4. */
    shared: boolean;
    /** RFC3339 creation timestamp, if the API returned one. */
    createdAt: string | undefined;
}, never, Providers>;
declare const IpAssignmentResource: import("../Resource.ts").ResourceClass<IpAssignment>;
/**
 * A Fly.IpAssignment is an address on an {@link App}. A {@link Service}
 * publishes ports. Fly's proxy load-balances `{app}.fly.dev` across
 * Machines that publish a proxy service.
 *
 * Identity is the allocated `ip`. There is no in-place update.
 *
 * @see https://fly.io/docs/networking/services/
 *
 * ### Shared IPv4
 * `shared_v4` is a shared Anycast IPv4. It is free. This is what you
 * want for fly.dev over IPv4. Yield it next to the Service.
 *
 * **Example:** Allocate shared_v4
 * ```typescript
 * export const PublicIp = Fly.IpAssignment("Shared", {
 *   app: Site,
 *   type: "shared_v4",
 * });
 * ```
 *
 * :::caution[Changing `type` or `app` replaces the assignment]
 * A new address is allocated. The old one is released.
 * :::
 *
 * ### Dedicated IPv6
 * `v6` is a dedicated IPv6. It is free.
 *
 * **Example:** Allocate v6
 * ```typescript
 * export const V6 = Fly.IpAssignment("V6", {
 *   app: Site,
 *   type: "v6",
 * });
 * ```
 *
 * ### Dedicated IPv4
 * `v4` is a billed dedicated IPv4. It may 400 if the org has no
 * quota. Prefer `shared_v4` or `v6` in tests.
 *
 * **Example:** Allocate v4
 * ```typescript
 * export const Dedicated = Fly.IpAssignment("Dedicated", {
 *   app: Site,
 *   type: "v4",
 * });
 * ```
 *
 * ### Region
 * `region` pins a dedicated address. Shared Anycast ignores it. See
 * [Regions](/fly/compute/regions) for the list of codes.
 *
 * **Example:** Dedicated IPv4 in iad
 * ```typescript
 * export const Dedicated = Fly.IpAssignment("Dedicated", {
 *   app: Site,
 *   type: "v4",
 *   region: "iad",
 * });
 * ```
 *
 * :::caution[Changing `region` replaces the assignment]
 * A new address is allocated in the new region.
 * :::
 *
 * ### Service name
 * `serviceName` binds the address to a Fly proxy service. Changing it
 * replaces the assignment.
 *
 * **Example:** Bind to a named service
 * ```typescript
 * export const PublicIp = Fly.IpAssignment("Shared", {
 *   app: Site,
 *   type: "shared_v4",
 *   serviceName: "http",
 * });
 * ```
 *
 * :::caution[Changing `serviceName` replaces the assignment]
 * A new address is allocated bound to the new service.
 * :::
 *
 * ### Isolated network
 * `network` is an optional 6PN name. Create-only.
 *
 * **Example:** Custom network
 * ```typescript
 * export const Private = Fly.IpAssignment("Private", {
 *   app: Site,
 *   type: "v6",
 *   network: "private",
 * });
 * ```
 *
 * :::caution[Changing `network` replaces the assignment]
 * A new address is allocated on the new network.
 * :::
 *
 * ### Organization
 * `orgSlug` defaults to the current token's org. It is not a
 * replacement key.
 *
 * **Example:** Pin an org
 * ```typescript
 * export const PublicIp = Fly.IpAssignment("Shared", {
 *   app: Site,
 *   type: "shared_v4",
 *   orgSlug: "my-org",
 * });
 * ```
 *
 * ### Yield with a Service
 * Allocate the address on the same App as the Service. `api.url` is
 * `https://{appName}.fly.dev`.
 *
 * **Example:** Stack outputs
 * ```typescript
 * export default Alchemy.Stack(
 *   "MyApp",
 *   { providers: Fly.providers(), state: Alchemy.localState() },
 *   Effect.gen(function* () {
 *     const api = yield* Api;
 *     const ip = yield* PublicIp;
 *     return { url: api.url, ip: ip.ip };
 *   }),
 * );
 * ```
 *
 * @resource
 */
export declare const IpAssignment: typeof IpAssignmentResource;
declare const IpAssignmentNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.IpAssignmentNotCreated";
} & Readonly<A>;
export declare class IpAssignmentNotCreated extends IpAssignmentNotCreated_base<{
    appName: string;
    type: IpAssignmentType;
}> {
}
declare const IpAssignmentAppMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.IpAssignmentAppMissing";
} & Readonly<A>;
export declare class IpAssignmentAppMissing extends IpAssignmentAppMissing_base<{
    type: IpAssignmentType;
}> {
}
export declare const IpAssignmentProvider: () => import("effect/Layer").Layer<Provider.Provider<IpAssignment>, never, machines.FlyIoOpContext>;
export {};
//# sourceMappingURL=IpAssignment.d.ts.map