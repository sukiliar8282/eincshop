import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DatastoreProps {
    /**
     * Name of the data store. If omitted, a deterministic physical name is
     * generated. AWS HealthImaging has no update operation, so changing the
     * name replaces the data store.
     */
    datastoreName?: string;
    /**
     * ARN of a customer-managed KMS key used to encrypt the data store at
     * rest. Changing the key replaces the data store.
     * @default AWS-owned key
     */
    kmsKeyArn?: string;
    /**
     * ARN of a Lambda authorizer used to gate data access. Changing the
     * authorizer replaces the data store.
     */
    lambdaAuthorizerArn?: string;
    /**
     * Lossless compression format for stored image frames — `"HTJ2K"` or
     * `"JPEG_2000_LOSSLESS"`. Changing the format replaces the data store.
     * @default "HTJ2K"
     */
    losslessStorageFormat?: string;
    /**
     * User-defined tags for the data store.
     */
    tags?: Record<string, string>;
}
export interface Datastore extends Resource<"AWS.MedicalImaging.Datastore", DatastoreProps, {
    /** Server-assigned unique id of the data store. */
    datastoreId: string;
    /** Name of the data store. */
    datastoreName: string;
    /** ARN of the data store. */
    datastoreArn: string;
    /** Current lifecycle status (e.g. `CREATING`, `ACTIVE`). */
    datastoreStatus: string;
    /** ARN of the KMS key encrypting the data store, if customer-managed. */
    kmsKeyArn: string | undefined;
    /** Tags on the data store (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS HealthImaging data store — a HIPAA-eligible store for DICOM P10
 * medical images with sub-second image-frame retrieval.
 *
 * Data stores provision asynchronously (CREATING → ACTIVE, typically a few
 * minutes) and must be empty (no image sets) before they can be deleted.
 * HealthImaging has no update API, so every property except tags triggers a
 * replacement.
 * ### Creating a Data Store
 * **Example:** Basic Data Store
 * ```typescript
 * const datastore = yield* Datastore("Imaging", {});
 * ```
 *
 * **Example:** Data Store with a Customer-Managed KMS Key
 * ```typescript
 * const datastore = yield* Datastore("Imaging", {
 *   kmsKeyArn: key.keyArn,
 *   tags: { team: "radiology" },
 * });
 * ```
 *
 * ### Importing DICOM Data
 * **Example:** Reference the Data Store Id
 * ```typescript
 * const datastore = yield* Datastore("Imaging", {});
 * // startDICOMImportJob and image-set APIs address the store by id
 * const id = datastore.datastoreId;
 * ```
 *
 * @resource
 */
export declare const Datastore: import("../../Resource.ts").ResourceClass<Datastore>;
declare const DatastoreNotReady_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DatastoreNotReady";
} & Readonly<A>;
/**
 * Raised when a data store never reaches `ACTIVE` (or its create fails)
 * within the bounded provisioning wait.
 */
export declare class DatastoreNotReady extends DatastoreNotReady_base<{
    message: string;
}> {
}
declare const DatastoreIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DatastoreIncomplete";
} & Readonly<A>;
/**
 * Raised when the HealthImaging API omits an expected field (e.g. the
 * data store ARN) from a response.
 */
export declare class DatastoreIncomplete extends DatastoreIncomplete_base<{
    message: string;
}> {
}
export declare const DatastoreProvider: () => import("effect/Layer").Layer<Provider.Provider<Datastore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Datastore.d.ts.map