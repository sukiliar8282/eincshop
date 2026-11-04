import * as Provider from "../../Provider.ts";
import { Resource as AlchemyResource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResourceProps {
    /**
     * ARN of the S3 location to register with Lake Formation (e.g.
     * `arn:aws:s3:::my-bucket` or `arn:aws:s3:::my-bucket/prefix`). Changing it
     * replaces the registration.
     */
    resourceArn: string;
    /**
     * IAM role Lake Formation uses to vend credentials for the location. When
     * omitted, the `AWSServiceRoleForLakeFormationDataAccess` service-linked
     * role is used (and created on first registration).
     */
    roleArn?: string;
    /**
     * Register using the Lake Formation service-linked role. Only meaningful
     * when `roleArn` is omitted.
     * @default true when `roleArn` is omitted
     */
    useServiceLinkedRole?: boolean;
    /**
     * Whether to register the location with federation (Redshift data sharing).
     * @default false
     */
    withFederation?: boolean;
    /**
     * Allow both Lake Formation permissions and IAM/S3 policies to govern
     * access to the location (hybrid access mode).
     * @default false
     */
    hybridAccessEnabled?: boolean;
}
export interface Resource extends AlchemyResource<"AWS.LakeFormation.Resource", ResourceProps, {
    resourceArn: string;
    roleArn: string | undefined;
    withFederation: boolean | undefined;
    hybridAccessEnabled: boolean | undefined;
}, {}, Providers> {
}
/**
 * Registers an S3 location as managed by AWS Lake Formation, so Lake
 * Formation can vend temporary credentials for data stored there
 * (`DATA_LOCATION_ACCESS` grants, governed tables, etc.).
 *
 * ### Registering Locations
 * **Example:** Register a Bucket with the Service-Linked Role
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("DataLake", {});
 * const location = yield* AWS.LakeFormation.Resource("DataLakeLocation", {
 *   resourceArn: bucket.bucketArn,
 * });
 * ```
 *
 * **Example:** Register with a Custom Data-Access Role
 * ```typescript
 * const location = yield* AWS.LakeFormation.Resource("DataLakeLocation", {
 *   resourceArn: bucket.bucketArn,
 *   roleArn: dataAccessRole.roleArn,
 *   hybridAccessEnabled: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Resource: import("../../Resource.ts").ResourceClass<Resource>;
export declare const ResourceProvider: () => import("effect/Layer").Layer<Provider.Provider<Resource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Resource.d.ts.map