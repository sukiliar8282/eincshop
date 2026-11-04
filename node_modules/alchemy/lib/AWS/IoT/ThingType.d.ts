import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ThingTypeProps {
    /**
     * Name of the thing type. If omitted, a unique name is generated.
     * Changing it replaces the thing type.
     */
    thingTypeName?: string;
    /**
     * A description of the thing type.
     */
    description?: string;
    /**
     * A list of searchable thing attribute names.
     */
    searchableAttributes?: string[];
    /**
     * User tags to attach to the thing type.
     */
    tags?: Record<string, string>;
}
export interface ThingType extends Resource<"AWS.IoT.ThingType", ThingTypeProps, {
    /** The name of the thing type. */
    thingTypeName: string;
    /** The ARN of the thing type. */
    thingTypeArn: string;
}, never, Providers> {
}
/**
 * An AWS IoT Thing Type — a reusable template describing a class of things.
 *
 * ### Creating a Thing Type
 * **Example:** Basic Thing Type
 * ```typescript
 * const thingType = yield* ThingType("sensor-type", {
 *   description: "Temperature sensors",
 *   searchableAttributes: ["location", "model"],
 * });
 * ```
 *
 * **Example:** Create a Thing of this Type
 * ```typescript
 * const thingType = yield* ThingType("sensor-type", {
 *   searchableAttributes: ["location"],
 * });
 *
 * const thing = yield* Thing("sensor", {
 *   thingTypeName: thingType.thingTypeName,
 *   attributes: { location: "warehouse-a" },
 * });
 * ```
 *
 * @resource
 */
export declare const ThingType: import("../../Resource.ts").ResourceClass<ThingType>;
declare const ThingTypeDeletionTimedOut_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ThingTypeDeletionTimedOut";
} & Readonly<A>;
export declare class ThingTypeDeletionTimedOut extends ThingTypeDeletionTimedOut_base<{
    readonly thingTypeName: string;
    readonly waitedSeconds: number;
}> {
}
export declare const ThingTypeProvider: () => import("effect/Layer").Layer<Provider.Provider<ThingType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ThingType.d.ts.map