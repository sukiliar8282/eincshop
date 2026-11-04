import * as Provider from "../../Provider.ts";
import { Resource as makeResource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CloudControlResourceProps {
    /**
     * The CloudFormation resource type name, e.g. `"AWS::SNS::Topic"` or
     * `"AWS::SSM::Parameter"`. Changing the type replaces the resource. See the
     * Cloud Control API's supported resource types in the AWS documentation.
     */
    typeName: string;
    /**
     * A specific version of the resource type to use. Defaults to the account's
     * default version.
     */
    typeVersionId?: string;
    /**
     * The desired state of the resource as a plain object matching the CFN
     * resource type's property schema (e.g. `{ Name, Type, Value }` for
     * `AWS::SSM::Parameter`). Only the keys you specify are managed — on update,
     * a JSON Patch is computed over exactly these keys, so create-only
     * properties you never change are left untouched.
     */
    desiredState: Record<string, unknown>;
    /**
     * ARN of an IAM role Cloud Control assumes to perform the operation.
     * Defaults to the deploying principal's credentials.
     */
    roleArn?: string;
}
export interface CloudControlResource extends makeResource<"AWS.CloudControl.Resource", CloudControlResourceProps, {
    /** The CloudFormation resource type name (e.g. `AWS::SSM::Parameter`). */
    typeName: string;
    /** The resource's primary identifier assigned by Cloud Control. */
    identifier: string;
    /** The observed properties of the resource as a plain object. */
    properties: Record<string, unknown>;
}, never, Providers> {
}
/**
 * A generic AWS resource managed through the Cloud Control API — the escape
 * hatch that covers hundreds of CloudFormation resource types with a single
 * Alchemy resource.
 *
 * Provide a CloudFormation `typeName` and a `desiredState` object; the provider
 * drives Cloud Control's asynchronous create/update/delete and polls the
 * request token (bounded) until it reaches `SUCCESS`, surfacing a `FAILED`
 * operation as a typed error rather than hanging. Updates are expressed as an
 * RFC 6902 JSON Patch computed over the keys you specify.
 * ### Managing a Resource
 * **Example:** SSM Parameter
 * ```typescript
 * const param = yield* CloudControl.Resource("Greeting", {
 *   typeName: "AWS::SSM::Parameter",
 *   desiredState: {
 *     Name: "/app/greeting",
 *     Type: "String",
 *     Value: "hello",
 *   },
 * });
 * // param.identifier -> "/app/greeting"
 * // param.properties.Value -> "hello"
 * ```
 *
 * **Example:** SNS Topic
 * ```typescript
 * const topic = yield* CloudControl.Resource("Alerts", {
 *   typeName: "AWS::SNS::Topic",
 *   desiredState: { TopicName: "alerts", DisplayName: "Alerts" },
 * });
 * // topic.identifier -> "arn:aws:sns:us-west-2:...:alerts"
 * ```
 *
 * @resource
 */
export declare const Resource: import("../../Resource.ts").ResourceClass<CloudControlResource>;
export declare const CloudControlResourceProvider: () => import("effect/Layer").Layer<Provider.Provider<CloudControlResource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Resource.d.ts.map