import * as pipes from "@distilled.cloud/aws/pipes";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The state you want the pipe to be in after reconciliation.
 *
 * - `RUNNING` — the pipe polls the source and delivers to the target.
 * - `STOPPED` — the pipe exists but does not poll the source.
 */
export type PipeDesiredState = "RUNNING" | "STOPPED";
export interface PipeProps {
    /**
     * Name of the pipe (1-64 characters). If omitted, a deterministic
     * physical name is generated from the app, stage, and logical ID.
     */
    pipeName?: string;
    /**
     * A description of the pipe.
     */
    description?: string;
    /**
     * The state the pipe should be in.
     * @default "RUNNING"
     */
    desiredState?: PipeDesiredState;
    /**
     * The ARN of the source resource (SQS queue, Kinesis stream, DynamoDB
     * stream, etc.). Changing the source triggers a **replacement** — the
     * EventBridge Pipes API does not allow updating a pipe's source.
     */
    source: string;
    /**
     * Source-specific parameters (batching, starting position, filter
     * criteria). `FilterCriteria` holds EventBridge event-pattern strings
     * that select which source events reach the enrichment/target.
     * Changing a stream source's `StartingPosition` triggers a replacement.
     */
    sourceParameters?: pipes.PipeSourceParameters;
    /**
     * The ARN of the enrichment resource (Lambda function, Step Functions
     * state machine, or API destination) invoked between source and target.
     */
    enrichment?: string;
    /**
     * Parameters for the enrichment step (input template, HTTP parameters).
     */
    enrichmentParameters?: pipes.PipeEnrichmentParameters;
    /**
     * The ARN of the target resource (Lambda function, SQS queue, Kinesis
     * stream, EventBridge bus, CloudWatch Logs group, ECS task, etc.).
     */
    target: string;
    /**
     * Target-specific invocation parameters (input template, invocation
     * type, partition key, message group, etc.).
     */
    targetParameters?: pipes.PipeTargetParameters;
    /**
     * The ARN of the IAM role that EventBridge Pipes assumes to read from
     * the source and deliver to the target (and invoke the enrichment).
     * Must trust the `pipes.amazonaws.com` service principal. Use
     * `Pipes.from(source).toLambda(fn)` to have the role synthesized
     * automatically.
     */
    roleArn: string;
    /**
     * Pipe execution log configuration (CloudWatch Logs, Firehose, or S3).
     */
    logConfiguration?: pipes.PipeLogConfigurationParameters;
    /**
     * The identifier of the KMS customer managed key used to encrypt pipe
     * data at rest.
     */
    kmsKeyIdentifier?: string;
    /**
     * Tags to apply to the pipe. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Pipe extends Resource<"AWS.Pipes.Pipe", PipeProps, {
    /**
     * Name of the pipe.
     */
    pipeName: string;
    /**
     * ARN of the pipe.
     */
    pipeArn: string;
    /**
     * Observed state of the pipe (e.g. `RUNNING`, `STOPPED`).
     */
    currentState: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon EventBridge Pipe — point-to-point source→(filter)→(enrich)→target
 * plumbing between AWS services without glue code.
 *
 * `Pipe` owns the lifecycle of an EventBridge Pipe. Reconcile waits (bounded)
 * for the pipe to leave its `CREATING`/`UPDATING` transitional states, and a
 * pipe that lands in a `*_FAILED` state surfaces as a typed {@link PipeFailed}
 * error rather than hanging. Prefer the {@link from} builder for the common
 * pairs — it synthesizes the `pipes.amazonaws.com` execution role with
 * source-read and target-invoke policies for you.
 * ### Creating Pipes
 * **Example:** SQS to Lambda (builder — role synthesized automatically)
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const queue = yield* AWS.SQS.Queue("OrdersQueue");
 * const pipe = yield* AWS.Pipes.from(queue, { batchSize: 1 }).toLambda(fn);
 * ```
 *
 * **Example:** SQS to SQS (canonical resource with an explicit role)
 * ```typescript
 * const pipe = yield* AWS.Pipes.Pipe("OrdersPipe", {
 *   source: source.queueArn,
 *   target: target.queueArn,
 *   roleArn: role.roleArn,
 *   sourceParameters: {
 *     SqsQueueParameters: { BatchSize: 1 },
 *   },
 * });
 * ```
 *
 * ### Filtering
 * **Example:** Only deliver matching events
 * ```typescript
 * const pipe = yield* AWS.Pipes.from(queue)
 *   .filter(JSON.stringify({ body: { type: ["order.created"] } }))
 *   .toLambda(fn);
 * ```
 *
 * ### Enrichment
 * **Example:** Enrich events with a Lambda function before delivery
 * ```typescript
 * const pipe = yield* AWS.Pipes.from(queue)
 *   .enrich(enricherFn)
 *   .toQueue(target);
 * ```
 *
 * ### Stream Sources
 * **Example:** Kinesis stream source
 * ```typescript
 * const pipe = yield* AWS.Pipes.from(stream, {
 *   startingPosition: "TRIM_HORIZON",
 *   batchSize: 10,
 * }).toLambda(fn);
 * ```
 *
 * **Example:** Stop a pipe without deleting it
 * ```typescript
 * const pipe = yield* AWS.Pipes.Pipe("OrdersPipe", {
 *   source: source.queueArn,
 *   target: target.queueArn,
 *   roleArn: role.roleArn,
 *   desiredState: "STOPPED",
 * });
 * ```
 *
 * @resource
 */
export declare const Pipe: import("../../Resource.ts").ResourceClass<Pipe>;
declare const PipeFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "PipeFailed";
} & Readonly<A>;
/**
 * Raised when a pipe lands in a terminal failed state
 * (`CREATE_FAILED`, `UPDATE_FAILED`, `START_FAILED`, `STOP_FAILED`,
 * `DELETE_FAILED`, ...). Carries the pipe's `StateReason` so the
 * misconfiguration (usually IAM) is visible in the failure.
 */
export declare class PipeFailed extends PipeFailed_base<{
    pipeName: string;
    state: string;
    stateReason: string | undefined;
}> {
}
declare const PipeStateTimeout_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "PipeStateTimeout";
} & Readonly<A>;
/**
 * Raised when a pipe does not settle out of a transitional state
 * (`CREATING`, `UPDATING`, `STARTING`, `STOPPING`, `DELETING`) within the
 * bounded wait (~60s). Surfaces the
 * last observed state instead of hanging the deploy.
 */
export declare class PipeStateTimeout extends PipeStateTimeout_base<{
    pipeName: string;
    state: string | undefined;
    message: string;
}> {
}
export declare const PipeProvider: () => import("effect/Layer").Layer<Provider.Provider<Pipe>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Pipe.d.ts.map