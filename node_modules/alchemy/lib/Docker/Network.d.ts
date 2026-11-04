import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { Docker } from "./Docker.ts";
import type { Providers } from "./Providers.ts";
export interface NetworkProps {
    /**
     * Docker network name.
     *
     * @default Generated from stack, stage, logical id, and instance id.
     */
    name?: string;
    /** Network driver. @default "bridge" */
    driver?: "bridge" | "host" | "none" | "overlay" | "macvlan" | (string & {});
    /** Enable IPv6 on the network. @default false */
    enableIPv6?: boolean;
    /** Network labels. */
    labels?: Record<string, string>;
    /**
     * The engine the network is created on: a Docker context name, a
     * `Docker.Context` resource, or a `Docker.Swarm` — overlay networks
     * require a swarm manager, and passing the swarm orders the network after
     * the swarm is initialized.
     */
    context?: Docker.EngineRef;
}
export interface Network extends Resource<"Docker.Network", NetworkProps, {
    /** Docker network ID. */
    id: string;
    /** Docker network name. */
    name: string;
    /** Network driver. */
    driver: string;
    /** Whether IPv6 is enabled. */
    enableIPv6: boolean;
    /** Labels reported by Docker. */
    labels: Record<string, string>;
    /** Creation timestamp in milliseconds since epoch. */
    createdAt: number;
}, never, Providers> {
}
/**
 * A Docker network managed through the active Docker context.
 *
 * Existing same-name networks are treated as foreign unless the engine is
 * explicitly allowed to adopt them with `--adopt` or `adopt(true)`.
 *
 *
 * ### Creating Networks
 * **Example:** Basic bridge network
 * ```typescript
 * const network = yield* Docker.Network("app-network", {
 *   name: "app-network",
 * });
 * ```
 *
 * ### Adoption
 * **Example:** Adopt a pre-existing network
 * ```typescript
 * const network = yield* Docker.Network("app-network", {
 *   name: "shared-app-network",
 * }).pipe(adopt(true));
 * ```
 *
 * @resource
 */
export declare const Network: import("../Resource.ts").ResourceClass<Network>;
export declare const NetworkProvider: () => import("effect/Layer").Layer<Provider.Provider<Network>, never, Docker | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export declare const toNetworkAttributes: (info: Docker.Network) => Network["Attributes"];
//# sourceMappingURL=Network.d.ts.map