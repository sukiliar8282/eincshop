import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The action a listener (or rule) applies to matched traffic: forward to
 * weighted target groups or answer with a fixed HTTP status.
 */
export type ListenerAction = vpclattice.RuleAction;
export interface ListenerProps {
    /**
     * ID or ARN of the lattice service the listener belongs to. Immutable —
     * changing it replaces the listener.
     */
    serviceIdentifier: string;
    /**
     * Name of the listener. If omitted, a unique name is generated. Immutable —
     * changing it replaces the listener.
     */
    name?: string;
    /**
     * Listener protocol (`HTTP`, `HTTPS`, or `TLS_PASSTHROUGH`). Immutable —
     * changing it replaces the listener.
     */
    protocol: "HTTP" | "HTTPS" | "TLS_PASSTHROUGH";
    /**
     * Listener port. Defaults to the protocol's default port (80 for HTTP,
     * 443 for HTTPS). Immutable — changing it replaces the listener.
     */
    port?: number;
    /**
     * Action applied to requests that match no rule: forward to weighted
     * target groups or return a fixed response status.
     */
    defaultAction: ListenerAction;
    /**
     * User-defined tags to apply to the listener.
     */
    tags?: Record<string, string>;
}
export interface Listener extends Resource<"AWS.VpcLattice.Listener", ListenerProps, {
    /**
     * Service-assigned unique ID of the listener.
     */
    listenerId: string;
    /**
     * ARN of the listener.
     */
    listenerArn: string;
    /**
     * Physical name of the listener.
     */
    name: string;
    /**
     * Listener protocol.
     */
    protocol: string;
    /**
     * Listener port.
     */
    port?: number;
    /**
     * ID of the owning lattice service.
     */
    serviceId: string;
    /**
     * ARN of the owning lattice service.
     */
    serviceArn?: string;
    /**
     * Current tags reported for the listener.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon VPC Lattice listener — the process on a lattice service that
 * checks for connection requests on a protocol/port and routes them via its
 * default action and rules.
 *
 * ### Creating Listeners
 * **Example:** HTTP Listener with a Fixed Default Response
 * ```typescript
 * const listener = yield* Listener("HttpListener", {
 *   serviceIdentifier: service.serviceId,
 *   protocol: "HTTP",
 *   port: 80,
 *   defaultAction: { fixedResponse: { statusCode: 404 } },
 * });
 * ```
 *
 * **Example:** Listener Forwarding to a Target Group
 * ```typescript
 * const listener = yield* Listener("ApiListener", {
 *   serviceIdentifier: service.serviceId,
 *   protocol: "HTTP",
 *   defaultAction: {
 *     forward: {
 *       targetGroups: [
 *         { targetGroupIdentifier: targets.targetGroupId, weight: 100 },
 *       ],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Listener: import("../../Resource.ts").ResourceClass<Listener>;
export declare const ListenerProvider: () => import("effect/Layer").Layer<Provider.Provider<Listener>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Listener.d.ts.map