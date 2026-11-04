import type { Credentials } from "../Credentials.ts";
import type { Region } from "@distilled.cloud/aws/Region";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { Scope } from "effect/Scope";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Bundle from "../../Bundle/Bundle.ts";
import { Docker } from "../../Docker/Docker.ts";
import { Platform, type PlatformProps, type PlatformServices } from "../../Platform.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { type HostRuntimeContext, type ServerHost } from "../../Server/Process.ts";
import { Stack } from "../../Stack.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type JobDefinitionName = string;
/** Revision-qualified job definition ARN (`.../job-definition/{name}:{revision}`). */
export type JobDefinitionArn = `arn:aws:batch:${RegionID}:${AccountID}:job-definition/${JobDefinitionName}:${number}`;
declare const JobDefinitionConfigError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "JobDefinitionConfigError";
} & Readonly<A>;
/**
 * Raised when the props don't select exactly one of the two forms: the
 * low-level container form (`image` + `executionRoleArn`) or the
 * Effect-native form (`main`).
 */
export declare class JobDefinitionConfigError extends JobDefinitionConfigError_base<{
    readonly message: string;
}> {
}
export interface JobDefinitionProps extends PlatformProps {
    /**
     * Name (family) of the job definition. If omitted, a unique name is
     * generated. Content changes register a new revision under the same name.
     */
    jobDefinitionName?: string;
    /**
     * Container image the job runs (low-level form, e.g.
     * `public.ecr.aws/docker/library/busybox:latest`). Mutually exclusive
     * with `main`.
     */
    image?: string;
    /**
     * Module entrypoint for an Effect-native run-to-completion job (typically
     * `import.meta.url` from an inline Effect program). Alchemy bundles the
     * program, builds a container image, pushes it to a managed ECR
     * repository, and provisions the job/execution IAM roles — mutually
     * exclusive with a caller-supplied `image`.
     */
    main?: string;
    /**
     * Named export to load from `main`.
     * @default "default"
     */
    handler?: string;
    /**
     * Command to run in the container (low-level form). Overridable
     * per-submission via `containerOverrides.command`. The Effect-native form
     * bakes its entrypoint into the image instead.
     */
    command?: string[];
    /**
     * Fargate vCPUs for the job. Must be a valid Fargate size (0.25, 0.5, 1,
     * 2, 4, 8, 16) compatible with `memory`.
     * @default 0.25
     */
    vcpus?: number;
    /**
     * Memory (MiB) for the job. Must be compatible with `vcpus` per the
     * Fargate size matrix.
     * @default 512
     */
    memory?: number;
    /**
     * Environment variables set in the job container.
     */
    environment?: Record<string, string>;
    /**
     * Additional environment variables for the Effect-native container.
     * Non-string values are JSON-encoded. (Capability bindings also inject
     * their variables here automatically.)
     */
    env?: Record<string, any>;
    /**
     * IAM role assumed by the job's application code. For the Effect-native
     * form (`main`), Alchemy provisions and manages this role automatically
     * (binding policy statements attach to it).
     */
    jobRoleArn?: string;
    /**
     * Execution role used by ECS/Fargate to pull the image and write logs.
     * Required for the low-level form; provisioned automatically for the
     * Effect-native form.
     */
    executionRoleArn?: string;
    /**
     * Compute platforms that can run this definition. Use `EC2` for unmanaged
     * ECS compute environments.
     * @default ["FARGATE"]
     */
    platformCapabilities?: ("EC2" | "FARGATE")[];
    /**
     * Whether the Fargate task ENI gets a public IP. Required for image pulls
     * from public registries when running in public subnets.
     * @default "ENABLED"
     */
    assignPublicIp?: "ENABLED" | "DISABLED";
    /**
     * Default parameter substitutions for `Ref::` placeholders in `command`.
     */
    parameters?: Record<string, string>;
    /**
     * Number of times a failed job is retried (1-10).
     * @default 1
     */
    retryAttempts?: number;
    /**
     * Job execution timeout (minimum 60 seconds), e.g. `"15 minutes"` or
     * `Duration.minutes(15)`.
     */
    timeout?: Duration.Input;
    /**
     * Propagate job definition tags to the ECS task.
     * @default false
     */
    propagateTags?: boolean;
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
     * Additional managed policy ARNs for the managed job role
     * (Effect-native form only).
     */
    jobRoleManagedPolicyArns?: string[];
    /**
     * User-defined tags to apply to the job definition.
     */
    tags?: Record<string, string>;
}
export interface JobDefinition extends Resource<"AWS.Batch.JobDefinition", JobDefinitionProps, {
    jobDefinitionName: JobDefinitionName;
    jobDefinitionArn: JobDefinitionArn;
    revision: number;
    status: string;
    tags: Record<string, string>;
    /** The full URI of the built container image (Effect-native form only). */
    imageUri: string | undefined;
    /** The managed ECR repository name (Effect-native form only). */
    repositoryName: string | undefined;
    /** The managed ECR repository URI (Effect-native form only). */
    repositoryUri: string | undefined;
    /** The ARN of the managed job role (Effect-native form only). */
    jobRoleArn: string | undefined;
    /** The name of the managed job role (Effect-native form only). */
    jobRoleName: string | undefined;
    /** The ARN of the execution role the job definition uses. */
    executionRoleArn: string | undefined;
    /** The name of the managed execution role (Effect-native form only). */
    executionRoleName: string | undefined;
    /** Content hash of the bundled program (Effect-native form only). */
    codeHash: string | undefined;
}, {
    /** Environment variables injected into the job container. */
    env?: Record<string, any>;
    /** IAM policy statements attached to the managed job role. */
    policyStatements?: PolicyStatement[];
}, Providers> {
}
export type JobDefinitionServices = Credentials | Region | ServerHost | AWSEnvironment;
/**
 * The shape an Effect-native job implementation returns: a single `run`
 * Effect that is the run-to-completion body of the job. The container exits
 * 0 when it succeeds (job `SUCCEEDED`) and 1 when it fails (job `FAILED`,
 * subject to the definition's `retryAttempts`).
 */
