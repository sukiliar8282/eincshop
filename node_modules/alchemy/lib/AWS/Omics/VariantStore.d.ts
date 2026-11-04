import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VariantStoreProps {
    /**
     * A name for the variant store. If omitted, a unique name is generated from
     * the app, stage, and logical ID. Must be lowercase, start with a letter,
     * and contain only `[a-z0-9_]`. Changing the name replaces the store.
     */
    name?: string;
    /**
     * A description for the variant store. Mutable.
     */
    description?: string;
    /**
     * The genome reference for the store, as a reference ARN. Required.
     * Immutable — changing it replaces the store.
     */
    reference: {
        /** ARN of a reference in a HealthOmics reference store. */
        referenceArn: string;
    };
    /**
     * Server-side encryption (SSE) settings. Defaults to an AWS-owned key.
     * Immutable.
     */
    sseConfig?: {
        /** Encryption type. `KMS` uses a customer-managed key. */
        type: "KMS";
        /** ARN of the customer-managed KMS key. Required when `type` is `KMS`. */
        keyArn?: string;
    };
    /**
     * Tags to apply to the variant store. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface VariantStore extends Resource<"AWS.Omics.VariantStore", VariantStoreProps, {
    /**
     * ID of the variant store.
     */
    variantStoreId: string;
    /**
     * ARN of the variant store.
     */
    variantStoreArn: string;
    /**
     * Name of the variant store.
     */
    name: string;
    /**
     * Store status (e.g. `ACTIVE`, `CREATING`, `UPDATING`, `FAILED`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon HealthOmics variant store — a container for genomic variant data
 * (VCF) aligned to a reference genome.
 *
 * A variant store name is auto-generated from the app, stage, and logical ID
 * unless you provide one. The `reference` and `sseConfig` are immutable —
 * changing either replaces the store. `description` is updated in place.
 * ### Creating a Variant Store
 * **Example:** Basic Variant Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.VariantStore("Variants", {
 *   reference: {
 *     referenceArn: "arn:aws:omics:us-east-1:123456789012:referenceStore/1234567890/reference/0987654321",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const VariantStore: import("../../Resource.ts").ResourceClass<VariantStore>;
export declare const VariantStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<VariantStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VariantStore.d.ts.map