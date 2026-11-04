import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Where a pipeline stores the artifacts it passes between stages.
 */
export interface PipelineArtifactStore {
    /**
     * Store type. Only `S3` is supported by CodePipeline.
     * @default "S3"
     */
    type?: "S3";
    /**
     * Name of the S3 bucket that holds pipeline artifacts.
     */
    location: string;
    /**
     * Optional customer-managed KMS key for artifact encryption.
     */
    encryptionKey?: {
        /** Key id or ARN. */
        id: string;
        /** Key type. */
        type: "KMS";
    };
}
/**
 * A single action within a stage — a source pull, a build, a deploy, etc.
 */
export interface PipelineActionConfig {
    /** Unique name of the action within its stage. */
    name: string;
    /** Action category. */
    category: "Source" | "Build" | "Deploy" | "Test" | "Invoke" | "Approval" | "Compute";
    /** Who owns the action provider. */
    owner: "AWS" | "ThirdParty" | "Custom";
    /**
     * Action provider, e.g. `S3`, `CodeBuild`, `CodeDeploy`,
     * `CodeStarSourceConnection`.
     */
    provider: string;
    /**
     * Provider version.
     * @default "1"
     */
    version?: string;
    /**
     * Provider-specific configuration key/value map (e.g. `{ ProjectName }`
     * for CodeBuild, `{ S3Bucket, S3ObjectKey }` for an S3 source).
     */
    configuration?: Record<string, string>;
    /** Names of artifacts this action consumes. */
    inputArtifacts?: string[];
    /** Names of artifacts this action produces. */
    outputArtifacts?: string[];
    /** Order of execution within the stage (actions with the same order run in parallel). */
    runOrder?: number;
    /** Region the action runs in (for cross-region actions). */
    region?: string;
    /** IAM role the action assumes. */
    roleArn?: string;
    /** Variable namespace for referencing this action's output variables. */
    namespace?: string;
}
/**
 * A pipeline stage: a named group of actions.
 */
export interface PipelineStageConfig {
    /** Unique name of the stage. */
    name: string;
    /** Actions that make up the stage. */
    actions: PipelineActionConfig[];
}
export interface PipelineProps {
    /**
     * Name of the pipeline. If omitted a deterministic physical name is
     * generated. Changing the name replaces the pipeline.
     */
    pipelineName?: string;
    /**
     * ARN of the IAM role CodePipeline assumes. Must trust
     * `codepipeline.amazonaws.com`.
     */
    roleArn: string;
    /**
     * Artifact store for passing outputs between stages.
     */
    artifactStore: PipelineArtifactStore;
    /**
     * Ordered list of stages. A pipeline needs at least two stages, the first
     * of which contains a single source action.
     */
    stages: PipelineStageConfig[];
    /**
     * Pipeline type.
     * @default "V2"
     */
    pipelineType?: "V1" | "V2";
    /**
     * Execution mode (V2 pipelines).
     * @default "SUPERSEDED"
     */
    executionMode?: "QUEUED" | "SUPERSEDED" | "PARALLEL";
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Pipeline extends Resource<"AWS.CodePipeline.Pipeline", PipelineProps, {
    /** Physical name of the pipeline. */
    pipelineName: string;
    /** ARN of the pipeline. */
    pipelineArn: string;
    /** Version number, incremented by CodePipeline on every structure update. */
    pipelineVersion: number;
}, never, Providers> {
}
/**
 * An AWS CodePipeline continuous-delivery pipeline: an ordered set of
 * stages, each running one or more actions (source → build → deploy), with
 * an S3 artifact store carrying outputs between them.
 *
 * Defining and updating the pipeline is instant. Pipelines that use a git
 * source require a CodeConnections connection whose OAuth handshake is
 * completed manually — use an S3 source to avoid the handshake.
 * ### Creating a Pipeline
 * **Example:** S3-Source → CodeBuild Pipeline
 * ```typescript
 * const pipeline = yield* CodePipeline.Pipeline("Release", {
 *   roleArn: role.roleArn,
 *   artifactStore: { type: "S3", location: artifactBucket.bucketName },
 *   stages: [
 *     {
 *       name: "Source",
 *       actions: [{
 *         name: "S3Source",
 *         category: "Source",
 *         owner: "AWS",
 *         provider: "S3",
 *         outputArtifacts: ["SourceOutput"],
 *         configuration: {
 *           S3Bucket: sourceBucket.bucketName,
 *           S3ObjectKey: "source.zip",
 *           PollForSourceChanges: "false",
 *         },
 *       }],
 *     },
 *     {
 *       name: "Build",
 *       actions: [{
 *         name: "Build",
 *         category: "Build",
 *         owner: "AWS",
 *         provider: "CodeBuild",
 *         inputArtifacts: ["SourceOutput"],
 *         configuration: { ProjectName: project.projectName },
 *       }],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Pipeline: import("../../Resource.ts").ResourceClass<Pipeline>;
export declare const PipelineProvider: () => import("effect/Layer").Layer<Provider.Provider<Pipeline>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Pipeline.d.ts.map