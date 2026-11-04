import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import { SfnCompileError } from "./Asl/compile.ts";
import type { SfnEffect } from "./Asl/Program.ts";
/**
 * The workflow type. `STANDARD` workflows are durable (up to one year),
 * exactly-once, and support execution history; `EXPRESS` workflows are
 * high-throughput, at-least-once, cheaper, and support synchronous
 * invocation via `StartSyncExecution`.
 */
export type StateMachineType = "STANDARD" | "EXPRESS";
/**
 * Log level for a state machine's CloudWatch Logs configuration.
 */
export type StateMachineLogLevel = "ALL" | "ERROR" | "FATAL" | "OFF";
export interface StateMachineLogging {
    /**
     * Which execution history events are logged.
     */
    level: StateMachineLogLevel;
    /**
     * Whether execution input, data passed between states, and output are
     * included in the log events.
     * @default false
     */
    includeExecutionData?: boolean;
    /**
     * CloudWatch log group ARNs to deliver logs to. The `:*` suffix is
     * appended automatically when missing (the API requires it).
     */
    destinations?: string[];
}
export interface StateMachineProps {
    /**
     * Name of the state machine (1-80 characters; letters, digits, dashes and
     * underscores). If omitted, a deterministic physical name is generated
     * from the app, stage, and logical ID. Changing the name triggers a
     * replacement.
     */
    stateMachineName?: string;
    /**
     * The Amazon States Language (ASL) definition of the workflow. Accepts a
     * plain object (recommended — `Output` values such as function ARNs are
     * resolved before serialization) or a pre-serialized JSON string.
     */
    definition: Record<string, unknown> | string;
    /**
     * Literal substitutions applied to the serialized definition: every
     * occurrence of `${key}` is replaced with the mapped value. Useful when
     * the definition is authored as a static JSON string.
     */
    definitionSubstitutions?: Record<string, string>;
    /**
     * The ARN of an existing IAM role for the state machine to use. When
     * omitted, an execution role is created automatically with
     * `states.amazonaws.com` trust; `lambda:InvokeFunction` is granted for
     * every Lambda function ARN referenced in the definition, and
     * {@link StateMachineProps.policyStatements} are attached as an inline
     * policy.
     */
    roleArn?: string;
    /**
     * Additional IAM policy statements attached to the auto-created
     * execution role (ignored when {@link StateMachineProps.roleArn} is
     * provided). Use this to authorize service integrations such as
     * `sqs:SendMessage` or `dynamodb:PutItem` task states.
     */
    policyStatements?: PolicyStatement[];
    /**
     * The workflow type. Changing the type triggers a replacement.
     * @default "STANDARD"
     */
    type?: StateMachineType;
    /**
     * CloudWatch Logs configuration. Required (with level `ALL`/`ERROR`/
     * `FATAL`) to observe `EXPRESS` workflow executions. The auto-created
     * execution role is granted the CloudWatch Logs delivery permissions
     * automatically.
     */
    logging?: StateMachineLogging;
    /**
     * Whether AWS X-Ray tracing is enabled.
     * @default false
     */
    tracingEnabled?: boolean;
    /**
     * Tags to apply to the state machine. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface StateMachine extends Resource<"AWS.StepFunctions.StateMachine", StateMachineProps, {
    /**
     * Physical name of the state machine.
     */
    stateMachineName: string;
    /**
     * ARN of the state machine — pass it to `StartExecution` or reference it
     * from other workflows.
     */
    stateMachineArn: string;
    /**
     * Workflow type (`STANDARD` or `EXPRESS`).
     */
    type: StateMachineType;
    /**
     * ARN of the IAM execution role the workflow assumes.
     */
    roleArn: string;
    /**
     * Name of the auto-created execution role. `undefined` when an explicit
     * {@link StateMachineProps.roleArn} is used.
     */
    roleName: string | undefined;
}, {
    /**
     * IAM policy statements bindings attach to the auto-created execution
     * role (e.g. service-integration permissions collected by `fromProgram`).
     */
    policyStatements: PolicyStatement[];
}, Providers> {
}
declare const InvalidStateMachineDefinition_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidStateMachineDefinition";
} & Readonly<A>;
/**
 * The definition failed AWS's `validateStateMachineDefinition` pre-flight
 * check (run in reconcile before create/update). Carries the validator's
 * ERROR-severity diagnostics.
 */
export declare class InvalidStateMachineDefinition extends InvalidStateMachineDefinition_base<{
    readonly diagnostics: readonly {
        readonly severity: string;
        readonly code: string;
        readonly message: string;
        readonly location: string | undefined;
    }[];
}> {
}
declare const StateMachineResource: import("../../Resource.ts").ResourceClass<StateMachine>;
/**
 * Props for {@link StateMachine.fromProgram} — everything a raw
 * `StateMachine` accepts except the `definition` (which is compiled from
 * the program). User `policyStatements` are merged with the statements the
 * compiler collects from `Sfn.invoke`/`Sfn.integrate` task states.
 */
