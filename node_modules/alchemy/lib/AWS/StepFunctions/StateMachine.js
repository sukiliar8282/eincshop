import * as iam from "@distilled.cloud/aws/iam";
import * as sfn from "@distilled.cloud/aws/sfn";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { compileProgram, SfnCompileError } from "./Asl/compile.js";
/**
 * The definition failed AWS's `validateStateMachineDefinition` pre-flight
 * check (run in reconcile before create/update). Carries the validator's
 * ERROR-severity diagnostics.
 */
export class InvalidStateMachineDefinition extends Data.TaggedError("InvalidStateMachineDefinition") {
}
const StateMachineResource = Resource("AWS.StepFunctions.StateMachine");
/**
 * Sugar over the raw `StateMachine` resource: compile a typed `Sfn` program
 * to a plain ASL definition object plus collected IAM policy statements,
 * then register the same `StateMachine` resource the raw path uses. Nothing
 * engine-level — the raw `definition` escape hatch stays first-class.
 */
const fromProgram = (id, props) => Effect.gen(function* () {
    const { program, policyStatements, ...rest } = props;
    const compiled = yield* Effect.try({
        try: () => compileProgram(program),
        catch: (error) => error instanceof SfnCompileError
            ? error
            : new SfnCompileError({ message: String(error) }),
    });
    return yield* StateMachineResource(id, {
        ...rest,
        definition: compiled.definition,
        policyStatements: [
            ...compiled.policyStatements,
            ...(policyStatements ?? []),
        ],
    });
});
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
export const StateMachine = Object.assign(StateMachineResource, { fromProgram });
/** Normalize a plain or redacted string to its plain value. */
const plain = (value) => typeof value === "string" ? value : Redacted.value(value);
/** Convert a tag record to the SFN wire shape (lowercase key/value). */
const toSfnTags = (tags) => Object.entries(tags).map(([key, value]) => ({ key, value }));
/** Convert an SFN wire tag list back to a record. */
const fromSfnTags = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.key === "string" && typeof tag.value === "string")
    .map((tag) => [tag.key, tag.value]));
/**
 * Serialize the desired definition to its ASL JSON string, applying
 * `${key}` substitutions.
 */
const serializeDefinition = (props) => {
    let definition = typeof props.definition === "string"
        ? props.definition
        : JSON.stringify(props.definition, null, 2);
    for (const [key, value] of Object.entries(props.definitionSubstitutions ?? {})) {
        definition = definition.replaceAll(`\${${key}}`, value);
    }
    return definition;
};
/**
 * Canonicalize an ASL JSON string for drift comparison (whitespace/key-order
 * insensitive). Falls back to the raw string when unparsable.
 */
const normalizeDefinition = (definition) => {
    try {
        const stable = (value) => Array.isArray(value)
            ? value.map(stable)
            : value !== null && typeof value === "object"
                ? Object.fromEntries(Object.entries(value)
                    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                    .map(([k, v]) => [k, stable(v)]))
                : value;
        return JSON.stringify(stable(JSON.parse(definition)));
    }
    catch {
        return definition;
    }
};
/**
 * Extract every Lambda function ARN referenced in a serialized definition so
 * the auto-created execution role can be granted `lambda:InvokeFunction`.
 */
const scanLambdaArns = (definition) => {
    const matches = definition.match(/arn:aws[a-z0-9-]*:lambda:[a-z0-9-]+:\d{12}:function:[A-Za-z0-9_.-]+(?::[A-Za-z0-9_$-]+)?/g);
    return [...new Set(matches ?? [])];
};
/**
 * CloudWatch Logs delivery permissions required by Step Functions logging.
 * These actions do not support resource-level scoping.
 */
const LOG_DELIVERY_ACTIONS = [
    "logs:CreateLogDelivery",
    "logs:CreateLogStream",
    "logs:GetLogDelivery",
    "logs:UpdateLogDelivery",
    "logs:DeleteLogDelivery",
    "logs:ListLogDeliveries",
    "logs:PutLogEvents",
    "logs:PutResourcePolicy",
    "logs:DescribeResourcePolicies",
    "logs:DescribeLogGroups",
];
/** Map the `logging` prop to the wire `LoggingConfiguration`. */
const toWireLogging = (logging) => logging === undefined
    ? undefined
    : {
        level: logging.level,
        includeExecutionData: logging.includeExecutionData ?? false,
        destinations: (logging.destinations ?? []).map((arn) => ({
            cloudWatchLogsLogGroup: {
                logGroupArn: arn.endsWith(":*") ? arn : `${arn}:*`,
            },
        })),
    };
