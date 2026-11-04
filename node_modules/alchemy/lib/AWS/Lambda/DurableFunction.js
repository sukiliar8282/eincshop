import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Effectable from "effect/Effectable";
import * as Option from "effect/Option";
import * as Output from "../../Output.js";
import { toSeconds, toWireDays } from "../../Util/Duration.js";
import { effectClass, taggedFunction } from "../../Util/effect.js";
import { DURABLE_SDK_MODULE, encodeDurableEnvelope, makeDurableListener, } from "./DurableBridge.js";
import { Function, } from "./Function.js";
const TypeId = "AWS.Lambda.DurableFunction";
/**
 * Inside a DurableFunction's init phase, resolves the function's own
 * {@link DurableFunctionHandle} (e.g. for chained self-starts). Also what
 * `yield* AWS.Lambda.DurableFunction` (the bare namespace value) resolves.
 */
export class DurableFunctionScope extends Context.Service()("AWS.Lambda.DurableFunctionScope") {
}
/**
 * Where the composed init stashes the {@link DurableFunction} value on the
 * owned Function instance so `yield*` of any authoring form can produce it.
 * A symbol key passes through the Resource proxy untouched (string props
 * fabricate `Output.PropExpr` accessors).
 */
const DurableHandleKey = Symbol.for("alchemy/AWS.Lambda.DurableFunction");
/**
 * Vendor the Durable Execution SDK into the artifact. `build.install` roots
 * are excluded from the bundle and npm-installed into the zip targeting the
 * function's architecture, so this single entry both externalizes the SDK
 * (the bridge dynamic-imports it at runtime) and ships it. Respects an
 * explicit user entry (e.g. a pinned version).
 */
const withDurableSdkInstall = (install) => {
    if (install === undefined) {
        return [DURABLE_SDK_MODULE];
    }
    if (Array.isArray(install)) {
        return install.includes(DURABLE_SDK_MODULE)
            ? install
            : [...install, DURABLE_SDK_MODULE];
    }
    const record = install;
    return DURABLE_SDK_MODULE in record
        ? record
        : { ...record, [DURABLE_SDK_MODULE]: "*" };
};
/**
 * Lower DurableFunction props onto the base Function's props: split off the
 * DurableConfig knobs into the internal wire-level `durableConfig` channel,
 * disable the Function URL (durable invocations are the only surface), and
 * vendor the Durable Execution SDK.
 */
const mapDurableProps = (props) => {
    const { executionTimeout, retentionPeriod, build, ...rest } = props ?? {};
    const executionTimeoutSeconds = toSeconds(executionTimeout);
    const retentionPeriodDays = toWireDays(retentionPeriod);
    return {
        ...rest,
        // Every invocation of a DurableConfig'd function arrives as the durable
        // envelope — a Function URL could never be served.
        functionUrl: false,
        build: {
            ...build,
            install: withDurableSdkInstall(build?.install),
        },
        durableConfig: {
            ...(executionTimeoutSeconds !== undefined
                ? { ExecutionTimeout: executionTimeoutSeconds }
                : {}),
            ...(retentionPeriodDays !== undefined
                ? { RetentionPeriodInDays: retentionPeriodDays }
                : {}),
        },
    };
};
const mapDurablePropsInput = (props) => Effect.isEffect(props)
    ? Effect.map(props, mapDurableProps)
    : mapDurableProps(props);
const resolveDurableHandle = (id) => (instance) => {
    const handle = instance?.[DurableHandleKey];
    return handle !== undefined
        ? Effect.succeed(handle)
        : Effect.die(new Error(`AWS.Lambda.DurableFunction<${id}> has no durable handle — provide ` +
            `its implementation (\`${id}.make(props, impl)\` or an inline ` +
            `form) before yielding it.`));
};
/**
 * Compose the user's orchestrator init effect into the owned Function's init
 * effect: resolve the durable management-plane clients, self-bind the
 * checkpoint-protocol IAM onto the function's own execution role, register
 * the durable listener on the owned entrypoint, and stash the typed handle
 * for `yield* MyDurableFunction`.
 */
