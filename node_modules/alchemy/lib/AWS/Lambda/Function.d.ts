import type { Credentials } from "@distilled.cloud/aws/Credentials";
import * as Lambda from "@distilled.cloud/aws/lambda";
import { Region } from "@distilled.cloud/aws/Region";
import type * as lambda from "aws-lambda";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as rolldown from "rolldown";
import type * as Bundle from "../../Bundle/Bundle.ts";
import type { PackageInstall } from "../../Bundle/InstalledPackages.ts";
import { Platform, type Main, type PlatformProps } from "../../Platform.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import * as Serverless from "../../Serverless/index.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import { type EventInvokeConfig } from "./EventInvokeConfig.ts";
import { type FunctionImageAttributes, type FunctionImageSource } from "./FunctionImage.ts";
export type { FunctionImageSource } from "./FunctionImage.ts";
export declare const FunctionTypeId: "AWS.Lambda.Function";
export type FunctionTypeId = typeof FunctionTypeId;
declare const HandlerContext_base: Context.ServiceClass<HandlerContext, "AWS.Lambda.HandlerContext", lambda.Context>;
export declare class HandlerContext extends HandlerContext_base {
}
export declare const isFunction: (value: any) => value is Function;
/**
 * True for any Alchemy host that accepts the `{ env, policyStatements }`
 * binding contract: the Lambda `Function`, the ECS `Task` and `Service`, and
 * the EKS `ServerHost`. AWS `Binding.Service` implementations guard their
 * deploy-time
 * `host.bind` registration with this predicate so every existing capability
 * (S3, DynamoDB, SQS, …) lands its IAM on whichever of the three hosts is in
 * context — the Lambda execution role, the ECS task role, or the EKS
 * pod-identity role.
 *
 * The type guard narrows to `Function` deliberately: all three hosts expose an
 * identical `{ env, policyStatements }` bind contract and only `host.bind` /
 * `host.LogicalId` are ever touched inside the guarded block, so downstream
 * typing is unchanged while the runtime check widens to all three.
 */
export declare const isBindingHost: (value: any) => value is Function;
export interface FunctionBuildOptions extends Partial<rolldown.InputOptions>, Bundle.BundleExtraOptions {
    /**
     * Native or Node-only packages to install into the Lambda artifact with npm,
     * targeting Linux and the function's architecture.
     *
     * @example
     * ```typescript
     * build: { install: ["sharp"] }
     * ```
     *
     * @example
     * ```typescript
     * build: { install: { sharp: "^0.33.5" } }
     * ```
     */
    readonly install?: PackageInstall;
    readonly output?: Partial<rolldown.OutputOptions>;
}
export type FunctionArchitecture = "x86_64" | "arm64";
/**
 * Overrides for instructions declared by a Lambda container image. Set
 * directly on {@link FunctionImageProps.image} alongside the image source;
 * omit to use the image's own `CMD` / `ENTRYPOINT` / `WORKDIR`.
 */
export interface FunctionImageConfig {
    /** Parameters passed to the image entry point, overriding Dockerfile `CMD`. */
    command?: readonly string[];
    /** Runtime executable, overriding Dockerfile `ENTRYPOINT`. */
    entryPoint?: readonly string[];
    /** Working directory, overriding Dockerfile `WORKDIR`. */
    workingDirectory?: string;
}
/**
 * Reference to an EFS access point: a raw access point ARN or anything
 * exposing an `accessPointArn` attribute (e.g. an `AWS.EFS.AccessPoint`
 * resource).
 */
export type AccessPointRef = string | {
    accessPointArn: string;
};
/**
 * Reference to a Lambda layer version: a raw layer version ARN or anything
 * exposing a `layerVersionArn` attribute (e.g. an `AWS.Lambda.LayerVersion`
 * resource).
 */
