import type { Region } from "@distilled.cloud/aws/Region";
import type * as Duration from "effect/Duration";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Bundle from "../../Bundle/Bundle.ts";
import { Docker } from "../../Docker/Docker.ts";
import { Platform, type Main, type PlatformProps } from "../../Platform.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { type HostRuntimeContext, type ServerHost } from "../../Server/Process.ts";
import { Stack } from "../../Stack.ts";
import type { Credentials } from "../Credentials.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
/**
 * Container image source for an App Runner service.
 */
export interface ServiceImageRepository {
    /**
     * Image identifier: a private ECR image URI
     * (`{account}.dkr.ecr.{region}.amazonaws.com/{repo}:{tag}`) or a public
     * ECR image (`public.ecr.aws/{alias}/{repo}:{tag}`).
     */
    imageIdentifier: string;
    /**
     * Repository type. `ECR` (private, requires `accessRoleArn`) or
     * `ECR_PUBLIC` (public gallery images, no access role).
     */
    imageRepositoryType: "ECR" | "ECR_PUBLIC";
    /**
     * Port the application listens on.
     * @default "8080"
     */
    port?: string;
    /**
     * Command App Runner runs to start the container. Overrides the image's
     * default start command.
     */
    startCommand?: string;
    /**
     * Environment variables available to the running service.
     */
    runtimeEnvironmentVariables?: Record<string, string>;
    /**
     * Secrets exposed as environment variables. Values are Secrets Manager
     * secret ARNs or SSM parameter ARNs (the instance role must be able to
     * read them).
     */
    runtimeEnvironmentSecrets?: Record<string, string>;
}
/**
 * Compute resources for each instance of the service.
 */
export interface ServiceInstanceConfiguration {
    /**
     * CPU units per instance: `"256"` (0.25 vCPU), `"512"`, `"1024"`,
     * `"2048"`, or `"4096"`. The `"0.25 vCPU"`-style forms are also
     * accepted.
     * @default "1024"
     */
    cpu?: string;
    /**
     * Memory per instance in MB: `"512"`, `"1024"`, `"2048"`, `"3072"`,
     * `"4096"`, `"6144"`, `"8192"`, `"10240"`, or `"12288"`. The
     * `"2 GB"`-style forms are also accepted.
     * @default "2048"
     */
    memory?: string;
    /**
     * IAM role assumed by the running service (analogous to an ECS task
     * role). Required when the app calls AWS APIs or reads
     * `runtimeEnvironmentSecrets`. For the Effect-native form (`main`),
     * Alchemy provisions and manages this role automatically.
     */
    instanceRoleArn?: string;
}
/**
 * Health check App Runner performs against the service.
 */
export interface ServiceHealthCheckConfiguration {
    /**
     * Health check protocol.
     * @default "TCP"
     */
    protocol?: "TCP" | "HTTP";
    /**
     * URL path for HTTP health checks.
     * @default "/"
     */
    path?: string;
    /**
     * Time between health checks, e.g. `"5 seconds"` or
     * `Duration.seconds(5)` (1-20 seconds on the wire).
     * @default "5 seconds"
     */
    interval?: Duration.Input;
    /**
     * Time to wait for a response, e.g. `"2 seconds"` or
     * `Duration.seconds(2)` (1-20 seconds on the wire).
     * @default "2 seconds"
     */
    timeout?: Duration.Input;
    /**
     * Consecutive successful checks before the target is healthy (1-20).
     * @default 1
     */
    healthyThreshold?: number;
    /**
     * Consecutive failed checks before the target is unhealthy (1-20).
     * @default 5
     */
    unhealthyThreshold?: number;
}
/**
 * Network settings for inbound and outbound service traffic.
 */
export interface ServiceNetworkConfiguration {
    /**
     * Outbound traffic routing. `DEFAULT` egresses through App Runner;
     * `VPC` routes through the VPC connector named by `vpcConnectorArn`.
     * @default "DEFAULT"
     */
    egressType?: "DEFAULT" | "VPC";
    /**
     * ARN of the App Runner VPC connector for `egressType: "VPC"`.
     */
    vpcConnectorArn?: string;
    /**
     * Whether the service is reachable from the public internet. Set to
     * false to only allow access from a VPC ingress connection.
     * @default true
     */
    isPubliclyAccessible?: boolean;
    /**
     * IP address type for the public endpoint.
     * @default "IPV4"
     */
    ipAddressType?: "IPV4" | "DUAL_STACK";
}
/**
 * Observability (tracing) settings for the service.
 */
