import * as apiGateway from "@distilled.cloud/cloudflare/api-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.ApiShield.Label";
type TypeId = typeof TypeId;
export interface LabelProps {
    /**
     * Zone the label is defined on.
     *
     * Immutable — moving a label between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Name of the label. Must be 1–24 characters. If omitted, a unique
     * lowercase name is generated from the app, stage, and logical ID.
     *
     * Immutable — the name is the label's identity, so changing it triggers
     * a replacement.
     * @default ${app}-${id}-${stage}-${suffix} (truncated to 24 characters)
     */
    name?: string;
    /**
     * Human-readable description of the label. Mutable — patched in place.
     * @default ""
     */
    description?: string;
}
export interface LabelAttributes {
    /** Zone the label is defined on. */
    zoneId: string;
    /** Name of the label (its identity within the zone). */
    name: string;
    /** Human-readable description of the label. */
    description: string;
    /**
     * Who owns the label: `user` for labels we manage, `managed` for
     * Cloudflare-curated labels.
     */
    source: string;
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 timestamp of the last update. */
    lastUpdated: string;
}
/**
 * Returns true if the given value is an Label resource.
 */
export declare const isLabel: (value: unknown) => value is Label;
export type Label = Resource<TypeId, LabelProps, LabelAttributes, never, Providers>;
/**
 * A Cloudflare API Shield user label — a zone-scoped tag that can be
 * attached to registered API operations to organize and filter them
 * (e.g. by team, service, or sensitivity).
 *
 * The label's `name` is its identity (and Cloudflare limits it to 24
 * characters), so renaming triggers a replacement; only the `description`
 * is mutable in place. Deleting a label detaches it from any operations
 * server-side.
 * ### Creating a Label
 * **Example:** Label with a generated name
 * ```typescript
 * const label = yield* Cloudflare.ApiShield.Label("TeamPayments", {
 *   zoneId: zone.zoneId,
 *   description: "endpoints owned by the payments team",
 * });
 * ```
 *
 * **Example:** Label with an explicit name
 * ```typescript
 * yield* Cloudflare.ApiShield.Label("Pii", {
 *   zoneId: zone.zoneId,
 *   name: "pii",
 *   description: "endpoints that return personal data",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/management-and-monitoring/endpoint-labels/
 *
 * @resource
 * @product API Shield
 * @category Application Security
 */
export declare const Label: import("../../Resource.ts").ResourceClass<Label>;
export declare const LabelProvider: () => import("effect/Layer").Layer<Provider.Provider<Label>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | apiGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=Label.d.ts.map