export type LayerRef = string | {
    layerVersionArn: string;
};
/** Resolve a {@link LayerRef} to its layer version ARN. */
export declare const layerVersionArnOf: (layer: LayerRef) => string;
export interface FunctionUrlConfig {
    /**
     * Authentication type for the Lambda function URL.
     * `NONE` creates a public endpoint. `AWS_IAM` requires SigV4-signed callers.
     * @default "NONE"
     */
    authType?: Lambda.FunctionUrlAuthType;
    /**
     * Cross-origin resource sharing configuration for the function URL.
     */
    cors?: Lambda.Cors;
    /**
     * Invocation mode for the function URL.
     * @default "BUFFERED"
     */
    invokeMode?: Lambda.InvokeMode;
}
export interface FunctionCommonProps extends PlatformProps {
    /**
     * Whether to create a Lambda function URL, or its configuration.
     * `functionUrl: true` creates a public Function URL with `authType: "NONE"`.
     * Set `functionUrl: false` to disable the Function URL.
     * @default true
     */
    functionUrl?: boolean | FunctionUrlConfig;
    functionName?: string;
    /**
     * Instruction set architecture for the Lambda function.
     */
    architecture?: FunctionArchitecture;
    memorySize?: number;
    env?: Record<string, any>;
    /**
     * Attach the function to a VPC for private AWS connectivity such as Aurora.
     */
    vpc?: {
        subnetIds: string[];
        securityGroupIds: string[];
    };
    /**
     * EFS file systems to mount into the function's execution environment.
     * Each entry mounts an EFS access point — pass the `AWS.EFS.AccessPoint`
     * resource itself (or its ARN) — at a local path that must begin with
     * `/mnt/`. Requires `vpc`: the function must be attached to a VPC that can
     * reach an available EFS mount target for the file system. The execution
     * role is automatically granted EFS client access
     * (`AmazonElasticFileSystemClientReadWriteAccess`).
     *
     * Prefer the host-agnostic `AWS.EFS.Mount` binding
     * (`yield* AWS.EFS.mount(accessPoint, { path: "/mnt/data" })` inside the
     * function body with the `AWS.EFS.MountLive` layer) — it wires the same
     * config plus least-privilege IAM through the binding channel and also
     * works on ECS.
     */
    fileSystemConfigs?: {
        /**
         * The EFS access point to mount — an `AWS.EFS.AccessPoint` resource or
         * its ARN. Exactly one of `accessPoint` or `arn` is required.
         */
        accessPoint?: AccessPointRef;
        /**
         * ARN of the EFS access point to mount
         * (e.g. `accessPoint.accessPointArn`). Alias of {@link accessPoint} for
         * raw-string configs.
         */
        arn?: string;
        /**
         * Local mount path inside the function. Must begin with `/mnt/`
         * (e.g. `/mnt/files`).
         */
        localMountPath: string;
    }[];
    /**
     * Maximum execution time before the function is forcibly terminated.
     * Rounded up to whole seconds.
     *
     * @default 3 seconds (AWS Lambda default)
     */
    timeout?: Duration.Duration;
    /**
     * Maximum number of concurrent executions reserved for this function.
     * Omit to remove the function-level reserved concurrency limit.
     */
    reservedConcurrentExecutions?: number;
    /**
     * AWS X-Ray tracing mode for the function.
     *
     * `"Active"` samples and records incoming requests as X-Ray traces and
     * attaches the `AWSXRayDaemonWriteAccess` managed policy to the execution
     * role so the runtime can publish trace segments. `"PassThrough"` only
     * forwards an upstream trace header without sampling.
     *
     * @default "PassThrough"
     */
    tracing?: "Active" | "PassThrough";
    /**
     * Asynchronous invocation settings (retries, event age, destinations) for
     * the unqualified function. Omit to remove any existing config and fall
     * back to Lambda's defaults (2 retries, 6-hour max event age, no
     * destinations). Use {@link AliasProps.eventInvokeConfig} to scope the
     * config to an alias instead.
     */
    eventInvokeConfig?: EventInvokeConfig;
}
export interface FunctionZipProps extends FunctionCommonProps {
    /**
     * Entry module for the bundled Lambda function.
     */
    main: string;
    /**
     * Set to `false` to skip bundling and deploy `main`'s directory as-is:
     * every file in the directory containing `main` ships in the code
     * archive, preserving relative paths. Use for framework outputs that are
     * already self-contained deployment units (e.g. nitro's
     * `.output/server`, OpenNext's server functions) where re-bundling can
     * break `require`s of packaged `node_modules`. Implies external mode:
     * `handler` names an export of `main`, and the Lambda handler string is
     * derived from `main`'s basename (e.g. `index.mjs` → `index.handler`).
     * @default true
     */
    bundle?: false;
    image?: never;
    /**
     * Exported handler symbol inside the bundled module.
     * @default "handler"
     */
    handler?: string;
    runtime?: "nodejs22.x" | "nodejs24.x";
    /**
     * Lambda layers to attach — pass an `AWS.Lambda.LayerVersion` resource
     * directly, or a raw layer version ARN (e.g. an AWS-managed layer). Layers
     * are extracted into `/opt` in the order given. Omit or pass `[]` to detach
     * every layer.
     */
    layers?: LayerRef[];
    /**
     * Bundler configuration for {@link main}: rolldown input options, `output`
     * overrides, `install` for native packages, `pure`, and the bundle analyzer.
     * Unused code is tree-shaken. `effect`, alchemy, and `@distilled.cloud`
     * are marked pure so unused parts prune more aggressively. List extra
     * packages with `pure.packages`, or disable with `pure: false`.
     */
    build?: FunctionBuildOptions;
    uploadSourceMap?: boolean;
    exports?: string[];
    /**
     * Wire-level `DurableConfig` applied at `CreateFunction`.
     *
     * @internal Set exclusively by the `AWS.Lambda.DurableFunction` wrapper —
     * never set this directly. Durability is a **create-time** property of a
     * Lambda function, so a presence change replaces the function (see `diff`).
     * The base Function is otherwise durability-agnostic; author durable
     * orchestrators with `AWS.Lambda.DurableFunction`.
     */
    durableConfig?: Lambda.DurableConfig;
}
export interface FunctionImageProps extends FunctionCommonProps {
    main?: never;
    /**
     * Instruction set architecture for the Lambda function and its image build.
     * `x86_64` builds `linux/amd64`; `arm64` builds `linux/arm64`.
     */
    architecture: FunctionArchitecture;
    /**
     * Deploy an existing private ECR image, or build a Lambda-compatible image
     * from a local Docker context. Local builds use a managed private ECR
     * repository with content-addressed tags.
     */
    image: FunctionImageSource;
    handler?: never;
    runtime?: never;
    layers?: never;
    build?: never;
    uploadSourceMap?: never;
    exports?: never;
    durableConfig?: never;
}
export type FunctionProps = FunctionZipProps | FunctionImageProps;
interface FunctionPackageValidationProps {
    image?: unknown;
    main?: unknown;
    handler?: unknown;
    runtime?: unknown;
    layers?: unknown;
    build?: unknown;
    uploadSourceMap?: unknown;
    exports?: unknown;
    durableConfig?: unknown;
}
/**
 * Validate package-mode exclusivity before any Lambda or ECR mutation.
 * @internal
 */
