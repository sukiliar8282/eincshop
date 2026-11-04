import * as Lambda from "@distilled.cloud/aws/lambda";
import type { ConfigError } from "effect/Config";
import * as Context from "effect/Context";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
import type { Scope } from "effect/Scope";
import type { InputProps } from "../../Input.ts";
import type { PlatformServices } from "../../Platform.ts";
import type { DistributiveOmit } from "../../Util/types.ts";
import type { DurableExecutionContext, DurableStep } from "./Durable.ts";
import { Function, type FunctionProps, type FunctionServices, type HandlerContext } from "./Function.ts";
type TypeId = "AWS.Lambda.DurableFunction";
declare const TypeId: "AWS.Lambda.DurableFunction";
/**
 * The services available inside a durable function's run body.
 *
 * The bridge provides all of them per durable invocation: `DurableStep`
 * powers `Durable.step`/`Durable.sleep`/`Durable.waitForCallback`,
 * `DurableExecutionContext` carries the execution ARN, `HandlerContext` is
 * the raw `lambda.Context`, and a fresh `Scope` scopes per-invocation
 * resources.
 *
 * Deliberately narrow: cloud clients (`Credentials`/`Region`-requiring
 * effects) are NOT provided to the body directly — resolve typed binding
 * clients in the init phase and call them inside `Durable.step`, which is
 * exactly the determinism law the replay model requires.
 */
export type DurableRunServices = DurableStep | DurableExecutionContext | HandlerContext | Scope;
/**
 * A durable function implementation: a function from a typed `Input` payload
 * to an Effect producing the execution's `Result`. Code outside
 * `Durable.step` re-runs on every replay and must be deterministic.
 */
export type DurableFunctionImpl<Input = unknown, Result = unknown> = (input: Input) => Effect.Effect<Result, never, DurableRunServices>;
/**
 * Services satisfied by the DurableFunction's own machinery (or the engine)
 * and therefore excluded from the caller-facing requirements of the returned
 * Effect/Layer.
 */
export type DurableFunctionInitServices = FunctionServices | PlatformServices | Function | DurableRunServices;
/**
 * Properties of an {@link DurableFunction | AWS.Lambda.DurableFunction}.
 *
 * A DurableFunction accepts every {@link FunctionProps | Function prop}
 * except `functionUrl` (every invocation of a durable function arrives as the
 * durable-execution envelope — there is no HTTP surface), plus the
 * `DurableConfig` tuning knobs below.
 */
/** The DurableConfig tuning knobs a DurableFunction adds to Function props. */
export interface DurableFunctionTuning {
    /**
     * Maximum total duration of a durable execution, from start to terminal
     * state (minimum 60 seconds, maximum 1 year). Rounded up to whole seconds.
     * @default 24 hours (AWS default)
     */
    executionTimeout?: Duration.Input;
    /**
     * How long completed execution history is retained (e.g. `"7 days"`;
     * 1–90 days). Rounded to whole days on the wire.
     * @default "14 days" (AWS default)
     */
    retentionPeriod?: Duration.Input;
}
/**
 * Props of a {@link DurableFunction}: any Function props that carry a
 * `main` — the orchestrator body is an Effect that has to be bundled into
 * an entrypoint — minus `functionUrl` (every invocation arrives as the
 * durable envelope, so there is no HTTP surface), plus the DurableConfig
 * knobs.
 *
 * Selected by SHAPE (`Extract<…, { main: string }>`), not by packaging, so
 * any future main-bearing variant is durable-capable automatically; a
 * prebuilt `image` function is excluded because it has no `main` for the
 * `impl` Effect to live in.
 *
 * The Omit DISTRIBUTES over the union: a bare `Omit` computes the COMMON
 * keys and merges the members, which would make `main` optional and let
 * `image` through alongside it.
 */
export type DurableFunctionProps = DistributiveOmit<Extract<FunctionProps, {
    main: string;
}>, "functionUrl" | "durableConfig"> & DurableFunctionTuning;
/**
 * Options for starting a durable execution.
 */
export interface DurableStartOptions<Input = unknown> {
    /**
     * Idempotent execution name (`DurableExecutionName`): starting again with
     * the same name and payload reattaches to the existing execution; the same
     * name with a different payload fails with
     * `DurableExecutionAlreadyStartedException`.
     */
    name?: string;
    /** The typed input payload delivered to the durable function body. */
    params?: Input;
    /**
     * Function version or alias to pin the execution to. Durable executions
     * replay against the version they started on. `$LATEST` is suitable for
     * disposable development; production starts should target an immutable
     * numbered {@link Version} or a stable {@link Alias}.
     */
    qualifier?: string;
}
/**
 * A started durable execution reference.
 */
