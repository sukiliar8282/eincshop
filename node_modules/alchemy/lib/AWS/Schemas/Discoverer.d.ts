import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type DiscovererState = "STARTED" | "STOPPED";
export interface DiscovererProps {
    /**
     * The ARN of the event bus to discover schemas on. Changing it replaces
     * the discoverer.
     */
    sourceArn: string;
    /**
     * A description of the discoverer.
     */
    description?: string;
    /**
     * Whether the discoverer also discovers schemas from events sent by other
     * accounts.
     * @default true
     */
    crossAccount?: boolean;
    /**
     * The desired state of the discoverer. A discoverer starts automatically
     * on creation.
     * @default "STARTED"
     */
    state?: DiscovererState;
    /**
     * User tags to attach to the discoverer.
     */
    tags?: Record<string, string>;
}
export interface Discoverer extends Resource<"AWS.Schemas.Discoverer", DiscovererProps, {
    /** The ID of the discoverer. */
    discovererId: string;
    /** The ARN of the discoverer. */
    discovererArn: string;
    /** The ARN of the event bus being discovered. */
    sourceArn: string;
    /** The current state of the discoverer. */
    state: DiscovererState;
}, never, Providers> {
}
/**
 * An EventBridge schema discoverer — automatically infers schemas from the
 * events flowing through an event bus and publishes them (versioned) to the
 * AWS-managed `discovered-schemas` registry.
 *
 * ### Creating a Discoverer
 * **Example:** Discover Schemas on an Event Bus
 * ```typescript
 * const bus = yield* AWS.EventBridge.EventBus("AppBus", {});
 *
 * const discoverer = yield* AWS.Schemas.Discoverer("AppDiscoverer", {
 *   sourceArn: bus.eventBusArn,
 *   description: "Discovers schemas for application events",
 * });
 * ```
 *
 * **Example:** Stopped Discoverer
 * ```typescript
 * const discoverer = yield* AWS.Schemas.Discoverer("PausedDiscoverer", {
 *   sourceArn: bus.eventBusArn,
 *   state: "STOPPED",
 * });
 * ```
 * The discoverer is provisioned but paused; set `state: "STARTED"` (or omit
 * it) to resume discovery.
 *
 * @resource
 */
export declare const Discoverer: import("../../Resource.ts").ResourceClass<Discoverer>;
export declare const DiscovererProvider: () => import("effect/Layer").Layer<Provider.Provider<Discoverer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Discoverer.d.ts.map