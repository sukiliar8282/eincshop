import * as schemaValidation from "@distilled.cloud/cloudflare/schema-validation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.SchemaValidation.Schema";
type TypeId = typeof TypeId;
export interface SchemaProps {
    /**
     * Zone the schema is uploaded to.
     *
     * Immutable — moving a schema between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Human-readable name for the schema. Cloudflare does not enforce
     * uniqueness, but Alchemy uses the name as the cold-read identity, so it
     * should be unique within the zone. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     *
     * Immutable — there is no rename API, so changing the name triggers a
     * replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The kind of the schema. Only OpenAPI v3 is supported.
     *
     * Immutable — changing the kind triggers a replacement.
     * @default "openapi_v3"
     */
    kind?: "openapi_v3";
    /**
     * The raw OpenAPI v3 schema, as a JSON or YAML string. Cloudflare
     * validates the document on upload and rejects invalid specs.
     *
     * Immutable — the uploaded source cannot be modified, so changing it
     * triggers a replacement (a new schema is uploaded, then the old one is
     * deleted).
     */
    source: string;
    /**
     * Whether the schema is enabled for validation.
     *
     * Enabling a disabled schema is an in-place update, but Cloudflare does
     * not allow disabling an enabled schema ("delete schema instead"), so
     * changing `true` → `false` triggers a replacement.
     * @default true
     */
    validationEnabled?: boolean;
}
export interface SchemaAttributes {
    /** Cloudflare-assigned UUID of the schema. */
    schemaId: string;
    /** Zone the schema is uploaded to. */
    zoneId: string;
    /** Human-readable name of the schema. */
    name: string;
    /** The kind of the schema. */
    kind: "openapi_v3" | (string & {});
    /** The raw schema source as stored by Cloudflare. */
    source: string;
    /** Whether the schema is enabled for validation. */
    validationEnabled: boolean;
    /** When the schema was uploaded. */
    createdAt: string;
}
export type SchemaValidationSchema = Resource<TypeId, SchemaProps, SchemaAttributes, never, Providers>;
/**
 * An OpenAPI v3 schema uploaded to a zone for API Shield schema validation
 * (`/zones/{zone_id}/schema_validation/schemas`).
 *
 * Uploading a schema registers the endpoints it describes as API Shield
 * operations (a server-side side effect — deleting the schema does not
 * delete those operations). The schema body is immutable: changing `source`
 * uploads a new schema and deletes the old one (replacement). Only the
 * `validationEnabled` flag is mutable in place.
 * ### Uploading a Schema
 * **Example:** Upload an OpenAPI v3 schema
 * ```typescript
 * const schema = yield* Cloudflare.SchemaValidation.SchemaValidationSchema("ApiSchema", {
 *   zoneId: zone.zoneId,
 *   source: JSON.stringify({
 *     openapi: "3.0.0",
 *     info: { title: "my-api", version: "1.0.0" },
 *     servers: [{ url: "https://api.example.com" }],
 *     paths: {
 *       "/users": {
 *         get: {
 *           operationId: "listUsers",
 *           responses: { "200": { description: "ok" } },
 *         },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * **Example:** Upload a schema without enabling validation
 * ```typescript
 * const schema = yield* Cloudflare.SchemaValidation.SchemaValidationSchema("DraftSchema", {
 *   zoneId: zone.zoneId,
 *   source: openApiDocument,
 *   validationEnabled: false,
 * });
 * ```
 *
 * ### Toggling validation
 * **Example:** Enable a previously-disabled schema in place
 * ```typescript
 * // Enabling (false → true) patches the schema in place. Disabling an
 * // enabled schema is rejected by Cloudflare, so `true` → `false` (like a
 * // `source` change) replaces the schema instead.
 * yield* Cloudflare.SchemaValidation.SchemaValidationSchema("DraftSchema", {
 *   zoneId: zone.zoneId,
 *   source: openApiDocument,
 *   validationEnabled: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/schema-validation/
 *
 * @resource
 * @product Schema Validation
 * @category Application Security
 */
export declare const SchemaValidationSchema: import("../../Resource.ts").ResourceClass<SchemaValidationSchema>;
/**
 * Returns true if the given value is a SchemaValidationSchema resource.
 */
export declare const isSchema: (value: unknown) => value is SchemaValidationSchema;
export declare const SchemaProvider: () => import("effect/Layer").Layer<Provider.Provider<SchemaValidationSchema>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | schemaValidation.CloudflareOpContext>;
export {};
//# sourceMappingURL=Schema.d.ts.map