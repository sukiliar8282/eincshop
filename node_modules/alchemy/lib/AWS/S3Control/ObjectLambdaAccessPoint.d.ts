import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export interface ObjectLambdaAccessPointProps {
    /**
     * Name of the Object Lambda Access Point (3-45 characters, lowercase
     * letters, numbers and hyphens). If omitted, a unique name is generated
     * from the app, stage and logical ID.
     *
     * Changing the name replaces the access point.
     * @default ${app}-${stage}-${id}
     */
    objectLambdaAccessPointName?: string;
    /**
     * ARN of the standard (supporting) access point that the Object Lambda
     * Access Point reads through.
     */
    supportingAccessPoint: string;
    /**
     * The transformations to apply: which S3 actions to intercept
     * (`GetObject`, `HeadObject`, `ListObjects`, `ListObjectsV2`) and the
     * Lambda function that transforms them.
     */
    transformationConfigurations: s3control.ObjectLambdaTransformationConfiguration[];
    /**
     * Features the Lambda is allowed to pass through untransformed (e.g.
     * `GetObject-Range`, `GetObject-PartNumber`, `HeadObject-Range`).
     */
    allowedFeatures?: s3control.ObjectLambdaAllowedFeature[];
    /**
     * Whether CloudWatch request metrics are enabled for the access point.
     * @default false
     */
    cloudWatchMetricsEnabled?: boolean;
}
export interface ObjectLambdaAccessPoint extends Resource<"AWS.S3Control.ObjectLambdaAccessPoint", ObjectLambdaAccessPointProps, {
    /**
     * Name of the Object Lambda Access Point.
     */
    objectLambdaAccessPointName: string;
    /**
     * ARN of the Object Lambda Access Point
     * (service `s3-object-lambda`).
     */
    objectLambdaAccessPointArn: string;
    /**
     * The S3-assigned alias of the Object Lambda Access Point. The alias
     * can be used anywhere a bucket name is accepted.
     */
    alias: string | undefined;
    /**
     * AWS region of the access point.
     */
    region: RegionID;
    /**
     * AWS account ID that owns the access point.
     */
    accountId: AccountID;
}, never, Providers> {
}
/**
 * An S3 Object Lambda Access Point — intercepts S3 `GetObject` /
 * `HeadObject` / `ListObjects` requests through a supporting access point
 * and transforms responses with a Lambda function (redaction, resizing,
 * format conversion, ...).
 * ### Creating Object Lambda Access Points
 * **Example:** Transform GetObject responses with a Lambda
 * ```typescript
 * import * as S3Control from "alchemy/AWS/S3Control";
 *
 * const accessPoint = yield* S3Control.AccessPoint("data-ap", {
 *   bucket: bucket.bucketName,
 * });
 *
 * const olap = yield* S3Control.ObjectLambdaAccessPoint("transform-ap", {
 *   supportingAccessPoint: accessPoint.accessPointArn,
 *   transformationConfigurations: [
 *     {
 *       Actions: ["GetObject"],
 *       ContentTransformation: {
 *         AwsLambda: { FunctionArn: transformer.functionArn },
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Pass Range/PartNumber through and enable metrics
 * ```typescript
 * const olap = yield* S3Control.ObjectLambdaAccessPoint("transform-ap", {
 *   supportingAccessPoint: accessPoint.accessPointArn,
 *   allowedFeatures: ["GetObject-Range", "GetObject-PartNumber"],
 *   cloudWatchMetricsEnabled: true,
 *   transformationConfigurations: [
 *     {
 *       Actions: ["GetObject"],
 *       ContentTransformation: {
 *         AwsLambda: { FunctionArn: transformer.functionArn },
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const ObjectLambdaAccessPoint: import("../../Resource.ts").ResourceClass<ObjectLambdaAccessPoint>;
export declare const ObjectLambdaAccessPointProvider: () => import("effect/Layer").Layer<Provider.Provider<ObjectLambdaAccessPoint>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ObjectLambdaAccessPoint.d.ts.map