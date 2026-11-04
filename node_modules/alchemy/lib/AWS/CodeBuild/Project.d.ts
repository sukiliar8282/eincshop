import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { type PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
/**
 * Where CodeBuild fetches the source to build.
 */
export interface ProjectSourceConfig {
    /**
     * Source provider type. `NO_SOURCE` builds run only the inline `buildspec`
     * (nothing is fetched); `S3` pulls an object; the git types
     * (`CODECOMMIT`/`GITHUB`/`GITLAB`/`BITBUCKET`/…) require a matching
     * source credential or connection.
     */
    type: "NO_SOURCE" | "S3" | "CODECOMMIT" | "CODEPIPELINE" | "GITHUB" | "GITHUB_ENTERPRISE" | "GITLAB" | "GITLAB_SELF_MANAGED" | "BITBUCKET";
    /**
     * Source location. Required for every type except `NO_SOURCE` and
     * `CODEPIPELINE`. For `S3` this is `bucket/path/to/object.zip`; for git
     * types it is the clone URL.
     */
    location?: string;
    /**
     * Inline build spec (YAML/JSON). Required when `type` is `NO_SOURCE`;
     * otherwise overrides the `buildspec.yml` in the source root. May also be
     * an `arn:aws:s3:::` path to a build spec object.
     */
    buildspec?: string;
    /**
     * Depth of history to fetch for git sources. `0` fetches full history.
     */
    gitCloneDepth?: number;
    /**
     * Report the build's start and completion status back to the source
     * provider (git sources only).
     */
    reportBuildStatus?: boolean;
    /**
     * Ignore TLS errors when connecting to the source (git sources only).
     */
    insecureSsl?: boolean;
}
/**
 * Where CodeBuild writes build output artifacts.
 */
export interface ProjectArtifactsConfig {
    /**
     * Artifact destination. `NO_ARTIFACTS` discards output; `S3` uploads to a
     * bucket; `CODEPIPELINE` hands artifacts back to a pipeline stage.
     * @default "NO_ARTIFACTS"
     */
    type: "NO_ARTIFACTS" | "S3" | "CODEPIPELINE";
    /**
     * Output bucket name (for `type: "S3"`).
     */
    location?: string;
    /**
     * Path inside the bucket to write to.
     */
    path?: string;
    /**
     * Whether to prefix the artifact path with the build ID.
     * @default "NONE"
     */
    namespaceType?: "NONE" | "BUILD_ID";
    /**
     * Name of the artifact object/folder.
     */
    name?: string;
    /**
     * Whether the artifact is zipped.
     * @default "NONE"
     */
    packaging?: "NONE" | "ZIP";
    /**
     * Use the artifact `name` verbatim instead of appending it to the path.
     */
    overrideArtifactName?: boolean;
    /**
     * Disable default artifact encryption.
     */
    encryptionDisabled?: boolean;
}
/**
 * An environment variable exposed to the build container.
 */
export interface ProjectEnvironmentVariable {
    /** Variable name. */
    name: string;
    /**
     * Variable value. For `PLAINTEXT` this is the literal value; for
     * `PARAMETER_STORE`/`SECRETS_MANAGER` it is the parameter name / secret
     * ARN to resolve at build time.
     */
    value: string;
    /**
     * How to interpret `value`.
     * @default "PLAINTEXT"
     */
    type?: "PLAINTEXT" | "PARAMETER_STORE" | "SECRETS_MANAGER";
}
/**
 * The build container: image, compute size, and runtime settings.
 */
export interface ProjectEnvironmentConfig {
    /**
     * Container environment type.
     * @default "LINUX_CONTAINER"
     */
    type?: "LINUX_CONTAINER" | "LINUX_GPU_CONTAINER" | "ARM_CONTAINER" | "WINDOWS_SERVER_2019_CONTAINER" | "WINDOWS_SERVER_2022_CONTAINER" | "LINUX_LAMBDA_CONTAINER" | "ARM_LAMBDA_CONTAINER" | "MAC_ARM";
    /**
     * Docker image to run the build in, e.g.
     * `aws/codebuild/amazonlinux2-x86_64-standard:5.0`.
     */
    image: string;
    /**
     * Compute size for the build fleet.
     * @default "BUILD_GENERAL1_SMALL"
     */
    computeType?: "BUILD_GENERAL1_SMALL" | "BUILD_GENERAL1_MEDIUM" | "BUILD_GENERAL1_LARGE" | "BUILD_GENERAL1_XLARGE" | "BUILD_GENERAL1_2XLARGE" | "BUILD_LAMBDA_1GB" | "BUILD_LAMBDA_2GB" | "BUILD_LAMBDA_4GB" | "BUILD_LAMBDA_8GB" | "BUILD_LAMBDA_10GB";
    /**
     * Environment variables available to every build.
     */
    environmentVariables?: ProjectEnvironmentVariable[];
    /**
     * Run the build container in privileged mode (required to build Docker
     * images inside the build).
     * @default false
     */
    privilegedMode?: boolean;
    /**
     * ARN of an S3 object holding a PEM-encoded certificate to install.
     */
    certificate?: string;
    /**
     * Credentials used to pull the build image.
     * @default "CODEBUILD"
     */
    imagePullCredentialsType?: "CODEBUILD" | "SERVICE_ROLE";
}
/** Build log destinations for a CodeBuild project. */
export interface ProjectLogsConfig {
    /** CloudWatch Logs delivery configuration. */
    cloudWatchLogs?: {
        /** Whether CloudWatch Logs delivery is enabled. */
        status: "ENABLED" | "DISABLED";
        /** Optional CloudWatch log group name. */
        groupName?: string;
        /** Optional CloudWatch log stream name. */
        streamName?: string;
    };
    /** S3 log delivery configuration. */
    s3Logs?: {
        /** Whether S3 log delivery is enabled. */
        status: "ENABLED" | "DISABLED";
        /** S3 bucket and prefix for build logs. */
        location?: string;
        /** Disable default encryption for S3 build logs. */
        encryptionDisabled?: boolean;
        /** Access granted to the destination bucket owner. */
        bucketOwnerAccess?: "NONE" | "READ_ONLY" | "FULL";
    };
}
export interface ProjectProps {
    /**
     * Name of the build project (2-255 chars). If omitted a deterministic
     * physical name is generated. Changing the name replaces the project.
     */
    projectName?: string;
    /**
     * Description of the project.
     */
    description?: string;
    /**
     * Source configuration.
     */
    source: ProjectSourceConfig;
    /**
     * Artifact configuration.
     * @default { type: "NO_ARTIFACTS" }
     */
    artifacts?: ProjectArtifactsConfig;
    /**
     * Build container configuration.
     */
    environment: ProjectEnvironmentConfig;
    /**
     * ARN of the IAM role CodeBuild assumes to run builds. Must trust
     * `codebuild.amazonaws.com`.
     */
    serviceRole: string;
    /**
     * How long a build may run before CodeBuild stops it, e.g. `"1 hour"`
     * (5 minutes to 36 hours). Rounded to whole minutes on the wire.
     * @default 60 minutes
     */
    timeout?: Duration.Input;
    /**
     * How long a build may sit queued before it is failed, e.g.
     * `"30 minutes"` (5 minutes to 8 hours). Rounded to whole minutes on
     * the wire.
     */
    queuedTimeout?: Duration.Input;
    /**
     * Maximum number of builds allowed to run concurrently for this project.
     */
    concurrentBuildLimit?: number;
    /**
     * KMS key ARN/alias used to encrypt build output. Defaults to the
     * account's default S3 CMK.
     */
    encryptionKey?: string;
    /**
     * Enable a publicly visible build badge.
     * @default false
     */
    badgeEnabled?: boolean;
    /**
     * Build log destinations. Set both destinations to `DISABLED` for builds
     * that do not need persisted logs.
     */
    logsConfig?: ProjectLogsConfig;
    /**
     * Resource policy attached to the project — shares the project with other
     * AWS accounts by granting them read actions such as
     * `codebuild:BatchGetProjects`. Accepts a typed {@link PolicyDocument} or a
     * raw JSON string (escape hatch / adoption of an existing policy). Omit to
     * remove any existing policy.
     */
    resourcePolicy?: PolicyDocument | string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Project extends Resource<"AWS.CodeBuild.Project", ProjectProps, {
    /** Physical name of the build project. */
    projectName: string;
    /** ARN of the build project. */
    projectArn: string;
}, never, Providers> {
}
/**
 * An AWS CodeBuild build project — a reusable definition of how to run a
 * build: the source, the build container, the compute size, the IAM role,
 * and where artifacts land.
 *
 * The project is a definition only; creating it is instant and free.
 * Running a build (`StartBuild`) provisions compute and is billed per
 * build-minute.
 * ### Creating a Project
 * **Example:** NO_SOURCE Project with an Inline Buildspec
 * ```typescript
 * const project = yield* CodeBuild.Project("Hello", {
 *   serviceRole: role.roleArn,
 *   source: {
 *     type: "NO_SOURCE",
 *     buildspec: [
 *       "version: 0.2",
 *       "phases:",
 *       "  build:",
 *       "    commands:",
 *       "      - echo Hello from CodeBuild",
 *     ].join("\n"),
 *   },
 *   environment: {
 *     image: "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
 *     computeType: "BUILD_GENERAL1_SMALL",
 *   },
 * });
 * ```
 *
 * **Example:** S3-Source Project with S3 Artifacts
 * ```typescript
 * const project = yield* CodeBuild.Project("Packager", {
 *   serviceRole: role.roleArn,
 *   source: { type: "S3", location: `${bucket.bucketName}/source.zip` },
 *   artifacts: { type: "S3", location: bucket.bucketName, name: "out.zip", packaging: "ZIP" },
 *   environment: {
 *     image: "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
 *     environmentVariables: [{ name: "STAGE", value: "prod" }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Project: import("../../Resource.ts").ResourceClass<Project>;
export declare const ProjectProvider: () => import("effect/Layer").Layer<Provider.Provider<Project>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Project.d.ts.map