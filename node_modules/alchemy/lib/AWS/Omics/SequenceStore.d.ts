import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SequenceStoreProps {
    /**
     * A name for the sequence store. If omitted, a unique name is generated
     * from the app, stage, and logical ID. Changing the name replaces the
     * store. Must match `[\w -.]+` and be 1-127 characters.
     */
    name?: string;
    /**
     * A description for the sequence store. Changing the description replaces
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
     * An S3 location that is used as the destination for read sets whose
     * upload failed. Changing this replaces the store.
     */
    fallbackLocation?: string;
    /**
     * The ETag algorithm family to use for ingested read sets. Changing this
     * replaces the store. Valid values are `MD5up` and `SHA256up`.
     */
    eTagAlgorithmFamily?: "MD5up" | "SHA256up";
    /**
     * The tags keys to propagate to the S3 objects associated with read sets
     * in this store. Changing this replaces the store.
     */
    propagatedSetLevelTags?: string[];
    /**
     * Tags to apply to the sequence store. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface SequenceStore extends Resource<"AWS.Omics.SequenceStore", SequenceStoreProps, {
    /**
     * ID of the sequence store.
     */
    sequenceStoreId: string;
    /**
     * ARN of the sequence store.
     */
    sequenceStoreArn: string;
    /**
     * Name of the sequence store.
     */
    name: string;
    /**
     * When the sequence store was created (ISO-8601).
     */
    creationTime: string;
}, never, Providers> {
}
/**
 * An Amazon HealthOmics sequence store — a container for genomics read sets
 * (FASTQ, BAM, CRAM).
 *
 * A sequence store name is auto-generated from the app, stage, and logical ID
 * unless you provide one. HealthOmics offers no update-store API, so any
 * change to an immutable property (name, description, encryption, fallback
 * location, ETag algorithm) replaces the store. A store can only be deleted
 * once it contains no read sets.
 * ### Creating a Sequence Store
 * **Example:** Basic Sequence Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.SequenceStore("Reads");
 * ```
 *
 * **Example:** Sequence Store with Fallback Location
 * ```typescript
 * const store = yield* Omics.SequenceStore("Reads", {
 *   name: "sample-reads",
 *   fallbackLocation: "s3://my-bucket/omics-fallback/",
 *   eTagAlgorithmFamily: "SHA256up",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Customer-managed KMS key
 * ```typescript
 * const store = yield* Omics.SequenceStore("Reads", {
 *   sseConfig: {
 *     type: "KMS",
 *     keyArn: "arn:aws:kms:us-east-1:123456789012:key/abc-123",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const SequenceStore: import("../../Resource.ts").ResourceClass<SequenceStore>;
export declare const SequenceStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<SequenceStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SequenceStore.d.ts.map