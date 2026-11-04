import * as Effect from "effect/Effect";
import * as Output from "../../Output.ts";
import type { Activity } from "./Activity.ts";
import type { StateMachine } from "./StateMachine.ts";
/**
 * Shared scaffolding for AWS Step Functions HTTP bindings.
 *
 * NOT exported from `index.ts` — every near-identical `{Op}Http.ts` in this
 * service is a thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of
 * the builders below. Everything except the operation, the IAM action list,
 * and the injected/derived identifier is boilerplate. Genuinely-different
 * bindings (none currently — `StartSyncExecution` folds its bespoke
 * `sync-states` endpoint into the `operation` effect it passes) stay
 * bespoke.
 */
/**
 * Execution ARNs replace the `:stateMachine:` segment with `:execution:`
 * and append the execution name — grant on the machine's execution ARN
 * pattern.
 */
export declare const executionArnPattern: (stateMachine: StateMachine) => Output.Output<string, never>;
/**
 * Map Run ARNs replace the `:stateMachine:` segment with `:mapRun:` and
 * append `/{executionName}:{uuid}` — grant on the machine's Map Run ARN
 * pattern.
 */
export declare const mapRunArnPattern: (stateMachine: StateMachine) => Output.Output<string, never>;
/**
 * Build the impl Effect for a state-machine-scoped operation whose request
 * carries the machine identity as `stateMachineArn` (`StartExecution`,
 * `ListExecutions`, …): the runtime callable injects the bound
 * {@link StateMachine}'s ARN and the deploy-time half grants `actions` on
 * it.
 */
export declare const makeStateMachineArnHttpBinding: <I extends {
    stateMachineArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.StepFunctions.StartExecution`. */
    tag: string;
    /** The distilled operation; the machine ARN is injected as `stateMachineArn`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the state machine ARN. */
    actions: readonly string[];
}) => Effect.Effect<(stateMachine: StateMachine) => Effect.Effect<(request?: Omit<I, "stateMachineArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation addressed by an execution or Map
 * Run ARN the caller already holds (`DescribeExecution`, `StopExecution`,
 * `GetExecutionHistory`, `RedriveExecution`, `DescribeMapRun`, …): the
 * runtime callable passes the request through unchanged while the
 * deploy-time half grants `actions` on the bound {@link StateMachine}'s
 * execution (or Map Run) ARN pattern.
 */
export declare const makeExecutionScopedHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.StepFunctions.StopExecution`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the derived ARN pattern. */
    actions: readonly string[];
    /**
     * Which derived ARN pattern the grant targets.
     * @default "execution"
     */
    scope?: "execution" | "mapRun";
}) => Effect.Effect<(stateMachine: StateMachine) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an activity-scoped operation whose request
 * carries the activity identity as `activityArn` (`GetActivityTask`): the
 * runtime callable injects the bound {@link Activity}'s ARN and the
 * deploy-time half grants `actions` on it.
 */
export declare const makeActivityArnHttpBinding: <I extends {
    activityArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.StepFunctions.GetActivityTask`. */
    tag: string;
    /** The distilled operation; the activity ARN is injected as `activityArn`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the activity ARN. */
    actions: readonly string[];
}) => Effect.Effect<(activity: Activity) => Effect.Effect<(request?: Omit<I, "activityArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a task-token callback operation
 * (`SendTaskSuccess`/`SendTaskFailure`/`SendTaskHeartbeat`): task tokens
 * from `.waitForTaskToken` service integrations carry no IAM resource, so
 * the grant is `*` unless an {@link Activity} is bound (only Activity tasks
 * support resource-level scoping). The request passes through unchanged.
 */
export declare const makeTaskCallbackHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.StepFunctions.SendTaskSuccess`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the activity ARN (or `*`). */
    actions: readonly string[];
}) => Effect.Effect<(activity?: Activity | undefined) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a zero-arity, service-scoped Step Functions
 * binding (`TestState`, `ValidateStateMachineDefinition`): registers the
 * service-scoped IAM policy statement on the host (deploy time) and passes
 * the request through unchanged (runtime).
 */
export declare const makeSfnServiceHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.StepFunctions.TestState`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions the operation needs (service-scoped, `Resource: ["*"]`). */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map