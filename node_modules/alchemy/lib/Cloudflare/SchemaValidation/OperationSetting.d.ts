import * as schemaValidation from "@distilled.cloud/cloudflare/schema-validation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.SchemaValidation.OperationSetting";
type TypeId = typeof TypeId;
/**
 * Per-operation mitigation action for schema validation: `log` records
 * non-conforming requests, `block` denies them, `none` does nothing.
 */
export type OperationMitigationAction = "log" | "block" | "none";
export interface OperationSettingProps {
    /**
     * Zone the operation belongs to.
     *
     * Immutable — changing the zone triggers a replacement.
     */
    zoneId: string;
    /**
     * UUID of the API Shield operation the override applies to (cross-resource
     * reference to `Cloudflare.ApiShield.Operation`).
     *
     * Immutable — the operation is the override's identity, so changing it
     * triggers a replacement.
     */
    operationId: string;
    /**
     * The mitigation action applied to this operation, superseding the zone
     * default just for this operation: `log` records non-conforming requests,
     * `block` denies them, `none` disables validation for the operation.
     * Mutable in place (the PUT is a true upsert). `log` may be plan-gated
     * (API Shield entitlement).
     */
    mitigationAction: OperationMitigationAction;
}
export interface OperationSettingAttributes {
    /** Zone the operation belongs to. */
    zoneId: string;
    /** UUID of the API Shield operation the override applies to. */
    operationId: string;
    /** The mitigation action applied to this operation. */
    mitigationAction: OperationMitigationAction;
}
export type OperationSetting = Resource<TypeId, OperationSettingProps, OperationSettingAttributes, never, Providers>;
/**
 * A per-operation schema validation override
 * (`/zones/{zone_id}/schema_validation/settings/operations/{operation_id}`)
 * — pins a mitigation action for a single API Shield operation, superseding
 * the zone-level default just for that operation.
 *
 * The override is keyed by the operation's UUID; deleting the resource
 * clears the override so the operation falls back to the zone default.
 * Deleting the underlying API Shield operation cascades the override away.
 * ### Overriding an operation
 * **Example:** Block non-conforming requests on one operation
 * ```typescript
 * const op = yield* Cloudflare.ApiShield.Operation("GetUser", {
 *   zoneId: zone.zoneId,
 *   method: "GET",
 *   host: "api.example.com",
 *   endpoint: "/users/{id}",
 * });
 *
 * yield* Cloudflare.SchemaValidation.OperationSetting("BlockGetUser", {
 *   zoneId: zone.zoneId,
 *   operationId: op.operationId,
 *   mitigationAction: "block",
 * });
 * ```
 *
 * **Example:** Exempt an operation from validation
 * ```typescript
 * yield* Cloudflare.SchemaValidation.OperationSetting("SkipWebhook", {
 *   zoneId: zone.zoneId,
 *   operationId: webhookOp.operationId,
 *   mitigationAction: "none",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/schema-validation/
 *
 * @resource
 * @product Schema Validation
 * @category Application Security
 */
export declare const OperationSetting: import("../../Resource.ts").ResourceClass<OperationSetting>;
/**
 * Returns true if the given value is a OperationSetting
 * resource.
 */
export declare const isOperationSetting: (value: unknown) => value is OperationSetting;
export declare const OperationSettingProvider: () => import("effect/Layer").Layer<Provider.Provider<OperationSetting>, never, CloudflareEnvironment | schemaValidation.CloudflareOpContext>;
export {};
//# sourceMappingURL=OperationSetting.d.ts.map