const composeDurableImpl = (name, impl) => Effect.gen(function* () {
    // Self: the Function resource this wrapper owns (the Platform machinery
    // provides `Function.Self` during its own init).
    const host = yield* Function;
    // Resolve the distilled operations once at init — they close over the
    // ambient Credentials/Region/HttpClient so the handle's runtime
    // callables need no cloud services of their own.
    const invoke = yield* Lambda.invoke;
    const getDurableExecution = yield* Lambda.getDurableExecution;
    const listDurableExecutionsByFunction = yield* Lambda.listDurableExecutionsByFunction;
    const stopDurableExecution = yield* Lambda.stopDurableExecution;
    const sendCallbackSuccess = yield* Lambda.sendDurableExecutionCallbackSuccess;
    const sendCallbackFailure = yield* Lambda.sendDurableExecutionCallbackFailure;
    const sendCallbackHeartbeat = yield* Lambda.sendDurableExecutionCallbackHeartbeat;
    // Capture the function-name Output WITHOUT resolving it. This is a
    // self-reference — `host` is the very Function this wrapper's init is
    // building — and `functionName`'s Output source only registers during
    // that function's own reconcile. Yielding it here (init/plan time) would
    // block forever (the reconcile that produces it waits on this init to
    // finish). Resolve it lazily inside the runtime callables instead, the
    // same posture as `InvokeFunctionHttp`.
    const FunctionName = host.functionName;
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        // Self-binding: the statements land on this function's own execution
        // role through the standard bindings channel (precreate makes the stub,
        // reconcile applies the collected bindings).
        yield* host.bind `Allow(${host}, AWS.Lambda.DurableFunction(${name}))`({
            policyStatements: [
                // The checkpoint/replay protocol the Durable Execution SDK
                // drives from inside the handler.
                {
                    Effect: "Allow",
                    Action: [
                        "lambda:CheckpointDurableExecution",
                        "lambda:GetDurableExecutionState",
                    ],
                    Resource: [
                        host.functionArn,
                        Output.interpolate `${host.functionArn}:*`,
                    ],
                },
                // Self-start (handle.start) and chained self-invokes.
                {
                    Effect: "Allow",
                    Action: ["lambda:InvokeFunction"],
                    Resource: [
                        host.functionArn,
                        Output.interpolate `${host.functionArn}:*`,
                    ],
                },
                // Management-plane handle methods. Durable execution ARNs are
                // a distinct resource shape from the function ARN, so these
                // stay account-wide for now.
                {
                    Effect: "Allow",
                    Action: [
                        "lambda:GetDurableExecution",
                        "lambda:GetDurableExecutionHistory",
                        "lambda:ListDurableExecutionsByFunction",
                        "lambda:StopDurableExecution",
                        "lambda:SendDurableExecutionCallbackSuccess",
                        "lambda:SendDurableExecutionCallbackFailure",
                        "lambda:SendDurableExecutionCallbackHeartbeat",
                    ],
                    Resource: ["*"],
                },
            ],
        });
    }
    const handle = {
        Type: TypeId,
        name,
        start: (options) => Effect.gen(function* () {
            // `FunctionName` is the host's own unresolved Output (captured raw at
            // init to avoid the plan-time self-reference deadlock). Resolve both
            // stages — Output → Accessor → string — lazily at runtime.
            const functionName = yield* yield* FunctionName;
            const response = yield* invoke({
                FunctionName: functionName,
                InvocationType: "Event",
                DurableExecutionName: options?.name,
                Qualifier: options?.qualifier,
                Payload: encodeDurableEnvelope(name, options?.params),
            });
            return {
                executionArn: response.DurableExecutionArn,
                statusCode: response.StatusCode,
            };
        }),
        get: (executionArn) => getDurableExecution({ DurableExecutionArn: executionArn }),
        list: (options) => Effect.gen(function* () {
            const functionName = yield* yield* FunctionName;
            return yield* listDurableExecutionsByFunction({
                FunctionName: functionName,
                DurableExecutionName: options?.name,
                Statuses: options?.statuses,
            });
        }),
        stop: (executionArn, error) => stopDurableExecution({
            DurableExecutionArn: executionArn,
            Error: error,
        }),
        sendCallbackSuccess: (callbackId, result) => sendCallbackSuccess({
            CallbackId: callbackId,
            Result: result === undefined ? undefined : JSON.stringify(result),
        }).pipe(Effect.asVoid),
        sendCallbackFailure: (callbackId, error) => sendCallbackFailure({
            CallbackId: callbackId,
            Error: error,
        }).pipe(Effect.asVoid),
        sendCallbackHeartbeat: (callbackId) => sendCallbackHeartbeat({ CallbackId: callbackId }).pipe(Effect.asVoid),
    };
    // Resolve the body function. Bindings resolved in the impl's init close
    // over their services; the returned closure's only leftover requirements
    // are DurableRunServices, provided per invocation by the bridge.
    const fn = yield* impl.pipe(Effect.provideService(DurableFunctionScope, handle));
    yield* host.listen(makeDurableListener({
        name,
        run: (input) => fn(input),
    }));
    // Expose the full DurableFunction value (handle + resource refs) to
    // `yield* MyDurableFunction` for every authoring form.
    host[DurableHandleKey] = {
        ...handle,
        function: host,
        functionName: host.functionName,
        functionArn: host.functionArn,
    };
});
/**
 * An AWS Lambda Durable Function — a code-first, replay-based orchestrator
 * that IS a durable Lambda Function. `AWS.Lambda.DurableFunction` is a
 * wrapper of {@link Function}: it owns the underlying Lambda function,
 * configures its `DurableConfig` at `CreateFunction` (durability is a
 * create-time property — a DurableFunction is always durable), registers the
 * durable-execution listener on the owned entrypoint, self-binds the
 * checkpoint-protocol IAM (`lambda:CheckpointDurableExecution`,
 * `lambda:GetDurableExecutionState`) onto the execution role, and vendors the
 * open-source `@aws/durable-execution-sdk-js` into the artifact (install it
 * in your project: `npm i @aws/durable-execution-sdk-js`).
 *
 * Executions progress by checkpoint + replay: a `Durable.sleep` or
 * `Durable.waitForCallback` suspends the execution with zero compute billed
 * until Lambda re-invokes the same function version to resume, and completed
 * `Durable.step`s replay from the checkpoint log without re-executing.
 *
 * Every invocation of a durable function arrives as the durable-execution
 * envelope, so a DurableFunction has no HTTP surface (`functionUrl` is disabled) —
 * it does one thing: run durable orchestrations. Reusing a logical id
 * between a plain `Function` and a `DurableFunction` replaces the physical
 * function (DurableConfig cannot be flipped in place).
 *
 * ### Defining a Durable Function
 * **Example:** Class form with steps and a durable sleep
 * ```typescript
 * export class OrderFlow extends AWS.Lambda.DurableFunction<OrderFlow>()(
 *   "OrderFlow",
 *   {
 *     main: import.meta.url,
 *     executionTimeout: "1 hour",
 *     retentionPeriod: "7 days",
 *   },
 *   Effect.gen(function* () {
 *     // init: resolve typed binding clients (IAM lands on this function's role)
 *     const putItem = yield* AWS.DynamoDB.PutItem(table);
 *
 *     return Effect.fn(function* (input: { orderId: string }) {
 *       const reserved = yield* AWS.Lambda.Durable.step(
 *         "reserve",
 *         putItem({ Item: { pk: { S: input.orderId } } }).pipe(Effect.orDie),
 *         { retry: { limit: 3, delay: "5 seconds" } },
 *       );
 *       yield* AWS.Lambda.Durable.sleep("cooldown", "10 minutes");
 *       return { orderId: input.orderId, reserved };
 *     });
 *   }),
 * ) {}
 * ```
 *
 * **Example:** Tag + default export (entrypoint form)
 * ```typescript
 * // order-flow.ts — `main` points at this module
 * export class OrderFlow extends AWS.Lambda.DurableFunction<OrderFlow>()(
 *   "OrderFlow",
 * ) {}
 *
 * export default OrderFlow.make(
 *   { main: import.meta.url, executionTimeout: "1 hour" },
 *   Effect.gen(function* () {
 *     return Effect.fn(function* (input: { orderId: string }) {
 *       return yield* AWS.Lambda.Durable.step("work", doWork(input));
 *     });
 *   }),
 * );
 * ```
 *
 * **Example:** Inline effect form
 * ```typescript
 * const flow = yield* AWS.Lambda.DurableFunction(
 *   "OrderFlow",
 *   { main: "./src/order-flow.ts" },
 *   Effect.gen(function* () {
 *     return Effect.fn(function* (input: { orderId: string }) {
 *       return yield* AWS.Lambda.Durable.step("work", doWork(input));
 *     });
 *   }),
 * );
 * ```
 *
 * ### Starting and Monitoring Executions
 * **Example:** Starting an execution
 * ```typescript
 * const orders = yield* OrderFlow;
 * const ref = yield* orders.start({
 *   name: "order-123", // idempotent start
 *   params: { orderId: "123" },
 *   qualifier: "live",
 * });
 * ```
 *
 * **Example:** Publish and promote for production
 * ```typescript
 * const orders = yield* OrderFlow;
 * const version = yield* AWS.Lambda.Version("OrderFlowVersion", {
 *   function: orders.function,
 * });
 * yield* AWS.Lambda.Alias("OrderFlowLive", {
 *   version,
 *   aliasName: "live",
 * });
 *
 * const ref = yield* orders.start({
 *   name: "order-123",
 *   params: { orderId: "123" },
 *   qualifier: "live",
 * });
 * ```
 *
 * **Example:** Checking status
 * ```typescript
 * const execution = yield* orders.get(ref.executionArn!);
 * // execution.Status: "RUNNING" | "SUCCEEDED" | "FAILED" | ...
 * ```
 *
 * ### External Callbacks
 * **Example:** Waiting for an approval
 * ```typescript
 * const approval = yield* AWS.Lambda.Durable.waitForCallback<{ ok: boolean }>(
 *   "approve",
 *   (callbackId) => storeCallbackId(callbackId),
 *   { timeout: "1 day" },
 * );
 * ```
 *
 * @resource
 */
