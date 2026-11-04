import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EntityTypeProps {
    /**
     * Name of the entity type. If omitted, a unique lowercase name is generated
     * from the app, stage, and logical ID. Changing the name replaces the entity
     * type.
     */
    name?: string;
    /**
     * Human-readable description. This is an in-place update.
     */
    description?: string;
    /**
     * User-defined tags for the entity type.
     */
    tags?: Record<string, string>;
}
export interface EntityType extends Resource<"AWS.FraudDetector.EntityType", EntityTypeProps, {
    /** The name of the entity type. */
    name: string;
    /** The ARN of the entity type. */
    arn: string;
}, never, Providers> {
}
/**
 * An Amazon Fraud Detector entity type — the classification of who or what an
 * event is about (e.g. `customer`, `merchant`). Event types reference entity
 * types; they are cheap metadata objects.
 *
 * ### Creating an Entity Type
 * **Example:** Basic Entity Type
 * ```typescript
 * const customer = yield* FraudDetector.EntityType("customer", {
 *   description: "the buyer placing an order",
 * });
 * ```
 *
 * @resource
 */
export declare const EntityType: import("../../Resource.ts").ResourceClass<EntityType>;
export declare const EntityTypeProvider: () => import("effect/Layer").Layer<Provider.Provider<EntityType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EntityType.d.ts.map