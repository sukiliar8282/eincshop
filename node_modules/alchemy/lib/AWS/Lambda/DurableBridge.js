var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import { isScopeEjected } from "../../Http.js";
import { toSeconds } from "../../Util/Duration.js";
import { DurableExecutionContext, DurableStep, } from "./Durable.js";
import { HandlerContext } from "./Function.js";
/** Module id of AWS's Durable Execution SDK (an optional peer dependency). */
export const DURABLE_SDK_MODULE = "@aws/durable-execution-sdk-js";
/**
 * Shape predicate for durable-execution invocations — the durable analogue of
 * `isSQSEvent`. A durable function's invocations always arrive in this
 * envelope (the durable execution wraps even the first invocation).
 */
export const isDurableExecutionEvent = (event) => typeof event === "object" &&
    event !== null &&
    typeof event.DurableExecutionArn === "string" &&
    typeof event.CheckpointToken === "string" &&
    typeof event.InitialExecutionState === "object" &&
    event.InitialExecutionState !== null;
export const encodeDurableEnvelope = (workflow, params) => JSON.stringify({ $alchemy: { workflow }, params });
const asDurableEnvelope = (payload) => typeof payload === "object" &&
    payload !== null &&
    "$alchemy" in payload &&
    typeof payload.$alchemy === "object" &&
    payload.$alchemy !== null &&
    typeof payload.$alchemy.workflow === "string"
    ? payload
    : undefined;
/**
 * Extract the customer input payload from the checkpoint log's EXECUTION
 * operation (first page — the EXECUTION operation is always the log's first
 * entry, so pagination never hides it).
 */
export const readDurableInputPayload = (event) => {
    const operations = event.InitialExecutionState?.Operations ?? [];
    const execution = operations.find((op) => op?.Type === "EXECUTION");
    const raw = execution?.ExecutionDetails?.InputPayload;
    if (raw === undefined)
        return undefined;
    try {
        return JSON.parse(raw);
    }
    catch {
        return raw;
    }
};
/**
 * Load the Durable Execution SDK. The module id is an install root of every
 * DurableFunction bundle (the wrapper merges it into `build.install`), so
 * resolution happens at runtime inside the sandbox — from the artifact's
 * vendored `node_modules`, otherwise from the managed runtime's bundled
 * copy.
 */
const loadDurableSdk = Effect.promise(() => import(__rewriteRelativeImportExtension(DURABLE_SDK_MODULE))).pipe(Effect.catchDefect((defect) => Effect.die(new Error(`Failed to load "${DURABLE_SDK_MODULE}" — install it in the project ` +
    `that defines the DurableFunction (npm i ${DURABLE_SDK_MODULE}) so ` +
    `the bundler can vendor it into the artifact.`, { cause: defect }))));
