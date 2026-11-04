import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SchemaProps {
    /**
     * The name of the registry the schema belongs to. Changing it replaces the
     * schema.
     */
    registryName: string;
    /**
     * Name of the schema. Must match `[a-zA-Z0-9-_.@]+` and be at most 385
     * characters. If omitted, a unique name is generated. Changing it replaces
     * the schema.
     */
    schemaName?: string;
    /**
     * The type of the schema document. Changing it replaces the schema.
     * @default "OpenApi3"
     */
    type?: "OpenApi3" | "JSONSchemaDraft4";
    /**
     * The schema document as a JSON string (an OpenAPI 3 document or a
     * JSONSchema Draft 4 document, depending on `type`). Updating the content
     * publishes a new schema version.
     */
    content: string;
    /**
     * A description of the schema.
     */
    description?: string;
    /**
     * User tags to attach to the schema.
     */
    tags?: Record<string, string>;
}
export interface Schema extends Resource<"AWS.Schemas.Schema", SchemaProps, {
    /** The name of the registry the schema belongs to. */
    registryName: string;
    /** The name of the schema. */
    schemaName: string;
    /** The ARN of the schema. */
    schemaArn: string;
    /** The version of the schema currently described by `content`. */
    schemaVersion: string;
    /** The type of the schema document. */
    type: string;
}, never, Providers> {
}
/**
 * An event schema in an EventBridge Schema Registry — a versioned OpenAPI 3
 * or JSONSchema Draft 4 document describing the structure of an event.
 * Updating the content publishes a new schema version; previous versions are
 * retained by the registry.
 *
 * ### Creating a Schema
 * **Example:** OpenAPI 3 Schema
 * ```typescript
 * const registry = yield* AWS.Schemas.Registry("app-events", {});
 *
 * const schema = yield* AWS.Schemas.Schema("OrderCreated", {
 *   registryName: registry.registryName,
 *   type: "OpenApi3",
 *   content: JSON.stringify({
 *     openapi: "3.0.0",
 *     info: { version: "1.0.0", title: "OrderCreated" },
 *     paths: {},
 *     components: {
 *       schemas: {
 *         OrderCreated: {
 *           type: "object",
 *           properties: { orderId: { type: "string" } },
 *         },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * **Example:** JSONSchema Draft 4 Schema
 * ```typescript
 * const schema = yield* AWS.Schemas.Schema("UserSignedUp", {
 *   registryName: registry.registryName,
 *   type: "JSONSchemaDraft4",
 *   content: JSON.stringify({
 *     $schema: "http://json-schema.org/draft-04/schema#",
 *     type: "object",
 *     properties: { userId: { type: "string" } },
 *   }),
 *   description: "Emitted when a user completes sign-up",
 * });
 * ```
 *
 * @resource
 */
export declare const Schema: import("../../Resource.ts").ResourceClass<Schema>;
export declare const SchemaProvider: () => import("effect/Layer").Layer<Provider.Provider<Schema>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Schema.d.ts.map