/** Compare observed logging configuration against the desired one. */
const loggingDrifted = (observed, desired) => {
    const observedLevel = observed?.level ?? "OFF";
    const desiredLevel = desired?.level ?? "OFF";
    if (observedLevel !== desiredLevel)
        return true;
    if (desiredLevel === "OFF")
        return false;
    if ((observed?.includeExecutionData ?? false) !==
        (desired?.includeExecutionData ?? false)) {
        return true;
    }
    const arnsOf = (config) => (config?.destinations ?? [])
        .map((d) => d.cloudWatchLogsLogGroup?.logGroupArn ?? "")
        .sort()
        .join(",");
    return arnsOf(observed) !== arnsOf(desired);
};
/**
 * IAM changes (new roles, fresh trust policies) propagate to Step Functions
 * eventually; a create right after role creation can transiently fail with
 * `AccessDeniedException`. Bounded retry, explicitly typed so declaration
 * emit never widens the provider layer (see PATTERNS §7).
 */
const retryWhileRolePropagates = (self) => Effect.retry(self, {
    while: (e) => e._tag === "AccessDeniedException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
});
/**
 * A state machine of the same name may still be `DELETING` from a prior
 * destroy; creation returns the typed `StateMachineDeleting` until the
 * deletion completes. Bounded retry (~60s).
 */