export type JobDefinitionShape = void | {
    run: Effect.Effect<void, unknown, JobDefinitionServices | PlatformServices | RuntimeContext | Scope>;
};
export interface JobDefinitionRuntimeContext extends HostRuntimeContext {
    readonly Type: "AWS.Batch.JobDefinition";
}
/**
 * An AWS Batch job definition for Fargate container jobs. Job definitions are
 * immutable revisions — changing the container configuration registers a new
 * revision under the same name (like ECS task definitions); destroying the
 * resource deregisters every active revision.
 *
 * `JobDefinition` is a Platform: alongside the low-level container form
 * (`image` + `executionRoleArn`), it supports Effect-native run-to-completion
 * implementations — an inline Effect program that Alchemy bundles,
 * containerizes as the job container's command, pushes to a managed ECR
 * repository, and registers, provisioning the job and execution roles
 * automatically. Capability bindings (e.g. S3 `GetObject`) attach IAM policy
 * statements to the managed job role and inject their environment variables
 * into the container.
 *
 * ### Creating Job Definitions
 * **Example:** Busybox echo job (low-level container form)
 * ```typescript
 * const jobDef = yield* Batch.JobDefinition("EchoJob", {
 *   image: "public.ecr.aws/docker/library/busybox:latest",
 *   command: ["echo", "hello from batch"],
 *   executionRoleArn: executionRole.roleArn,
 * });
 * ```
 *
 * **Example:** Sized job with environment
 * ```typescript
 * const jobDef = yield* Batch.JobDefinition("EtlJob", {
 *   image: image.imageUri,
 *   vcpus: 1,
 *   memory: 2048,
 *   environment: { STAGE: "prod" },
 *   jobRoleArn: jobRole.roleArn,
 *   executionRoleArn: executionRole.roleArn,
 *   retryAttempts: 3,
 *   timeout: "15 minutes",
 * });
 * ```
 *
 * ### Effect-Native Jobs
 * **Example:** Tagged class with an inline run-to-completion Effect
 * ```typescript
 * export default class Nightly extends Batch.JobDefinition<Nightly>()(
 *   "Nightly",
 *   { main: import.meta.url, vcpus: 1, memory: 2048 },
 *   Effect.gen(function* () {
 *     const getObject = yield* AWS.S3.GetObject(bucket);
 *     return {
 *       run: Effect.gen(function* () {
 *         const data = yield* getObject({ key: "input.csv" });
 *         yield* Effect.log("processed nightly batch");
 *       }),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * **Example:** Eager inline job
 * ```typescript
 * export default Batch.JobDefinition(
 *   "Reindex",
 *   { main: import.meta.url },
 *   Effect.succeed({
 *     run: Effect.log("reindex complete"),
 *   }),
 * );
 * ```
 *
 * **Example:** Plain external script (bundled as-is)
 * ```typescript
 * // ./job.ts runs top-level and exits; Alchemy bundles + containerizes it.
 * const jobDef = yield* Batch.JobDefinition("Script", {
 *   main: path.join(import.meta.dirname, "job.ts"),
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
 * @resource
 */
export declare const JobDefinition: Platform<JobDefinition, JobDefinitionServices, JobDefinitionShape, JobDefinitionRuntimeContext>;
export declare const JobDefinitionProvider: () => import("effect/Layer").Layer<Provider.Provider<JobDefinition>, never, AWSEnvironment | AlchemyContext | Credentials | Docker | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("effect/Path").Path | Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=JobDefinition.d.ts.map