// ---------------------------------------------------------------------------
// DurableStep over the native DurableContext
// ---------------------------------------------------------------------------
const toNativeRetryStrategy = (retry) => {
    const base = toSeconds(retry.delay) ?? 1;
    const cap = toSeconds(retry.maxDelay);
    const backoff = retry.backoff ?? "exponential";
    return (_error, attemptCount) => {
        if (attemptCount > retry.limit) {
            return { shouldRetry: false };
        }
        const raw = backoff === "constant"
            ? base
            : backoff === "linear"
                ? base * attemptCount
                : base * 2 ** Math.max(0, attemptCount - 1);
        const seconds = Math.max(1, Math.ceil(cap ? Math.min(raw, cap) : raw));
        return { shouldRetry: true, delay: { seconds } };
    };
};
const toNativeStepConfig = (options) => {
    if (!options.retry && !options.semantics)
        return undefined;
    return {
        ...(options.retry
            ? { retryStrategy: toNativeRetryStrategy(options.retry) }
            : {}),
        ...(options.semantics
            ? {
                semantics: options.semantics === "at-most-once"
                    ? "AT_MOST_ONCE_PER_RETRY"
                    : "AT_LEAST_ONCE_PER_RETRY",
            }
            : {}),
    };
};
const wrapDurableContext = (dctx) => ({
    step: (options) => Effect.tryPromise(() => dctx.step(options.name, () => Effect.runPromise(options.effect), toNativeStepConfig(options))).pipe(Effect.orDie),
    wait: (name, duration) => Effect.tryPromise(() => dctx.wait(name, { seconds: Math.max(1, toSeconds(duration) ?? 1) })).pipe(Effect.orDie),
    waitForCallback: (options) => Effect.tryPromise(() => dctx.waitForCallback(options.name, (callbackId) => Effect.runPromise(options.submitter(callbackId)), {
        ...(options.timeout !== undefined
            ? { timeout: { seconds: toSeconds(options.timeout) } }
            : {}),
        ...(options.heartbeatTimeout !== undefined
            ? {
                heartbeatTimeout: {
                    seconds: toSeconds(options.heartbeatTimeout),
                },
            }
            : {}),
    })).pipe(Effect.orDie),
});
export const makeDurableListener = (options) => 
// `Effect.sync`, NOT `Effect.gen` yielding `loadDurableSdk`: the listener is
// CONSTRUCTED when the host resolves `runtimeContext.exports`, which happens
// at PLAN/DEPLOY time (`Platform.ts` does `yield* runtimeContext.exports`).
// Importing `@aws/durable-execution-sdk-js` there both contradicts the "never
// at plan time" contract and stalls the deploy (the SDK's module init
// touches the AWS client). Defer the load to the first real invocation and
// memoize it.
Effect.sync(() => {
    // Bind the SDK-wrapped handler once, on first invocation, and reuse it.
    let wrapped;
    const ensureWrapped = Effect.suspend(() => wrapped !== undefined
        ? Effect.succeed(wrapped)
        : loadDurableSdk.pipe(Effect.map((sdk) => {
            wrapped = sdk.withDurableExecution(async (event, dctx) => {
                // The SDK extracts the customer payload from the EXECUTION
                // operation and hands it to us on every (re-)invocation.
                const envelope = asDurableEnvelope(event);
                const params = envelope !== undefined ? envelope.params : event;
                // Fresh request scope per durable invocation, matching the
                // Lambda dispatcher / Worker / Workflow bridges.
                const scope = Scope.makeUnsafe();
                const exit = await Effect.runPromiseExit(options.run(params).pipe(Effect.provide(Layer.mergeAll(Layer.succeed(DurableStep, wrapDurableContext(dctx)), Layer.succeed(DurableExecutionContext, {
                    executionArn: dctx.executionContext.durableExecutionArn,
                }), Layer.succeed(HandlerContext, dctx.lambdaContext), Layer.succeed(Scope.Scope, scope)))));
                if (!isScopeEjected(scope)) {
                    await Scope.close(scope, exit).pipe(Effect.ignoreCause({
                        log: "Warn",
                        message: "Durable invocation scope close failed",
                    }), Effect.runPromise);
                }
                if (Exit.isSuccess(exit)) {
                    return exit.value;
                }
                throw Cause.squash(exit.cause);
            });
            return wrapped;
        })));
    // `HandlerContext` is a runtime-only requirement satisfied unconditionally
    // by the Lambda dispatcher, which provides it (and `Scope`) to every
    // listener's returned effect. Cast the listener down to the `Req = never`
    // `FunctionListener` so the requirement never leaks into the host's init
    // effect — the exact contract `serve`/`makeFunctionHttpHandler` rely on.
    return ((event) => {
        if (!isDurableExecutionEvent(event))
            return;
        const payload = readDurableInputPayload(event);
        const envelope = asDurableEnvelope(payload);
        if (envelope !== undefined &&
            envelope.$alchemy.workflow !== options.name) {
            // Addressed to another DurableFunction on this host — decline so its
            // listener picks it up.
            return;
        }
        return Effect.gen(function* () {
            const context = yield* HandlerContext;
            // Lazily load + memoize the SDK on the first real invocation.
            const run = yield* ensureWrapped;
            // The SDK owns the checkpoint protocol from here: it replays the log,
            // runs new work, and returns the SUCCEEDED/FAILED/PENDING envelope
            // Lambda interprets. A rejection here is a protocol-level failure —
            // let it surface as an invocation error.
            return yield* Effect.promise(() => run(event, context));
        });
    });
});
//# sourceMappingURL=DurableBridge.js.map