import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ThingProps {
    /**
     * Name of the thing. Must be unique in your account and region and may only
     * contain letters, numbers, colons, underscores, and hyphens.
     * If omitted, a unique name is generated. Changing it replaces the thing.
     */
    thingName?: string;
    /**
     * Name of the {@link ThingType} to associate with this thing.
     */
    thingTypeName?: string;
    /**
     * A set of string attributes (key/value pairs) to store on the thing.
     */
    attributes?: Record<string, string>;
}
export interface Thing extends Resource<"AWS.IoT.Thing", ThingProps, {
    /** The name of the thing. */
    thingName: string;
    /** The ARN of the thing. */
    thingArn: string;
}, never, Providers> {
}
/**
 * An AWS IoT Thing — the cloud representation of a physical device.
 *
 * ### Creating a Thing
 * **Example:** Basic Thing
 * ```typescript
 * const thing = yield* Thing("sensor", {});
 * ```
 *
 * **Example:** Thing with Attributes
 * ```typescript
 * const thing = yield* Thing("sensor", {
 *   thingName: "temperature-sensor-01",
 *   attributes: { location: "warehouse-a", model: "acme-t1000" },
 * });
 * ```
 *
 * @resource
 */
export declare const Thing: import("../../Resource.ts").ResourceClass<Thing>;
export declare const ThingProvider: () => import("effect/Layer").Layer<Provider.Provider<Thing>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Thing.d.ts.map