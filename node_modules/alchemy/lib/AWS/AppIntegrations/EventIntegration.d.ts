import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EventIntegrationProps {
    /**
     * Name of the event integration. Unique per account/region. If omitted, a
     * unique name is generated from the app, stage, and logical ID. Changing
     * the name replaces the event integration.
     */
    name?: string;
    /**
     * Description of the event integration (1-1000 characters).
     */
    description?: string;
    /**
     * The partner event source that pushes events to the EventBridge bus,
     * e.g. `aws.partner/examplepartner.com`. Changing the source replaces the
     * event integration.
     */
    source: string;
    /**
     * The name of the Amazon EventBridge bus the partner events are delivered
     * to, e.g. `default`. Only metadata is persisted — the bus itself is not
     * created. Changing the bus replaces the event integration.
     */
    eventBridgeBus: string;
    /**
     * Tags to apply to the event integration. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface EventIntegration extends Resource<"AWS.AppIntegrations.EventIntegration", EventIntegrationProps, {
    eventIntegrationName: string;
    eventIntegrationArn: string;
    eventBridgeBus: string;
    source: string;
}, never, Providers> {
}
/**
 * An Amazon AppIntegrations event integration. An event integration
 * associates a partner event source with an Amazon EventBridge bus in your
 * account so external applications (e.g. Amazon Connect third-party apps)
 * can publish events into it. Only metadata is persisted — no EventBridge
 * objects are created.
 *
 * The event source and EventBridge bus are immutable; changing either
 * replaces the event integration. Only the description can be updated in
 * place.
 * ### Creating an Event Integration
 * **Example:** Basic Event Integration
 * ```typescript
 * import * as AppIntegrations from "alchemy/AWS/AppIntegrations";
 *
 * const events = yield* AppIntegrations.EventIntegration("PartnerEvents", {
 *   source: "aws.partner/examplepartner.com",
 *   eventBridgeBus: "default",
 * });
 * ```
 *
 * **Example:** Event Integration with Description and Tags
 * ```typescript
 * const events = yield* AppIntegrations.EventIntegration("PartnerEvents", {
 *   source: "aws.partner/examplepartner.com",
 *   eventBridgeBus: "default",
 *   description: "Events from Example Partner",
 *   tags: { team: "integrations" },
 * });
 * ```
 *
 * @resource
 */
export declare const EventIntegration: import("../../Resource.ts").ResourceClass<EventIntegration>;
declare const EventIntegrationIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "EventIntegrationIncomplete";
} & Readonly<A>;
/**
 * Raised when the AppIntegrations API returns an event integration without
 * the fields required to build the resource attributes.
 */
export declare class EventIntegrationIncomplete extends EventIntegrationIncomplete_base<{
    message: string;
}> {
}
export declare const EventIntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<EventIntegration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=EventIntegration.d.ts.map