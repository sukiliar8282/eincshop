import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AnnotationStoreProps {
    /**
     * A name for the annotation store. If omitted, a unique name is generated
     * from the app, stage, and logical ID. Must be lowercase, start with a
     * letter, and contain only `[a-z0-9_]`. Changing the name replaces the
     * store.
     */
    name?: string;
    /**
     * A description for the annotation store. Mutable.
     */
    description?: string;
    /**
     * The annotation file format of the store. Immutable — changing it replaces
     * the store.
     */
    storeFormat: "GFF" | "TSV" | "VCF";
    /**
     * The genome reference for the store, as a reference ARN. Required for
     * `GFF` and `VCF` stores. Immutable — changing it replaces the store.
     */
    reference?: {
        /** ARN of a reference in a HealthOmics reference store. */
        referenceArn: string;
    };
    /**
     * File parsing options for `TSV` stores. Immutable.
     */
    storeOptions?: {
        /** Parsing options for TSV-format annotation files. */
        tsvStoreOptions: {
            /** The store's annotation type (e.g. `GENERIC`, `CHR_POS_REF_ALT`). */
            annotationType?: string;
            /** Maps TSV format fields to the store's header columns. */
            formatToHeader?: Record<string, string>;
            /** Column-name-to-type entries describing the store's schema. */
            schema?: Record<string, string>[];
        };
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
     * Tags to apply to the annotation store. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AnnotationStore extends Resource<"AWS.Omics.AnnotationStore", AnnotationStoreProps, {
    /**
     * ID of the annotation store.
     */
    annotationStoreId: string;
    /**
     * ARN of the annotation store.
     */
    annotationStoreArn: string;
    /**
     * Name of the annotation store.
     */
    name: string;
    /**
     * Store status (e.g. `ACTIVE`, `CREATING`, `UPDATING`, `FAILED`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon HealthOmics annotation store — a container for genome annotation
 * data (GFF, TSV, or VCF) aligned to a reference genome.
 *
 * An annotation store name is auto-generated from the app, stage, and logical
 * ID unless you provide one. The `storeFormat`, `reference`, `storeOptions`,
 * and `sseConfig` are immutable — changing any of them replaces the store.
 * `description` is updated in place.
 * ### Creating an Annotation Store
 * **Example:** VCF Annotation Store
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const store = yield* Omics.AnnotationStore("Annotations", {
 *   storeFormat: "VCF",
 *   reference: {
 *     referenceArn: "arn:aws:omics:us-east-1:123456789012:referenceStore/1234567890/reference/0987654321",
 *   },
 * });
 * ```
 *
 * **Example:** TSV Annotation Store
 * ```typescript
 * const store = yield* Omics.AnnotationStore("Annotations", {
 *   storeFormat: "TSV",
 *   storeOptions: {
 *     tsvStoreOptions: { annotationType: "GENERIC" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const AnnotationStore: import("../../Resource.ts").ResourceClass<AnnotationStore>;
export declare const AnnotationStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<AnnotationStore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AnnotationStore.d.ts.map