import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SchemaProps {
    /**
     * Name of the schema. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Changing the name replaces the schema.
     */
    name?: string;
    /**
     * The Avro schema definition, as a JSON string, describing the fields of the
     * dataset this schema applies to. Immutable — changing it replaces the
     * schema.
     *
     * @example
     * ```json
     * {
     *   "type": "record",
     *   "name": "Interactions",
     *   "namespace": "com.amazonaws.personalize.schema",
     *   "fields": [
     *     { "name": "USER_ID", "type": "string" },
     *     { "name": "ITEM_ID", "type": "string" },
     *     { "name": "TIMESTAMP", "type": "long" }
     *   ],
     *   "version": "1.0"
     * }
     * ```
     */
    schema: string;
    /**
     * The domain of a domain-specific dataset group this schema belongs to
     * (`ECOMMERCE` or `VIDEO_ON_DEMAND`). Omit for a custom (non-domain) schema.
     * Immutable — changing it replaces the schema.
     */
    domain?: string;
}
export interface Schema extends Resource<"AWS.Personalize.Schema", SchemaProps, {
    /**
     * ARN of the schema.
     */
    schemaArn: string;
    /**
     * Name of the schema.
     */
    name: string;
    /**
     * Avro schema definition as a JSON string.
     */
    schema: string;
    /**
     * Domain of the schema (`ECOMMERCE` or `VIDEO_ON_DEMAND`) when it is a
     * domain schema.
     */
    domain: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Personalize schema — an Avro definition that describes the fields
 * of a dataset (Interactions, Items, Users, …). Schemas are immutable once
 * created; changing any property replaces the schema.
 *
 * ### Creating a Schema
 * **Example:** Interactions Schema
 * ```typescript
 * const schema = yield* Personalize.Schema("Interactions", {
 *   schema: JSON.stringify({
 *     type: "record",
 *     name: "Interactions",
 *     namespace: "com.amazonaws.personalize.schema",
 *     fields: [
 *       { name: "USER_ID", type: "string" },
 *       { name: "ITEM_ID", type: "string" },
 *       { name: "TIMESTAMP", type: "long" },
 *     ],
 *     version: "1.0",
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const Schema: import("../../Resource.ts").ResourceClass<Schema>;
export declare const SchemaProvider: () => import("effect/Layer").Layer<Provider.Provider<Schema>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Schema.d.ts.map