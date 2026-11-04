import * as apiGateway from "@distilled.cloud/cloudflare/api-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ApiShield.UserSchema";
type TypeId = typeof TypeId;
export interface UserSchemaProps {
    /**
     * Zone the schema is uploaded to.
     *
     * Immutable — moving a schema between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Name of the schema. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     *
     * Immutable — there is no rename API, so changing the name triggers a
     * replacement.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * The OpenAPI v3 schema source (JSON or YAML) to upload.
     *
     * Immutable — Cloudflare offers no API to update an uploaded schema's
     * contents, so changing the source triggers a replacement.
     */
    schema: string;
    /**
     * Whether the schema is enabled for (legacy "classic") schema
     * validation. Enabling is an in-place update; Cloudflare forbids
     * disabling an enabled schema (error 20400), so turning this back off
     * triggers a replacement.
     * @default false
     */
    validationEnabled?: boolean;
}
export interface UserSchemaAttributes {
    /** Cloudflare-assigned UUID of the schema. */
    schemaId: string;
    /** Zone the schema is uploaded to. */
    zoneId: string;
    /** Name of the schema. */
    name: string;
    /** Kind of schema. Always `openapi_v3`. */
    kind: "openapi_v3" | (string & {});
    /** The schema source as stored by Cloudflare. */
    source: string;
    /** Whether the schema is enabled for validation. */
    validationEnabled: boolean;
    /** ISO8601 creation timestamp. */
    createdAt: string;
}
export type UserSchema = Resource<TypeId, UserSchemaProps, UserSchemaAttributes, never, Providers>;
/**
 * A Cloudflare API Shield user schema — an OpenAPI v3 document uploaded to
 * a zone for (legacy "classic") schema validation of API traffic.
 *
 * An uploaded schema's contents cannot be modified, so changing the
 * `schema` source (or the `name`) triggers a replacement. The only in-place
 * update is enabling validation; Cloudflare forbids disabling an enabled
 * schema, so turning validation back off also triggers a replacement.
 *
 * For current zone-level schema validation (v2), prefer the
 * `Cloudflare.SchemaValidation` resources.
 * ### Uploading a Schema
 * **Example:** Upload an OpenAPI v3 schema
 * ```typescript
 * const fs = yield* FileSystem.FileSystem;
 * const source = yield* fs.readFileString("./openapi.json");
 *
 * const schema = yield* Cloudflare.ApiShield.UserSchema("PetstoreSchema", {
 *   zoneId: zone.zoneId,
 *   name: "petstore",
 *   schema: source,
 * });
 * // schema.schemaId is the Cloudflare-assigned UUID
 * ```
 *
 * **Example:** Upload and enable validation
 * ```typescript
 * yield* Cloudflare.ApiShield.UserSchema("PetstoreSchema", {
 *   zoneId: zone.zoneId,
 *   schema: source,
 *   validationEnabled: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/schema-validation/
 *
 * @resource
 * @product API Shield
 * @category Application Security
 */
export declare const UserSchema: import("../../Resource.ts").ResourceClass<UserSchema>;
/**
 * Returns true if the given value is an UserSchema resource.
 */
export declare const isUserSchema: (value: unknown) => value is UserSchema;
export declare const UserSchemaProvider: () => import("effect/Layer").Layer<Provider.Provider<UserSchema>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | apiGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=UserSchema.d.ts.map