export interface ServiceObservabilityProps {
    /**
     * Whether observability (X-Ray tracing) is enabled for the service.
     */
    observabilityEnabled: boolean;
    /**
     * ARN of the App Runner observability configuration to use. Required
     * when `observabilityEnabled` is true.
     */
    observabilityConfigurationArn?: string;
}
export interface ServiceProps extends PlatformProps {
    /**
     * Name of the service. Must be 4-40 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces
     * the service.
     */
    serviceName?: string;
    /**
     * Container image source for the service (low-level form). Required
     * unless `main` is given. Code-repository (GitHub) sources are not
     * supported — they require an App Runner Connection whose handshake is
     * completed manually in the console.
     */
    imageRepository?: ServiceImageRepository;
    /**
     * Module entrypoint for an Effect-native service (typically
     * `import.meta.url` from an inline Effect program). Alchemy bundles the
     * program, builds a container image, pushes it to a managed ECR
     * repository, and provisions the instance/access IAM roles — mutually
     * exclusive with a caller-supplied `imageRepository`.
     */
    main?: string;
    /**
     * Named export to load from `main`.
     * @default "default"
     */
    handler?: string;
    /**
     * HTTP port the Effect-native program listens on (App Runner injects it
     * as `PORT`). Only used with `main`; the low-level form configures
     * `imageRepository.port` instead.
     * @default 3000
     */
    port?: number;
    /**
     * Additional environment variables for the Effect-native container.
     * Non-string values are JSON-encoded.
     */
    env?: Record<string, any>;
    /**
     * Bundler configuration for the Effect-native entrypoint. Unused
     * code is tree-shaken. `effect`, alchemy, and `@distilled.cloud` are
     * marked pure so unused parts prune more aggressively. List extra
     * packages with `pure.packages`, or disable with `pure: false`.
     */
    build?: Bundle.BundleConfig;
    /**
     * Docker image build for the Effect-native form: optional full
     * `dockerfile`. When omitted, Alchemy generates a Dockerfile for the
     * bundled `index.mjs`.
     */
    docker?: {
        /**
         * Base image when Alchemy generates the Dockerfile.
         * @default public.ecr.aws/docker/library/bun:1
         */
        base?: string;
        /** Full Dockerfile content (replaces generated Dockerfile). */
        dockerfile?: string;
    };
    /**
     * Whether App Runner automatically deploys new image versions pushed to
     * the (private ECR only) repository.
     * @default false
     */
    autoDeploymentsEnabled?: boolean;
    /**
     * IAM role App Runner assumes to pull from private ECR (must trust
     * `build.apprunner.amazonaws.com`). Required for
     * `imageRepositoryType: "ECR"`, forbidden for `ECR_PUBLIC`. For the
     * Effect-native form (`main`), Alchemy provisions and manages this role
     * automatically.
     */
    accessRoleArn?: string;
    /**
     * CPU, memory, and instance role for the running service.
     */
    instanceConfiguration?: ServiceInstanceConfiguration;
    /**
     * Health check configuration.
     */
    healthCheckConfiguration?: ServiceHealthCheckConfiguration;
    /**
     * Inbound/outbound network configuration.
     */
    networkConfiguration?: ServiceNetworkConfiguration;
    /**
     * ARN of an App Runner auto scaling configuration. Defaults to the
     * account's default configuration.
     */
    autoScalingConfigurationArn?: string;
    /**
     * Observability (X-Ray tracing) configuration, referencing an
     * `AppRunner.ObservabilityConfiguration`.
     */
    observabilityConfiguration?: ServiceObservabilityProps;
    /**
     * Customer-managed KMS key ARN for encrypting stored copies of the
     * image and configuration. Changing the key replaces the service.
     * @default AWS-owned key
     */
    kmsKeyArn?: string;
    /**
     * Keep the CloudWatch log groups App Runner auto-creates for the service
     * (`/aws/apprunner/{serviceName}/{serviceId}/application` and
     * `.../service`) when the service is deleted.
     *
     * By default they are deleted along with the service — App Runner itself
     * leaves them behind, so every deploy+destroy cycle would otherwise
     * strand a pair. Set this when the logs must outlive the service (an
     * incident post-mortem, a compliance retention window). The kept groups
     * are inert: their names embed the service id, so no future service ever
     * writes to them, and nothing but a manual delete (or
     * `alchemy unsafe nuke`) removes them.
     *
     * @default false
     */
    retainLogGroups?: boolean;
    /**
     * User-defined tags for the service.
     */
    tags?: Record<string, string>;
}
export interface Service extends Resource<"AWS.AppRunner.Service", ServiceProps, {
    /**
     * Name of the App Runner service.
     */
    serviceName: string;
    /**
     * ARN of the service.
     */
    serviceArn: string;
    /**
     * ID of the service.
     */
    serviceId: string;
    /**
     * Default HTTPS endpoint of the service (`xxxx.awsapprunner.com`).
     */
    serviceUrl: string | undefined;
    /**
     * Current status of the service (e.g. `RUNNING`, `OPERATION_IN_PROGRESS`).
     */
    status: string;
    /**
     * The full URI of the container image the service runs (Effect-native
     * form only).
     */
    imageUri: string | undefined;
    /**
     * The name of the managed ECR repository holding the built image
     * (Effect-native form only).
     */
    repositoryName: string | undefined;
    /**
     * The URI of the managed ECR repository (Effect-native form only).
     */
    repositoryUri: string | undefined;
    /**
     * The ARN of the managed instance role (Effect-native form only).
     */
    instanceRoleArn: string | undefined;
    /**
     * The name of the managed instance role (Effect-native form only).
     */
    instanceRoleName: string | undefined;
    /**
     * The ARN of the managed ECR access role (Effect-native form only).
     */
    accessRoleArn: string | undefined;
    /**
     * The name of the managed ECR access role (Effect-native form only).
     */
    accessRoleName: string | undefined;
    /**
     * The content hash of the bundled application code (Effect-native
     * form only).
     */
    codeHash: string | undefined;
}, {
    /** Environment variables injected into the service's containers. */
    env?: Record<string, any>;
    /** IAM policy statements attached to the managed instance role. */
    policyStatements?: PolicyStatement[];
}, Providers> {
}
export type ServiceServices = Credentials | Region | ServerHost | AWSEnvironment;
export type ServiceShape = Main<ServiceServices>;
export interface ServiceRuntimeContext extends HostRuntimeContext {
    readonly Type: "AWS.AppRunner.Service";
}
/**
 * An AWS App Runner service — the zero-infrastructure way to run a
 * container behind an HTTPS endpoint: App Runner provisions,
 * load-balances, scales, and patches the fleet for you. Service creation
 * and deletion are asynchronous and take several minutes; the provider
 * waits (bounded) for operations to settle.
 *
 * `Service` is a Platform: alongside the low-level container-image form
 * (`imageRepository`), it supports Effect-native implementations — an
 * inline Effect HTTP program that Alchemy bundles, containerizes, pushes
 * to a managed ECR repository, and deploys, provisioning the instance and
 * ECR access roles automatically. Capability bindings (e.g. DynamoDB
 * `GetItem`) attach IAM policy statements to the managed instance role.
 * ### Creating a Service
 * **Example:** Public ECR Image
 * ```typescript
 * const service = yield* AppRunner.Service("Hello", {
 *   imageRepository: {
 *     imageIdentifier: "public.ecr.aws/aws-containers/hello-app-runner:latest",
 *     imageRepositoryType: "ECR_PUBLIC",
 *     port: "8000",
 *   },
 *   instanceConfiguration: { cpu: "256", memory: "512" },
 * });
 * // service.serviceUrl -> "xxxxxxxx.us-west-2.awsapprunner.com"
 * ```
 *
 * **Example:** Private ECR Image with Access Role
 * ```typescript
 * const service = yield* AppRunner.Service("Api", {
 *   imageRepository: {
 *     imageIdentifier: `${repository.repositoryUri}:latest`,
 *     imageRepositoryType: "ECR",
 *     port: "8080",
 *     runtimeEnvironmentVariables: { NODE_ENV: "production" },
 *   },
 *   accessRoleArn: accessRole.roleArn,
 *   autoDeploymentsEnabled: true,
 * });
 * ```
 *
 * ### Effect-Native Services
 * **Example:** Inline Effect HTTP Program
 * ```typescript
 * export default class Api extends AppRunner.Service<Api>()(
 *   "Api",
 *   {
 *     main: import.meta.url,
 *     port: 3000,
 *     instanceConfiguration: { cpu: "256", memory: "512" },
 *   },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         return HttpServerResponse.text("hello from app runner");
 *       }),
 *     };
 *   }),
 * ) {}
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
 * {
 *   main: import.meta.url,
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * }
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: { pure: false },
 * }
 * ```
 *
 * ### Scaling and Networking
 * **Example:** Custom Auto Scaling and VPC Egress
 * ```typescript
 * const service = yield* AppRunner.Service("Api", {
 *   imageRepository: {
 *     imageIdentifier: "public.ecr.aws/aws-containers/hello-app-runner:latest",
 *     imageRepositoryType: "ECR_PUBLIC",
 *     port: "8000",
 *   },
 *   autoScalingConfigurationArn: scaling.autoScalingConfigurationArn,
 *   networkConfiguration: {
 *     egressType: "VPC",
 *     vpcConnectorArn: connector.vpcConnectorArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Service: Platform<Service, ServiceServices, ServiceShape, ServiceRuntimeContext>;
export declare const ServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<Service>, never, AlchemyContext | Credentials | Docker | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("effect/Path").Path | Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Service.d.ts.map