const retryWhileDeleting = (self) => Effect.retry(self, {
    while: (e) => e._tag === "StateMachineDeleting",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(30)]),
});
export const StateMachineProvider = () => Provider.effect(StateMachine, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.stateMachineName ??
            (yield* createPhysicalName({ id, maxLength: 80 })));
    });
    const createRoleName = (id) => createPhysicalName({ id, maxLength: 64 });
    const createPolicyName = (id) => createPhysicalName({ id, maxLength: 128 });
    const stateMachineArnOf = (region, accountId, name) => `arn:aws:states:${region}:${accountId}:stateMachine:${name}`;
    const describeOrUndefined = Effect.fn(function* (stateMachineArn) {
        return yield* sfn
            .describeStateMachine({ stateMachineArn })
            .pipe(Effect.catchTag("StateMachineDoesNotExist", () => Effect.succeed(undefined)));
    });
    /**
     * Pre-flight the serialized definition through the vendor validator
     * so a definitively invalid document fails with typed diagnostics
     * before any create/update call. Best-effort: if the validate call
     * itself fails (missing IAM permission, throttling), reconcile
     * proceeds and create/updateStateMachine remains the authority.
     */
    const preflightValidateDefinition = Effect.fn(function* (definition, type) {
        const report = yield* sfn
            .validateStateMachineDefinition({
            definition,
            type,
            severity: "ERROR",
        })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        if (report !== undefined && report.result === "FAIL") {
            return yield* Effect.fail(new InvalidStateMachineDefinition({
                diagnostics: report.diagnostics.map((diagnostic) => ({
                    severity: diagnostic.severity,
                    code: plain(diagnostic.code),
                    message: plain(diagnostic.message),
                    location: diagnostic.location === undefined
                        ? undefined
                        : plain(diagnostic.location),
                })),
            }));
        }
    });
    const fetchObservedTags = Effect.fn(function* (resourceArn) {
        return yield* sfn.listTagsForResource({ resourceArn }).pipe(Effect.map((r) => fromSfnTags(r.tags)), Effect.catchTag("ResourceNotFound", () => Effect.succeed({})));
    });
    /**
     * Compute the full inline-policy statement list for the auto-created
     * execution role: Lambda invoke grants scanned from the definition,
     * user statements, binding-contributed statements, and CloudWatch
     * Logs delivery permissions when logging is enabled.
     */
    const buildRolePolicyStatements = (definition, news, bindings) => {
        const statements = [];
        const lambdaArns = scanLambdaArns(definition);
        if (lambdaArns.length > 0) {
            statements.push({
                Effect: "Allow",
                Action: ["lambda:InvokeFunction"],
                Resource: [
                    ...lambdaArns,
                    // cover qualified invocations (versions/aliases)
                    ...lambdaArns
                        .filter((arn) => !/:function:[^:]+:/.test(arn))
                        .map((arn) => `${arn}:*`),
                ],
            });
        }
        if (news.logging && news.logging.level !== "OFF") {
            statements.push({
                Effect: "Allow",
                Action: LOG_DELIVERY_ACTIONS,
                Resource: ["*"],
            });
        }
        if (news.tracingEnabled) {
            statements.push({
                Effect: "Allow",
                Action: [
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords",
                    "xray:GetSamplingRules",
                    "xray:GetSamplingTargets",
                ],
                Resource: ["*"],
            });
        }
        statements.push(...(news.policyStatements ?? []));
        statements.push(...bindings.flatMap((b) => b.data.policyStatements));
        return statements;
    };
    /**
     * Ensure the auto-created execution role exists with the
     * `states.amazonaws.com` trust policy and the desired inline policy.
     * Idempotent: tolerates the role already existing and converges the
     * inline policy on every reconcile.
     */
    const ensureExecutionRole = Effect.fn(function* ({ id, roleName, policyName, statements, }) {
        const tags = yield* createInternalTags(id);
        const role = yield* iam
            .createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { Service: "states.amazonaws.com" },
                        Action: "sts:AssumeRole",
                    },
                ],
            }),
            Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
        })
            .pipe(Effect.catchTag("EntityAlreadyExistsException", () => iam.getRole({ RoleName: roleName })));
        if (statements.length > 0) {
            yield* iam.putRolePolicy({
                RoleName: roleName,
                PolicyName: policyName,
                PolicyDocument: JSON.stringify({
                    Version: "2012-10-17",
                    Statement: statements,
                }),
            });
        }
        else {
            yield* iam
                .deleteRolePolicy({ RoleName: roleName, PolicyName: policyName })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        }
        return role.Role.Arn;
    });
    return StateMachine.Provider.of({
        stables: ["stateMachineName", "stateMachineArn", "type"],
        list: () => Effect.gen(function* () {
            const pages = yield* sfn.listStateMachines
                .pages({})
                .pipe(Stream.runCollect);
            const items = Array.from(pages).flatMap((page) => page.stateMachines ?? []);
            const results = yield* Effect.forEach(items, (item) => sfn
                .describeStateMachine({
                stateMachineArn: item.stateMachineArn,
            })
                .pipe(
            // name/roleArn are optional on the wire; a machine
            // missing either cannot be expressed as Attributes.
            Effect.map((machine) => machine.name != null &&
                machine.stateMachineArn != null &&
                machine.roleArn != null
                ? {
                    stateMachineName: machine.name,
                    stateMachineArn: machine.stateMachineArn,
                    type: machine.type,
                    roleArn: machine.roleArn,
                    roleName: undefined,
                }
                : undefined), Effect.catchTag("StateMachineDoesNotExist", () => Effect.succeed(undefined))), { concurrency: 5 });
            return results.filter((item) => item !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.stateMachineName ?? (yield* createName(id, olds ?? {}));
            const stateMachineArn = output?.stateMachineArn ??
                stateMachineArnOf(region, accountId, name);
            const found = yield* describeOrUndefined(stateMachineArn);
            if (!found || found.status === "DELETING")
                return undefined;
            const attrs = {
                stateMachineName: found.name,
                stateMachineArn: found.stateMachineArn,
                type: found.type,
                roleArn: found.roleArn,
                roleName: output?.roleName,
            };
            const tags = yield* fetchObservedTags(stateMachineArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if ((olds?.type ?? "STANDARD") !== (news?.type ?? "STANDARD")) {
                return { action: "replace" };
            }
            // definition/role/logging/tracing/tags converge via update
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session, bindings, }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.stateMachineName ?? (yield* createName(id, news));
            const stateMachineArn = stateMachineArnOf(region, accountId, name);
            const type = (news.type ?? "STANDARD");
            const definition = serializeDefinition(news);
            const desiredLogging = toWireLogging(news.logging);
            const desiredTracing = { enabled: news.tracingEnabled ?? false };
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // Pre-flight: fail with typed diagnostics before touching IAM or
            // the machine when the definition is definitively invalid.
            yield* preflightValidateDefinition(definition, type);
            // Ensure the execution role first — the machine cannot exist
            // without one. Managed unless an explicit roleArn is provided.
            let roleArn = news.roleArn;
            let roleName;
            if (roleArn === undefined) {
                roleName = yield* createRoleName(id);
                const policyName = yield* createPolicyName(id);
                roleArn = yield* ensureExecutionRole({
                    id,
                    roleName,
                    policyName,
                    statements: buildRolePolicyStatements(definition, news, bindings),
                });
            }
            // 1. OBSERVE — cloud state is authoritative; `output` is only a
            //    name cache. A machine still DELETING from a prior destroy
            //    must finish deleting before we can recreate it.
            const observed = yield* describeOrUndefined(stateMachineArn).pipe(Effect.map((machine) => machine?.status === "DELETING" ? undefined : machine));
            if (observed === undefined) {
                // 2. ENSURE — create; tolerate the concurrent-create race and
                //    wait out a same-name deletion or IAM propagation delay.
                yield* retryWhileRolePropagates(retryWhileDeleting(sfn
                    .createStateMachine({
                    name,
                    definition,
                    roleArn,
                    type,
                    loggingConfiguration: desiredLogging,
                    tracingConfiguration: desiredTracing,
                    tags: toSfnTags(desiredTags),
                })
                    .pipe(Effect.catchTag("StateMachineAlreadyExists", () => Effect.succeed(undefined)))));
            }
            else {
                // 3. SYNC — diff OBSERVED cloud state against desired and issue
                //    a single update only when something actually drifted.
                const drifted = normalizeDefinition(plain(observed.definition)) !==
                    normalizeDefinition(definition) ||
                    observed.roleArn !== roleArn ||
                    loggingDrifted(observed.loggingConfiguration, desiredLogging) ||
                    (observed.tracingConfiguration?.enabled ?? false) !==
                        desiredTracing.enabled;
                if (drifted) {
                    yield* retryWhileRolePropagates(sfn.updateStateMachine({
                        stateMachineArn,
                        definition,
                        roleArn,
                        loggingConfiguration: desiredLogging ?? { level: "OFF" },
                        tracingConfiguration: desiredTracing,
                    }));
                    // Updates propagate eventually (typically seconds). Poll the
                    // describe endpoint (bounded) so subsequent reads observe the
                    // new revision; proceed best-effort if it hasn't settled.
                    yield* describeOrUndefined(stateMachineArn).pipe(Effect.repeat({
                        schedule: Schedule.fixed("1 second"),
                        until: (machine) => machine === undefined ||
                            normalizeDefinition(plain(machine.definition)) ===
                                normalizeDefinition(definition),
                        times: 20,
                    }));
                }
            }
            // 3b. SYNC TAGS — against OBSERVED cloud tags so adoption
            //     converges (create-time tags only apply on first create).
            const observedTags = yield* fetchObservedTags(stateMachineArn);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* sfn.tagResource({
                    resourceArn: stateMachineArn,
                    tags: upsert.map(({ Key, Value }) => ({
                        key: Key,
                        value: Value,
                    })),
                });
            }
            if (removed.length > 0) {
                yield* sfn.untagResource({
                    resourceArn: stateMachineArn,
                    tagKeys: removed,
                });
            }
            yield* session.note(stateMachineArn);
            return {
                stateMachineName: name,
                stateMachineArn,
                type,
                roleArn,
                roleName,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteStateMachine is idempotent (no error when already gone)
            // and asynchronous — the machine transitions through DELETING.
            yield* sfn.deleteStateMachine({
                stateMachineArn: output.stateMachineArn,
            });
            // Tear down the managed execution role (absent when the user
            // supplied an explicit roleArn). Every step tolerates the role
            // being partially or fully gone already.
            if (output.roleName !== undefined) {
                const roleName = output.roleName;
                yield* iam.listRolePolicies.items({ RoleName: roleName }).pipe(Stream.mapEffect((policyName) => iam
                    .deleteRolePolicy({
                    RoleName: roleName,
                    PolicyName: policyName,
                })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void))), Stream.runDrain, Effect.catchTag("NoSuchEntityException", () => Effect.void));
                yield* iam
                    .deleteRole({ RoleName: roleName })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            }
        }),
    });
}));
//# sourceMappingURL=StateMachine.js.map