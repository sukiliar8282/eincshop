import * as Effect from "effect/Effect";
import * as HttpBody from "effect/unstable/http/HttpBody";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { DurableObjectState } from "./DurableObjectState.js";
export const fromWebSocket = (ws) => ({
    ws,
    send: (data) => Effect.sync(() => ws.send(data)),
    close: (code, reason) => Effect.sync(() => ws.close(code, reason)),
    serializeAttachment: (value) => ws.serializeAttachment(value),
    deserializeAttachment: () => ws.deserializeAttachment(),
});
// declare global {
//   const WebSocketPair: new () => [cf.WebSocket, cf.WebSocket];
// }
export const upgrade = Effect.fn(function* () {
    const _Response = Response;
    const ctx = yield* DurableObjectState;
    // @ts-expect-error
    const [client, server] = new WebSocketPair();
    const serverSocket = fromWebSocket(server);
    yield* ctx.acceptWebSocket(serverSocket);
    const rawResponse = new _Response(null, {
        status: 101,
        webSocket: client,
    });
    const effectResponse = HttpServerResponse.setBody(HttpServerResponse.empty({ status: 101 }), HttpBody.raw(rawResponse));
    return [effectResponse, serverSocket];
});
//# sourceMappingURL=WebSocket.js.map