export interface FromProgramProps extends Omit<StateMachineProps, "definition" | "definitionSubstitutions"> {
    /** The typed Step Functions program to compile (built with `Sfn.gen`). */
    program: SfnEffect<any, any>;
}
/**
 * Sugar over the raw `StateMachine` resource: compile a typed `Sfn` program
 * to a plain ASL definition object plus collected IAM policy statements,
 * then register the same `StateMachine` resource the raw path uses. Nothing
 * engine-level — the raw `definition` escape hatch stays first-class.
 */
declare const fromProgram: (id: string, props: FromProgramProps) => Effect.Effect<StateMachine, SfnCompileError, Providers>;
/**
 * An AWS Step Functions state machine (workflow).
 *
 * `StateMachine` owns the lifecycle of a `STANDARD` or `EXPRESS` workflow.
 * The Amazon States Language definition may be provided as a plain object —
 * `Output` values (like Lambda function ARNs) inside it are resolved before
 * serialization — and an execution role is created automatically unless an
 * explicit `roleArn` is given. Lambda functions referenced in the definition
 * are granted `lambda:InvokeFunction` on the auto-created role.
 * ### Creating State Machines
 * **Example:** Standard Workflow with a Pass State
 * ```typescript
 * import * as StepFunctions from "alchemy/AWS/StepFunctions";
 *
 * const machine = yield* StepFunctions.StateMachine("OrderWorkflow", {
 *   definition: {
 *     StartAt: "Done",
 *     States: {
 *       Done: { Type: "Pass", End: true },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Express Workflow
 * ```typescript
 * const machine = yield* StepFunctions.StateMachine("FastWorkflow", {
 *   type: "EXPRESS",
 *   definition: {
 *     StartAt: "Echo",
 *     States: {
 *       Echo: { Type: "Pass", End: true },
 *     },
 *   },
 * });
 * ```
 *
 * ### Orchestrating Lambda Functions
 * Reference a function ARN in a Task state — `lambda:InvokeFunction` is
 * granted on the auto-created execution role automatically.
 *
 * **Example:** Invoke a Lambda Function
 * ```typescript
 * const machine = yield* StepFunctions.StateMachine("Pipeline", {
 *   definition: {
 *     StartAt: "Process",
 *     States: {
 *       Process: {
 *         Type: "Task",
 *         Resource: fn.functionArn,
 *         End: true,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Service Integrations
 * **Example:** Send a Task Token to SQS (callback pattern)
 * ```typescript
 * const machine = yield* StepFunctions.StateMachine("Callback", {
 *   definition: {
 *     StartAt: "WaitForApproval",
 *     States: {
 *       WaitForApproval: {
 *         Type: "Task",
 *         Resource: "arn:aws:states:::sqs:sendMessage.waitForTaskToken",
 *         Parameters: {
 *           QueueUrl: queue.queueUrl,
 *           MessageBody: { "token.$": "$$.Task.Token" },
 *         },
 *         End: true,
 *       },
 *     },
 *   },
 *   policyStatements: [
 *     {
 *       Effect: "Allow",
 *       Action: ["sqs:SendMessage"],
 *       Resource: [queue.queueArn],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Starting Executions at Runtime
 * Bind execution operations in the init phase and use them in runtime
 * handlers.
 *
 * **Example:** Start a workflow from a handler
 * ```typescript
 * // init
 * const startExecution = yield* StepFunctions.StartExecution(machine);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime
 *     const execution = yield* startExecution({
 *       input: JSON.stringify({ orderId: "123" }),
 *     });
 *     return HttpServerResponse.json({ executionArn: execution.executionArn });
 *   }),
 * };
 * ```
 *
 * **Example:** Run an EXPRESS workflow synchronously
 * ```typescript
 * // init
 * const startSyncExecution = yield* StepFunctions.StartSyncExecution(machine);
 *
 * // runtime
 * const result = yield* startSyncExecution({
 *   input: JSON.stringify({ value: 21 }),
 * });
 * // result.status === "SUCCEEDED", result.output is the workflow output
 * ```
 *
 * ### Typed Programs
 * Author the workflow as a typed `Sfn` program (mirroring Effect's names —
 * `Sfn.gen`, `Sfn.invoke`, `Sfn.when`, `Sfn.forEach`, `Sfn.catchTag`, ...)
 * and compile it with `StateMachine.fromProgram`. The compiler emits a plain
 * ASL definition plus the IAM policy statements its task states need; the
 * raw `definition` path above stays fully usable underneath.
 *
 * **Example:** Compile a typed program
 * ```typescript
 * import { Sfn, StateMachine } from "alchemy/AWS/StepFunctions";
 *
 * const machine = yield* StateMachine.fromProgram("OrderWorkflow", {
 *   type: "EXPRESS",
 *   program: Sfn.gen(function* (input: Sfn.Expr<{ value: number }>) {
 *     const result = yield* Sfn.invoke<{ doubled: number }>(doubler, {
 *       value: input.value,
 *     });
 *     const size = yield* Sfn.when(
 *       Sfn.gt(result.doubled, 10),
 *       Sfn.succeed("big"),
 *       Sfn.succeed("small"),
 *     );
 *     return { doubled: result.doubled, size };
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const StateMachine: typeof StateMachineResource & {
    fromProgram: typeof fromProgram;
};
export declare const StateMachineProvider: () => import("effect/Layer").Layer<Provider.Provider<StateMachine>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=StateMachine.d.ts.map