export declare const validateFunctionPackageProps: (id: string, props: FunctionPackageValidationProps) => Effect.Effect<undefined, Error, never>;
/**
 * Normalize a {@link FunctionProps.timeout} to whole seconds.
 *
 * State JSON round-trips flatten a `Duration` to its `toJSON` shape
 * (`{_id:"Duration",_tag:"Millis"|"Nanos"|"Infinity",...}`), which is not a
 * valid `Duration.Input`. Reconstruct an input that `Duration.toSeconds`
 * accepts before delegating.
 */
export declare const toTimeoutSeconds: (timeout: Duration.Duration | undefined) => number | undefined;
export interface Function extends Resource<FunctionTypeId, FunctionProps, {
    functionArn: string;
    functionName: string;
    functionUrl: string | undefined;
    roleName: string;
    roleArn: string;
    code: {
        hash: string;
        image?: Omit<FunctionImageAttributes, "hash">;
    };
    reservedConcurrentExecutions?: number;
}, {
    env?: Record<string, any>;
    policyStatements?: PolicyStatement[];
    /**
     * VPC attachment requested by a binding (e.g. `RDS.Connect` with
     * `subnetIds`/`securityGroupIds`). Merged (set-union) with the
     * Function's own `vpc` prop and any other bindings' requests — both
     * paths converge on the same underlying Lambda VPC config.
     */
    vpc?: {
        subnetIds: string[];
        securityGroupIds: string[];
    };
    /**
     * EFS mounts requested through the binding channel (e.g. `EFS.Mount`).
     * Merged (deduped by `localMountPath`) with the Function's own
     * `fileSystemConfigs` prop.
     */
    fileSystemConfigs?: {
        /** ARN of the EFS access point to mount. */
        arn: string;
        /** Local mount path inside the function (must begin with `/mnt/`). */
        localMountPath: string;
    }[];
}, Providers> {
}
export type FunctionServices = Credentials | Region | AWSEnvironment;
export type FunctionShape = Main<FunctionServices>;
export interface NormalizedFunctionUrlConfig {
    authType: Lambda.FunctionUrlAuthType;
    cors?: Lambda.Cors;
    invokeMode: Lambda.InvokeMode;
}
export declare const normalizeFunctionUrl: (url?: FunctionProps["functionUrl"]) => NormalizedFunctionUrlConfig | undefined;
/**
 * An AWS Lambda host resource that combines code bundling, IAM role
 * provisioning, and runtime binding collection.
 *
 * `Function` is the canonical runtime host for AWS. It can either bundle a
 * TypeScript entry module into a zip artifact or build a user-authored
 * Dockerfile into a Lambda container image. In both modes Alchemy creates the
 * execution role and applies bindings; image mode additionally owns the
 * private ECR repository and Lambda pull policy.
 *
 * Zip-packaged functions can be defined in two ways:
 *
 * - **Async** — plain handler export, no Effect runtime in the bundle.
 * - **Effect** — Effect implementation with typed bindings and event sources.
 *
 * See [Effect handlers vs async handlers](/infrastructure-as-effects/runtime#effect-handlers-vs-async-handlers)
 * for plain handler patterns, or the
 * [Lambda guide](/aws/compute/lambda)
 * for the full Effect-based approach with bindings, event sources, and sinks.
 *
 * :::caution[Request finalizers block the response — there is no `waitUntil` on Lambda]
 * `Effect.addFinalizer` in a handler runs **before the response is
 * returned**: a buffered invocation's response is not released until the
 * Invoke phase completes, and no deferral scheme is reliable (dangling
 * promises are dropped on crash/timeout resets and their sockets rarely
 * survive the freeze — silent data loss). Keep request finalizers cheap
 * (closing a pool is milliseconds), and write anything that must not be
 * lost durably — a queue, a table — inside the handler itself. Init-level
 * finalizers instead run in the 500 ms `SIGTERM` window at sandbox
 * shutdown, which the generated entry obtains by registering an internal
 * extension. See
 * [Sandbox scope vs invocation scope](/aws/compute/lambda#sandbox-scope-vs-invocation-scope).
 * :::
 * ### Async Functions
 * Point `main` at a file that exports a standard Lambda handler. No
 * Effect runtime is included in the bundle. Useful when migrating
 * existing Lambda functions or when you don't need Effect.
 *
 * **Example:** Defining an async Lambda in your stack
 * ```typescript
 * // alchemy.run.ts
 * import * as AWS from "alchemy/AWS";
 *
 * const func = yield* AWS.Lambda.Function("ApiFunction", {
 *   main: "./src/handler.ts",
 *   functionUrl: true,
 * });
 * ```
 *
 * **Example:** Function using ARM64
 * ```typescript
 * const func = yield* AWS.Lambda.Function("ArmFunction", {
 *   main: "./src/handler.ts",
 *   architecture: "arm64",
 * });
 * ```
 *
 * **Example:** Function with a native package (Sharp)
 * ```typescript
 * const func = yield* AWS.Lambda.Function("ImageProcessor", {
 *   main: "./src/handler.ts",
 *   architecture: "arm64",
 *   build: {
 *     install: ["sharp"],
 *   },
 * });
 * ```
 *
 * **Example:** Writing the async handler
 * ```typescript
 * // src/handler.ts
 * export const handler = async (event: any) => {
 *   return {
 *     statusCode: 200,
 *     body: JSON.stringify({ message: "Hello from Lambda!" }),
 *   };
 * };
 * ```
 *
 * ### Container Image Functions
 * Set `image` instead of `main` to deploy an existing private ECR image or to
 * build and publish a local Docker context. Image sources must be literal
 * because Lambda's pre-create phase needs the deployable image before normal
 * Output resolution.
 *
 * #### Existing ECR image with runtime overrides
 * ```typescript
 * const func = yield* AWS.Lambda.Function("Worker", {
 *   image: {
 *     uri: "123456789012.dkr.ecr.us-east-1.amazonaws.com/worker@sha256:...",
 *     command: ["app.handler"],
 *     entryPoint: ["/lambda-entrypoint.sh"],
 *     workingDirectory: "/var/task",
 *   },
 *   architecture: "x86_64",
 * });
 * ```
 *
 * Tagged URIs are resolved through ECR on each plan. If a tag is repointed to
 * a new digest, Alchemy updates the Lambda function even though the URI string
 * is unchanged. External repositories are never modified or deleted.
 *
 * #### Build a Lambda container image
 * ```typescript
 * const func = yield* AWS.Lambda.Function("JavaFunction", {
 *   image: {
 *     context: "./lambda",
 *     dockerfile: "Dockerfile",
 *     buildArgs: {
 *       APP_ENV: "production",
 *     },
 *   },
 *   architecture: "arm64",
 *   functionUrl: false,
 * });
 * ```
 *
 * The Dockerfile owns the runtime and handler. Alchemy does not generate a
 * Node.js adapter or otherwise impose a language. For example,
 * `./lambda/Dockerfile` can use AWS's Java base image:
 *
 * ```dockerfile
 * FROM public.ecr.aws/lambda/java:21
 * COPY target/function.jar ${LAMBDA_TASK_ROOT}/lib/
 * CMD ["com.example.Handler::handleRequest"]
 * ```
 *
 * ### Effect Functions
 * Pass the Effect implementation as the third argument. Bindings
 * attach IAM permissions and environment variables at deploy time,
 * while the runtime execution context collects listeners and exports.
 *
 * **Example:** Effect Function with HTTP handler
 * ```typescript
 * export default class ApiFunction extends AWS.Lambda.Function<ApiFunction>()(
 *   "ApiFunction",
 *   { main: import.meta.url, functionUrl: true },
 *   Effect.gen(function* () {
 *     // init: bind resources
 *     const getItem = yield* AWS.DynamoDB.GetItem(table);
 *
 *     return {
 *       // runtime: use them
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         const url = new URL(request.url);
 *         const id = url.searchParams.get("id");
 *         const result = yield* getItem({ Key: { pk: { S: id! } } });
 *         return yield* HttpServerResponse.json(result.Item);
 *       }),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * ### Configuration
 * **Example:** Function with URL
 * ```typescript
 * const func = yield* AWS.Lambda.Function("ApiFunction", {
 *   main: "./src/handler.ts",
 *   functionUrl: true,
 * });
 * ```
 *
 * **Example:** Function URL with IAM auth
 * ```typescript
 * const func = yield* AWS.Lambda.Function("ApiFunction", {
 *   main: "./src/handler.ts",
 *   functionUrl: {
 *     authType: "AWS_IAM",
 *   },
 * });
 * ```
 *
 * **Example:** Function in a VPC
 * ```typescript
 * const func = yield* AWS.Lambda.Function("VpcFunction", {
 *   main: "./src/handler.ts",
 *   vpc: {
 *     subnetIds: ["subnet-abc123", "subnet-def456"],
 *     securityGroupIds: ["sg-xyz789"],
 *   },
 * });
 * ```
 *
 * **Example:** Async invocation retries and failure destination
 * ```typescript
 * const func = yield* AWS.Lambda.Function("AsyncFunction", {
 *   main: "./src/handler.ts",
 *   eventInvokeConfig: {
 *     maximumRetryAttempts: 0,
 *     maximumEventAge: "1 minute",
 *     destinationConfig: {
 *       OnFailure: {
 *         Destination: queue.queueArn,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Bundling & Tree-shaking
 * `main` is bundled with rolldown at deploy time. Unused code is
 * tree-shaken. `effect`, alchemy, and `@distilled.cloud` are marked
 * pure so unused parts prune more aggressively. Your app is not
 * marked pure.
 *
 * **Example:** Mark additional packages as pure
 * Only list packages with no top-level side effects.
 * ```typescript
 * const func = yield* AWS.Lambda.Function("ApiFunction", {
 *   main: "./src/handler.ts",
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * });
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * const func = yield* AWS.Lambda.Function("ApiFunction", {
 *   main: "./src/handler.ts",
 *   build: { pure: false },
 * });
 * ```
 *
 * ### EFS File Systems
 * Mount an EFS access point into the function's `/mnt/…` file system. The
 * function must be attached to a VPC that can reach an EFS mount target for
 * the file system.
 *
 * **Example:** Mount an EFS access point via props
 * ```typescript
 * const accessPoint = yield* AWS.EFS.AccessPoint("FilesAccess", {
 *   fileSystemId: fileSystem.fileSystemId,
 *   posixUser: { uid: 1000, gid: 1000 },
 * });
 *
 * const func = yield* AWS.Lambda.Function("FilesFunction", {
 *   main: "./src/handler.ts",
 *   vpc: { subnetIds, securityGroupIds },
 *   fileSystemConfigs: [
 *     // pass the AccessPoint resource itself (or its ARN via `arn`)
 *     { accessPoint, localMountPath: "/mnt/files" },
 *   ],
 * });
 * ```
 *
 * **Example:** Mount via the host-agnostic EFS.mount binding
 * `EFS.mount` wires the same mount config plus least-privilege IAM through
 * the binding channel and works on both Lambda and ECS hosts.
 * ```typescript
 * export default class FilesFunction extends AWS.Lambda.Function<FilesFunction>()(
 *   "FilesFunction",
 *   { main: import.meta.url, vpc: { subnetIds, securityGroupIds } },
 *   Effect.gen(function* () {
 *     const files = yield* AWS.EFS.mount(accessPoint, { path: "/mnt/files" });
 *     return Effect.fn(function* (event: unknown) {
 *       return { mountedAt: files.path };
 *     });
 *   }).pipe(Effect.provide(AWS.EFS.MountLive)),
 * ) {}
 * ```
 *
 * ### S3 Bindings
 * Bind S3 operations in the init phase to give the function IAM
 * permissions and inject the bucket name as an environment variable.
 *
 * **Example:** Read and write S3 objects
 * ```typescript
 * // init
 * const getObject = yield* S3.GetObject(bucket);
 * const putObject = yield* S3.PutObject(bucket);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* putObject({ Key: "hello.txt", Body: "Hello!" });
 *     const obj = yield* getObject({ Key: "hello.txt" });
 *     return HttpServerResponse.text("OK");
 *   }),
 * };
 * ```
 *
 * ### DynamoDB Bindings
 * Bind DynamoDB operations in the init phase to grant table-scoped
 * IAM permissions.
 *
 * **Example:** Get and put items
 * ```typescript
 * // init
 * const getItem = yield* AWS.DynamoDB.GetItem(table);
 * const putItem = yield* AWS.DynamoDB.PutItem(table);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* putItem({ Item: { pk: { S: "user#1" }, name: { S: "Alice" } } });
 *     const result = yield* getItem({ Key: { pk: { S: "user#1" } } });
 *     return yield* HttpServerResponse.json(result.Item);
 *   }),
 * };
 * ```
 *
 * ### SQS Bindings
 * Bind SQS operations in the init phase to send messages to a queue.
 *
 * **Example:** Send a message
 * ```typescript
 * // init
 * const sendMessage = yield* SQS.SendMessage(queue);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* sendMessage({
 *       MessageBody: JSON.stringify({ orderId: "123" }),
 *     });
 *     return HttpServerResponse.text("Queued");
 *   }),
 * };
 * ```
 *
 * ### SNS Bindings
 * Bind SNS operations in the init phase to publish messages to a
 * topic.
 *
 * **Example:** Publish a notification
 * ```typescript
 * // init
 * const publish = yield* AWS.SNS.Publish(topic);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* publish({
 *       Message: JSON.stringify({ event: "order.created" }),
 *       Subject: "OrderCreated",
 *     });
 *     return HttpServerResponse.text("Published");
 *   }),
 * };
 * ```
 *
 * ### Kinesis Bindings
 * Bind Kinesis operations in the init phase to put records into a
 * stream.
 *
 * **Example:** Put a record
 * ```typescript
 * // init
 * const putRecord = yield* AWS.Kinesis.PutRecord(stream);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     yield* putRecord({
 *       PartitionKey: "order-123",
 *       Data: new TextEncoder().encode(JSON.stringify({ orderId: "123" })),
 *     });
 *     return HttpServerResponse.text("Sent");
 *   }),
 * };
 * ```
 *
 * ### Event Sources
 * Lambda functions can be triggered by event sources like SQS queues,
 * DynamoDB streams, S3 notifications, SNS topics, and Kinesis streams.
 *
 * **Example:** Process SQS messages
 * ```typescript
 * yield* SQS.consumeQueueMessages(queue,
 *   Effect.fn(function* (message) {
 *     yield* Effect.log(`Received: ${message.body}`);
 *   }),
 * );
 * ```
 *
 * **Example:** Process DynamoDB stream changes
 * ```typescript
 * yield* AWS.DynamoDB.consumeTableChanges(table, {
 *   StreamViewType: "NEW_AND_OLD_IMAGES",
 * },
 *   Effect.fn(function* (record) {
 *     yield* Effect.log(`Change: ${record.eventName}`);
 *   }),
 * );
 * ```
 *
 * **Example:** Process S3 notifications
 * ```typescript
 * yield* AWS.S3.consumeBucketEvents(bucket, {
 *   events: ["s3:ObjectCreated:*"],
 * }, (stream) =>
 *   stream.pipe(
 *     Stream.runForEach((event) =>
 *       Effect.log(`New object: ${event.key}`),
 *     ),
 *   ),
 * );
 * ```
 *
 * @resource
 */
export declare const Function: Platform<Function, FunctionServices, FunctionShape, Serverless.FunctionContext, {}, FunctionZipProps>;
export declare const FunctionProvider: () => Layer.Layer<Provider.Provider<Function>, never, any>;
//# sourceMappingURL=Function.d.ts.map