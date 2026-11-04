import * as ecr from "@distilled.cloud/aws/ecr";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AccountID } from "../Environment.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { RegionID } from "../Region.ts";
export type RepositoryName = string;
export type RepositoryArn = `arn:aws:ecr:${RegionID}:${AccountID}:repository/${RepositoryName}`;
export type RepositoryUri = `${AccountID}.dkr.ecr.${RegionID}.amazonaws.com/${RepositoryName}`;
export interface RepositoryProps {
    /**
     * Name of the repository. If omitted, a unique name is generated.
     */
    repositoryName?: string;
    /**
     * Image tag mutability setting.
     * @default "MUTABLE"
     */
    imageTagMutability?: ecr.ImageTagMutability;
    /**
     * Whether enhanced image scanning should run on push.
     */
    scanOnPush?: boolean;
    /**
     * Optional lifecycle policy document JSON.
     */
    lifecyclePolicyText?: string;
    /**
     * Repository permission policy controlling access from other AWS
     * principals — either a structured IAM {@link PolicyDocument} or a raw
     * JSON string (escape hatch / adoption of an existing policy). Omitting
     * the prop removes any repository policy.
     */
    policy?: PolicyDocument | string;
    /**
     * User-defined tags to apply to the repository.
     */
    tags?: Record<string, string>;
}
export interface Repository extends Resource<"AWS.ECR.Repository", RepositoryProps, {
    /** The name of the repository. */
    repositoryName: RepositoryName;
    /** The ARN of the repository. */
    repositoryArn: RepositoryArn;
    /** The URI used to push/pull images, e.g. `<account>.dkr.ecr.<region>.amazonaws.com/<name>`. */
    repositoryUri: RepositoryUri;
    /** The AWS account ID of the registry. */
    registryId: string;
    /** Whether image tags are `MUTABLE` or `IMMUTABLE`. */
    imageTagMutability: ecr.ImageTagMutability;
    /** Whether repository images are scanned when they are pushed. */
    scanOnPush: boolean;
    /** The JSON lifecycle policy applied to the repository, if any. */
    lifecyclePolicyText?: string;
    /** The JSON repository permissions policy, if any. */
    policy?: string;
    /** The tags attached to the repository. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon ECR repository for container images.
 * ### Creating Repositories
 * **Example:** Task Image Repository
 * ```typescript
 * const repo = yield* Repository("TaskRepository", {
 *   scanOnPush: true,
 * });
 * ```
 *
 * ### Repository Policies
 * **Example:** Grant Lambda Pull Access
 * ```typescript
 * const repo = yield* Repository("LambdaImages", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Sid: "LambdaECRImageRetrieval",
 *         Effect: "Allow",
 *         Principal: { Service: "lambda.amazonaws.com" },
 *         Action: ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"],
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Repository: import("../../Resource.ts").ResourceClass<Repository>;
export declare const RepositoryProvider: () => import("effect/Layer").Layer<Provider.Provider<Repository>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Repository.d.ts.map