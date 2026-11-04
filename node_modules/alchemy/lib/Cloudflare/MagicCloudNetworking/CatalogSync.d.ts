import * as mcn from "@distilled.cloud/cloudflare/magic-cloud-networking";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicCloudNetworking.CatalogSync";
type TypeId = typeof TypeId;
/**
 * Where a catalog sync writes the discovered resources.
 */
export type CatalogSyncDestinationType = "NONE" | "ZERO_TRUST_LIST";
/**
 * Whether the destination updates automatically as discoveries change, or
 * only when explicitly refreshed.
 */
export type CatalogSyncUpdateMode = "AUTO" | "MANUAL";
export interface CatalogSyncProps {
    /**
     * Type of destination the sync materializes into. `ZERO_TRUST_LIST`
     * provisions a Zero Trust list owned by the sync.
     *
     * Immutable — the destination is provisioned at create time, so changing
     * it triggers a replacement.
     */
    destinationType: CatalogSyncDestinationType;
    /**
     * Whether the destination updates automatically (`AUTO`) or only on an
     * explicit refresh (`MANUAL`). Mutable.
     */
    updateMode: CatalogSyncUpdateMode;
    /**
     * Human readable name. Used as the sync's identity for cold-state
     * recovery, so it should be unique within the account. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Free-form description of the sync. Mutable.
     */
    description?: string;
    /**
     * Filter expression selecting which discovered resources are included.
     * See the prebuilt policies API for ready-made expressions. Mutable.
     */
    policy?: string;
    /**
     * Whether destroying the sync also deletes the destination it provisioned
     * (e.g. the Zero Trust list). Consumed only at delete time.
     * @default true
     */
    deleteDestination?: boolean;
}
export interface CatalogSyncAttributes {
    /** Cloudflare-assigned identifier of the catalog sync. */
    syncId: string;
    /** The Cloudflare account the sync belongs to. */
    accountId: string;
    /** Human readable name of the sync. */
    name: string;
    /** Type of destination the sync materializes into. */
    destinationType: CatalogSyncDestinationType;
    /** Identifier of the provisioned destination (e.g. Zero Trust list id). */
    destinationId: string;
    /** Whether the destination updates automatically or manually. */
    updateMode: CatalogSyncUpdateMode;
    /** Free-form description. */
    description: string;
    /** Filter expression selecting included resources. */
    policy: string;
    /** ISO8601 timestamp of the last user-initiated update. */
    lastUserUpdateAt: string;
    /** Discoveries up to this ISO8601 timestamp are included, if any. */
    includesDiscoveriesUntil: string | undefined;
    /** Whether delete also removes the provisioned destination. */
    deleteDestination: boolean;
}
export type CatalogSync = Resource<TypeId, CatalogSyncProps, CatalogSyncAttributes, never, Providers>;
/**
 * A Magic Cloud Networking catalog sync — continuously materializes the
 * catalog of discovered cloud resources (filtered by a policy expression)
 * into a destination such as a Zero Trust list.
 *
 * The destination is provisioned when the sync is created, so
 * `destinationType` is immutable and forces a replacement; `name`,
 * `description`, `policy`, and `updateMode` are all patched in place.
 *
 * Magic Cloud Networking is an entitlement-gated add-on (Magic WAN family).
 * On accounts without the entitlement every API call fails with the typed
 * `FeatureNotEnabled` error (Cloudflare code 1012, "feature not enabled").
 * ### Creating a sync
 * **Example:** Sync discovered VPC CIDRs into a Zero Trust list
 * ```typescript
 * const sync = yield* Cloudflare.MagicCloudNetworking.CatalogSync("VpcCidrs", {
 *   destinationType: "ZERO_TRUST_LIST",
 *   updateMode: "AUTO",
 *   policy: "kind in ('aws_vpc','azurerm_virtual_network','google_compute_network')",
 * });
 * // sync.destinationId is the provisioned Zero Trust list
 * ```
 *
 * **Example:** Manual sync without a destination
 * ```typescript
 * yield* Cloudflare.MagicCloudNetworking.CatalogSync("DryRun", {
 *   destinationType: "NONE",
 *   updateMode: "MANUAL",
 * });
 * ```
 *
 * ### Destroy behavior
 * **Example:** Keep the destination list on destroy
 * ```typescript
 * yield* Cloudflare.MagicCloudNetworking.CatalogSync("VpcCidrs", {
 *   destinationType: "ZERO_TRUST_LIST",
 *   updateMode: "AUTO",
 *   deleteDestination: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-cloud-networking/
 *
 * @resource
 * @product Magic Cloud Networking
 * @category Network
 */
export declare const CatalogSync: import("../../Resource.ts").ResourceClass<CatalogSync>;
/**
 * Returns true if the given value is a CatalogSync resource.
 */
export declare const isCatalogSync: (value: unknown) => value is CatalogSync;
export declare const CatalogSyncProvider: () => import("effect/Layer").Layer<Provider.Provider<CatalogSync>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | mcn.CloudflareOpContext>;
export {};
//# sourceMappingURL=CatalogSync.d.ts.map