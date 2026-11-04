import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ReferenceStoreProps {
    /**
     * A name for the reference store. If omitted, a unique name is generated
     * from the app, stage, and logical ID. Changing the name replaces the
     * store. Must match `[\w -.]+` and be 1-127 characters.
     */
    name?: string;
    /**
     * A description for the reference store. Changing the description replaces
     * the store (HealthOmics has no update-store API).
     */
    description?: string;
    /**
     * Server-side encryption (SSE) settings. Defaults to an AWS-owned key.
     * Changing this replaces the store.
     */
    sseConfig?: {
        /** Encryption type. `KMS` uses a customer-managed key. */
        type: "KMS";
        /** ARN of the customer-managed KMS key. Required when `type` is `KMS`. */
        keyArn?: string;
    };
    /**
     * Tags to apply to the reference store. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ReferenceStore extends Resource<"AWS.Omics.ReferenceStore", ReferenceStoreProps, {
    /**
     * ID of the reference store.
     */
    referenceStoreId: string;
    /**
     * ARN of the reference store.
     */
    referenceStoreArn: string;
    /**
     * Name of the reference store.
     */
    name: string;
    /**
     * When the reference store was created (ISO-8601).
     */
    creationTime: string;
}, never, Providers> {
}
/**
 * An Amazon HealthOmics reference store — a container for reference genomes
 * that read sets are aligned against.
 *
 * A reference store name is auto-generated from the app, stage, and logical
 * ID unless you provide one. HealthOmics offers no update-store API, so any
 * change to `name`, `description`, or `sseConfig` replaces the store. A store
 * can only be deleted once it contains no reference genomes.
 * ### Creating a Reference Store
 * **Example:** Basic Reference Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.ReferenceStore("References");
 * ```
 *
 * **Example:** Named Reference Store with Description
 * ```typescript
 * const store = yield* Omics.ReferenceStore("References", {
 *   name: "human-references",
 *   description: "GRCh38 reference genomes",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Customer-managed KMS key
 * ```typescript
 * const store = yield* Omics.ReferenceStore("References", {
 *   sseConfig: {
 *     type: "KMS",
 *     keyArn: "arn:aws:kms:us-east-1:123456789012:key/abc-123",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ReferenceStore: import("../../Resource.ts").ResourceClass<ReferenceStore>;
export declare const ReferenceStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<ReferenceStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReferenceStore.d.ts.map