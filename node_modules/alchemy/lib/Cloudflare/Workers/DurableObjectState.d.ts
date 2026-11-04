import type * as cf from "@cloudflare/workers-types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { type DurableObjectStorage } from "./DurableObjectStorage.ts";
import { type WebSocket } from "./WebSocket.ts";
/**
 * Options for {@link DurableObjectState.abort}.
 *
 * `retryAlarm` defaults to `true`: an alarm interrupted by `abort` is
 * retried after the isolate resets. Set it to `false` to cancel that
 * alarm instead.
 */
export type DurableObjectAbortOptions = cf.DurableObjectAbortOptions;
declare const DurableObjectState_base: Context.ServiceClass<DurableObjectState, "Cloudflare.DurableObjectState", {
    readonly id: cf.DurableObjectId;
    readonly storage: DurableObjectStorage;
    container?: cf.Container;
    /**
     * Run an Effect in the background without blocking the current event,
     * keeping the Durable Object alive until it settles. The Effect runs with
     * the caller's full context (services, tracing), and the resulting
     * promise is registered with workerd's `state.waitUntil`.
     */
    waitUntil<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<void, never, R | RuntimeContext>;
    /**
     * The raw workerd DurableObjectState, for interop with async APIs.
     */
    readonly raw: cf.DurableObjectState;
    /**
     * Run `callback` while workerd holds every other event on this object.
     * The callback runs with the caller's full context (services, tracing),
     * as `waitUntil` does, so a service provided to the calling fiber is
     * visible inside the gate. A defect in the callback rejects the gate
     * and workerd resets the object, which is the platform's contract.
     */
    blockConcurrencyWhile<T, R = never>(callback: () => Effect.Effect<T, never, R>): Effect.Effect<T, never, R | RuntimeContext>;
    acceptWebSocket(ws: WebSocket, tags?: string[]): Effect.Effect<void, never, RuntimeContext>;
    getWebSockets(tag?: string): Effect.Effect<WebSocket[], never, RuntimeContext>;
    setWebSocketAutoResponse(maybeReqResp?: cf.WebSocketRequestResponsePair): Effect.Effect<void, never, RuntimeContext>;
    getWebSocketAutoResponse(): Effect.Effect<cf.WebSocketRequestResponsePair | null, never, RuntimeContext>;
    getWebSocketAutoResponseTimestamp(ws: cf.WebSocket): Effect.Effect<Date | null, never, RuntimeContext>;
    setHibernatableWebSocketEventTimeout(timeoutMs?: number): Effect.Effect<void, never, RuntimeContext>;
    getHibernatableWebSocketEventTimeout(): Effect.Effect<number | null, never, RuntimeContext>;
    getTags(ws: cf.WebSocket): Effect.Effect<string[], never, RuntimeContext>;
    /**
     * Forcibly reset this Durable Object. A JavaScript `Error` with the
     * given message is logged and cannot be caught in application code.
     *
     * By default an in-progress alarm retries after the reset. Pass
     * `{ retryAlarm: false }` to stop it instead — for example an `alarm`
     * handler that deletes storage so the constructor does not recreate it.
     */
    abort(reason?: string, options?: DurableObjectAbortOptions): Effect.Effect<void, never, RuntimeContext>;
}>;
export declare class DurableObjectState extends DurableObjectState_base {
}
export declare const fromDurableObjectState: (state: cf.DurableObjectState) => DurableObjectState["Service"];
export {};
//# sourceMappingURL=DurableObjectState.d.ts.map