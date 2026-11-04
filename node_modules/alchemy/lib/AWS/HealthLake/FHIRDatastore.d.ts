import * as healthlake from "@distilled.cloud/aws/healthlake";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface FHIRDatastoreIdentityProviderProps {
    /**
     * Authorization strategy for the data store — `"AWS_AUTH"` (SigV4, the
     * default), `"SMART_ON_FHIR"` or `"SMART_ON_FHIR_V1"`.
     */
    authorizationStrategy: healthlake.AuthorizationStrategy;
    /**
     * Whether fine-grained (SMART on FHIR scope based) authorization is
     * enabled.
     * @default false
     */
    fineGrainedAuthorizationEnabled?: boolean;
    /**
     * JSON metadata elements the identity provider uses in its authorization
     * flow (issuer, authorization/token endpoints, etc.).
     */
    metadata?: string;
    /**
     * ARN of the Lambda function the data store invokes to decode SMART on
     * FHIR access tokens.
     */
    idpLambdaArn?: string;
}
export interface FHIRDatastoreProps {
    /**
     * Name of the data store. Names do not have to be unique within an
     * account; the data store is identified by its auto-assigned id. Updated
     * in place.
     * @default a deterministic physical name derived from app, stage and logical id
     */
    datastoreName?: string;
    /**
     * FHIR release version supported by the data store. Only `"R4"` is
     * currently supported. Changing this replaces the data store.
     * @default "R4"
     */
    datastoreTypeVersion?: healthlake.FHIRVersion;
    /**
     * Customer-managed KMS key (id, ARN or alias) used to encrypt the data
     * store at rest. Changing this replaces the data store.
     * @default an AWS-owned KMS key
     */
    kmsKeyId?: string;
    /**
     * Preload the data store with synthetic sample data on creation —
     * `"SYNTHEA"` loads ~100k synthetic patient records. Changing this
     * replaces the data store.
     * @default no preloaded data
     */
    preloadDataType?: healthlake.PreloadDataType;
    /**
     * Identity provider configuration for SMART on FHIR authorization.
     * Updated in place.
     * @default AWS_AUTH (SigV4)
     */
    identityProviderConfiguration?: FHIRDatastoreIdentityProviderProps;
    /**
     * User-defined tags for the data store.
     */
    tags?: Record<string, string>;
}
export interface FHIRDatastore extends Resource<"AWS.HealthLake.FHIRDatastore", FHIRDatastoreProps, {
    /** The unique ID of the datastore. */
    datastoreId: string;
    /** The ARN of the datastore. */
    datastoreArn: string;
    /** The name of the datastore. */
    datastoreName: string;
    /** The current status of the datastore (`ACTIVE`, `CREATING`, ...). */
    datastoreStatus: string;
    /** The FHIR REST API endpoint of the datastore. */
    datastoreEndpoint: string;
    /** The FHIR version of the datastore (`R4`). */
    datastoreTypeVersion: string;
    /** The tags applied to the datastore. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS HealthLake FHIR-enabled data store — a HIPAA-eligible, managed
 * store for FHIR R4 health data with a FHIR REST endpoint plus bulk
 * import/export.
 *
 * Data stores take roughly 15-30 minutes to provision (`CREATING` →
 * `ACTIVE`) and are billed while they exist; deletion is also asynchronous
 * (`DELETING` → gone). Destroy data stores you are not using.
 * ### Creating a Data Store
 * **Example:** Basic FHIR R4 Data Store
 * ```typescript
 * const datastore = yield* FHIRDatastore("Records", {});
 * ```
 *
 * **Example:** Data Store Preloaded with Synthetic Data
 * ```typescript
 * const datastore = yield* FHIRDatastore("Sandbox", {
 *   preloadDataType: "SYNTHEA",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Data Store Encrypted with a Customer-Managed KMS Key
 * ```typescript
 * const key = yield* KMS.Key("RecordsKey", {
 *   description: "healthlake data store key",
 * });
 * const datastore = yield* FHIRDatastore("Records", {
 *   kmsKeyId: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export declare const FHIRDatastore: import("../../Resource.ts").ResourceClass<FHIRDatastore>;
export declare const FHIRDatastoreProvider: () => import("effect/Layer").Layer<Provider.Provider<FHIRDatastore>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FHIRDatastore.d.ts.map