export const DurableFunction = taggedFunction(DurableFunctionScope, ((...args) => {
    if (args.length === 0) {
        // `DurableFunction<Self>()` — the binder for the class/tag forms.
        return DurableFunction;
    }
    const [id, props, impl] = args;
    if (impl === undefined) {
        // Tag form: `class OrderFlow extends DurableFunction<OrderFlow>()("OrderFlow") {}`
        // + `export default OrderFlow.make(props, impl)`.
        const fnTag = Function()(id);
        return Object.assign(function (props, impl) {
            return Effect.flatMap(fnTag(mapDurablePropsInput(props), composeDurableImpl(id, impl)), resolveDurableHandle(id));
        }, fnTag, {
            make: (props, impl) => fnTag.make(mapDurablePropsInput(props), composeDurableImpl(id, impl)),
        }, Effectable.Prototype({
            label: `${TypeId}<${id}>`,
            evaluate: () => Effect.flatMap(Effect.serviceOption(fnTag.Self), Option.match({
                onNone: () => resolveDurableHandle(id)(undefined),
                onSome: resolveDurableHandle(id),
            })),
        }));
    }
    // Inline forms (eager effect / inline class): delegate to the Function
    // platform with lowered props and the composed durable init.
    return effectClass(Effect.flatMap(Function(id, mapDurablePropsInput(props), composeDurableImpl(id, impl)), resolveDurableHandle(id)));
}));
//# sourceMappingURL=DurableFunction.js.map