import type * as cf from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { DurableObjectState } from "./DurableObjectState.ts";
export type RawWebSocket = cf.WebSocket;
export interface WebSocket {
    readonly ws: RawWebSocket;
    send(data: string | Uint8Array): Effect.Effect<void>;
    close(code: number, reason: string): Effect.Effect<void>;
    serializeAttachment<T>(value: T): void;
    deserializeAttachment<T>(): T | null;
}
export declare const fromWebSocket: (ws: RawWebSocket) => WebSocket;
export declare const upgrade: () => Effect.Effect<readonly [HttpServerResponse.HttpServerResponse, WebSocket], never, DurableObjectState | import("../../RuntimeContext.ts").RuntimeContext>;
//# sourceMappingURL=WebSocket.d.ts.map