import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import type { GraphqlApi } from "./GraphqlApi.ts";
/** The data source types supported by the resource. */
export type DataSourceType = "NONE" | "AWS_LAMBDA" | "AMAZON_DYNAMODB" | "HTTP" | "AMAZON_EVENTBRIDGE";
export interface LambdaDataSourceConfig {
    /** ARN of the Lambda function this data source invokes. */
    lambdaFunctionArn: string;
}
export interface DynamodbDataSourceConfig {
    /** Name of the DynamoDB table. */
    tableName: string;
    /**
     * Region the table lives in.
     * @default the ambient AWS region
     */
    awsRegion?: string;
    /** Use the caller's credentials instead of the service role. */
    useCallerCredentials?: boolean;
    /** Whether conflict detection (versioning) is enabled. */
    versioned?: boolean;
}
export interface HttpDataSourceConfig {
    /** The HTTP endpoint, e.g. `https://api.example.com`. */
    endpoint: string;
}
export interface DataSourceProps {
    /**
     * ID of the GraphQL API this data source belongs to. Usually derived
     * from `api.apiId` by the {@link DataSource} wrapper.
     */
    apiId: string;
    /**
     * Name of the data source (`[_A-Za-z][_0-9A-Za-z]*` — no dashes). If
     * omitted, a deterministic name is generated from the app, stage, and
     * logical ID (dashes sanitized to underscores). Changing the name
     * triggers a replacement.
     */
    name?: string;
    /** Description of the data source. */
    description?: string;
    /**
     * The data source type. `NONE` (local compute), `AWS_LAMBDA`,
     * `AMAZON_DYNAMODB`, `HTTP`, or `AMAZON_EVENTBRIDGE`.
     */
    type: DataSourceType;
    /**
     * The ARN of an existing IAM role AppSync assumes to access the target.
     * When omitted (and the type needs one), a service role is created
     * automatically with `appsync.amazonaws.com` trust and least-privilege
     * access to the configured target.
     */
    serviceRoleArn?: string;
    /**
     * Additional IAM policy statements attached to the auto-created service
     * role (ignored when {@link DataSourceProps.serviceRoleArn} is provided).
     */
    policyStatements?: PolicyStatement[];
    /** Lambda target — required when `type` is `AWS_LAMBDA`. */
    lambdaConfig?: LambdaDataSourceConfig;
    /** DynamoDB target — required when `type` is `AMAZON_DYNAMODB`. */
    dynamodbConfig?: DynamodbDataSourceConfig;
    /** HTTP target — required when `type` is `HTTP`. */
    httpConfig?: HttpDataSourceConfig;
}
export interface AppSyncDataSource extends Resource<"AWS.AppSync.DataSource", DataSourceProps, {
    /** The API this data source belongs to. */
    apiId: string;
    /** The data source name (referenced by resolvers and functions). */
    name: string;
    /** The data source ARN. */
    dataSourceArn: string;
    /** The data source type. */
    type: DataSourceType;
    /** The service role AppSync assumes, if any. */
    serviceRoleArn: string | undefined;
    /**
     * Name of the auto-created service role. `undefined` when an explicit
     * {@link DataSourceProps.serviceRoleArn} is used or no role is needed.
     */
    roleName: string | undefined;
}, never, Providers> {
}
/**
 * An AppSync data source — the target a resolver reads from or writes to.
 *
 * For `AWS_LAMBDA` and `AMAZON_DYNAMODB` targets a least-privilege service
 * role is created automatically (unless an explicit `serviceRoleArn` is
 * given): `lambda:InvokeFunction` on the function, or the DynamoDB
 * read/write actions on the table and its indexes.
 * ### Creating Data Sources
 * **Example:** Lambda data source (auto-created invoke role)
 * ```typescript
 * const ds = yield* AppSync.DataSource("LambdaDS", {
 *   api,
 *   type: "AWS_LAMBDA",
 *   lambdaConfig: { lambdaFunctionArn: fn.functionArn },
 * });
 * ```
 *
 * **Example:** NONE data source (local compute)
 * ```typescript
 * const local = yield* AppSync.DataSource("Local", {
 *   api,
 *   type: "NONE",
 * });
 * ```
 *
 * **Example:** DynamoDB data source
 * ```typescript
 * const ds = yield* AppSync.DataSource("TableDS", {
 *   api,
 *   type: "AMAZON_DYNAMODB",
 *   dynamodbConfig: { tableName: table.tableName },
 * });
 * ```
 *
 * @resource
 */
export declare const DataSourceResource: import("../../Resource.ts").ResourceClass<AppSyncDataSource>;
export interface DataSourceInputProps extends Omit<{
    [K in keyof DataSourceProps]?: Input<DataSourceProps[K]>;
}, "apiId" | "type"> {
    /**
     * The `GraphqlApi` this data source belongs to (preferred). Alternatively
     * pass a raw `apiId`.
     */
    api?: GraphqlApi;
    apiId?: Input<string>;
    type: Input<DataSourceType>;
}
/**
 * User-facing wrapper for the DataSource resource. Accepts `api: GraphqlApi`
 * as the idiomatic way to attach a data source to an API.
 */
export declare const DataSource: (id: string, props: DataSourceInputProps) => Effect.Effect<AppSyncDataSource, never, Providers>;
export declare const DataSourceProvider: () => import("effect/Layer").Layer<Provider.Provider<AppSyncDataSource>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DataSource.d.ts.map