export interface DurableExecutionRef {
    /** ARN of the durable execution (when returned by the Invoke response). */
    executionArn: string | undefined;
    statusCode: number | undefined;
}
/**
 * The typed durable-execution handle: start, inspect, stop, and complete
 * callbacks of durable executions of this function. Returned by
 * `yield* MyDurableFunction` (as part of {@link DurableFunction}) and, inside
 * the function's own init phase, by {@link DurableFunctionScope}.
 */
export interface DurableFunctionHandle<Input = unknown, Result = unknown> {
    Type: TypeId;
    name: string;
    /** @internal phantom */
    Result?: Result;
    /**
     * Start a durable execution (async `Invoke` with the alchemy payload
     * envelope). Returns immediately; the execution progresses through
     * checkpointed re-invocations.
     */
    start(options?: DurableStartOptions<Input>): Effect.Effect<DurableExecutionRef, Lambda.InvokeError>;
    /** Fetch the execution's status/result. */
    get(executionArn: string): Effect.Effect<Lambda.GetDurableExecutionResponse, Lambda.GetDurableExecutionError>;
    /** List executions of this function, optionally filtered by name/status. */
    list(options?: {
        name?: string;
        statuses?: Lambda.ExecutionStatus[];
    }): Effect.Effect<Lambda.ListDurableExecutionsByFunctionResponse, Lambda.ListDurableExecutionsByFunctionError>;
    /** Stop a running execution. */
    stop(executionArn: string, error?: Lambda.ErrorObject): Effect.Effect<Lambda.StopDurableExecutionResponse, Lambda.StopDurableExecutionError>;
    /** Complete a `Durable.waitForCallback` from the outside. */
    sendCallbackSuccess(callbackId: string, result?: unknown): Effect.Effect<void, Lambda.SendDurableExecutionCallbackSuccessError>;
    sendCallbackFailure(callbackId: string, error?: Lambda.ErrorObject): Effect.Effect<void, Lambda.SendDurableExecutionCallbackFailureError>;
    sendCallbackHeartbeat(callbackId: string): Effect.Effect<void, Lambda.SendDurableExecutionCallbackHeartbeatError>;
}
/**
 * The value produced by `yield* MyDurableFunction`: the typed
 * {@link DurableFunctionHandle} plus references to the underlying
 * {@link Function} resource and its key attributes.
 */
export interface DurableFunction<Input = unknown, Result = unknown> extends DurableFunctionHandle<Input, Result> {
    /** The underlying Lambda {@link Function} resource owned by this wrapper. */
    function: Function;
    /** Physical name of the underlying Lambda function. */
    functionName: Function["functionName"];
    /** ARN of the underlying Lambda function. */
    functionArn: Function["functionArn"];
}
declare const DurableFunctionScope_base: Context.ServiceClass<DurableFunctionScope, "AWS.Lambda.DurableFunctionScope", DurableFunctionHandle<unknown, unknown>>;
/**
 * Inside a DurableFunction's init phase, resolves the function's own
 * {@link DurableFunctionHandle} (e.g. for chained self-starts). Also what
 * `yield* AWS.Lambda.DurableFunction` (the bare namespace value) resolves.
 */
export declare class DurableFunctionScope extends DurableFunctionScope_base {
}
export interface DurableFunctionClass {
    <_Self>(): {
        <Input = unknown, Result = unknown, PropsReq = never, InitReq = never>(id: string, props: InputProps<DurableFunctionProps> | Effect.Effect<InputProps<DurableFunctionProps>, ConfigError, PropsReq>, impl: Effect.Effect<DurableFunctionImpl<Input, Result>, ConfigError, InitReq>): Effect.Effect<DurableFunction<Input, Result>, never, Function["Providers"] | Exclude<PropsReq | InitReq, DurableFunctionInitServices>> & {
            new (_: never): DurableFunctionImpl<Input, Result>;
        };
        <const Id extends string>(id: Id): Effect.Effect<DurableFunction, never, Function["Providers"]> & {
            make<Input = unknown, Result = unknown, PropsReq = never, InitReq = never>(props: InputProps<DurableFunctionProps> | Effect.Effect<InputProps<DurableFunctionProps>, ConfigError, PropsReq>, impl: Effect.Effect<DurableFunctionImpl<Input, Result>, ConfigError, InitReq>): Layer.Layer<_Self, never, Function["Providers"] | Exclude<PropsReq | InitReq, DurableFunctionInitServices>>;
            new (_: never): {};
        };
    };
    <Input = unknown, Result = unknown, PropsReq = never, InitReq = never>(id: string, props: InputProps<DurableFunctionProps> | Effect.Effect<InputProps<DurableFunctionProps>, ConfigError, PropsReq>, impl: Effect.Effect<DurableFunctionImpl<Input, Result>, ConfigError, InitReq>): Effect.Effect<DurableFunction<Input, Result>, never, Function["Providers"] | Exclude<PropsReq | InitReq, DurableFunctionInitServices>>;
}
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
export declare const DurableFunction: DurableFunctionClass;
export {};
//# sourceMappingURL=DurableFunction.d.ts.map