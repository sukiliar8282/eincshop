import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PortRange {
    /**
     * First port in the range of ports, inclusive.
     */
    fromPort: number;
    /**
     * Last port in the range of ports, inclusive.
     */
    toPort: number;
}
export interface ListenerProps {
    /**
     * ARN of the accelerator the listener attaches to. Changing it replaces
     * the listener.
     */
    acceleratorArn: string;
    /**
     * The port ranges the listener accepts client connections on (up to 10).
     */
    portRanges: PortRange[];
    /**
     * The protocol for connections from clients to the accelerator.
     */
    protocol: "TCP" | "UDP";
    /**
     * Client affinity. `SOURCE_IP` routes a given client to the same endpoint
     * regardless of source port, for stateful applications.
     * @default "NONE"
     */
    clientAffinity?: "NONE" | "SOURCE_IP";
}
export interface Listener extends Resource<"AWS.GlobalAccelerator.Listener", ListenerProps, {
    /** The ARN of the listener. */
    listenerArn: string;
    /** The ARN of the accelerator the listener is attached to. */
    acceleratorArn: string;
    /** The port ranges the listener accepts connections on. */
    portRanges: PortRange[];
    /** The listener protocol: `TCP` or `UDP`. */
    protocol: string;
    /** The client affinity setting: `NONE` or `SOURCE_IP`. */
    clientAffinity: string;
}, never, Providers> {
}
/**
 * A Global Accelerator listener that accepts inbound client connections on
 * an accelerator's static IP addresses, on one or more port ranges.
 *
 * Port ranges, protocol, and client affinity are all updatable in place;
 * only moving the listener to a different accelerator replaces it. Attach
 * `EndpointGroup`s to route the accepted traffic to regional endpoints.
 * ### Creating Listeners
 * **Example:** TCP Listener
 * ```typescript
 * const listener = yield* GlobalAccelerator.Listener("Web", {
 *   acceleratorArn: accelerator.acceleratorArn,
 *   portRanges: [{ fromPort: 80, toPort: 80 }],
 *   protocol: "TCP",
 * });
 * ```
 *
 * **Example:** Sticky UDP Listener with Multiple Port Ranges
 * ```typescript
 * const listener = yield* GlobalAccelerator.Listener("Game", {
 *   acceleratorArn: accelerator.acceleratorArn,
 *   portRanges: [
 *     { fromPort: 3000, toPort: 3100 },
 *     { fromPort: 4000, toPort: 4000 },
 *   ],
 *   protocol: "UDP",
 *   clientAffinity: "SOURCE_IP",
 * });
 * ```
 *
 * @resource
 */
export declare const Listener: import("../../Resource.ts").ResourceClass<Listener>;
export declare const ListenerProvider: () => import("effect/Layer").Layer<Provider.Provider<Listener>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Listener.d.ts.map