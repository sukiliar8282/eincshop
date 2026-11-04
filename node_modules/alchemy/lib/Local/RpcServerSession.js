import { RpcSession } from "capnweb";
/**
 * Constructs a ServerRpcSession using capnweb.
 * @param ws - The WebSocket to use for the session.
 * @param main - The main object to use for the session.
 * @returns A ServerRpcSession.
 */
export function makeServerRpcSession(ws, main) {
    const { transport, dispatch } = makeWebSocketRpcTransport(ws);
    const session = new RpcSession(transport, main);
    return { session, dispatch };
}
function makeWebSocketRpcTransport(ws) {
    let receiveQueue = [];
    let receiveResolver;
    let receiveRejecter;
    let error;
    return {
        transport: {
            send: async (message) => await ws.send(message),
            receive: async () => {
                const next = receiveQueue.shift();
                if (next) {
                    return next;
                }
                else if (error) {
                    throw error;
                }
                return new Promise((resolve, reject) => {
                    receiveResolver = resolve;
                    receiveRejecter = reject;
                });
            },
            abort: (reason) => {
                const message = reason instanceof Error ? reason.message : String(reason);
                ws.close(3000, message);
                error ??= reason;
            },
        },
        dispatch: {
            message: (data) => {
                if (error) {
                    return;
                }
                data = typeof data === "string" ? data : data.toString();
                if (receiveResolver) {
                    receiveResolver(data);
                    receiveResolver = undefined;
                    receiveRejecter = undefined;
                }
                else {
                    receiveQueue.push(data);
                }
            },
            close: (code, reason) => {
                if (!error) {
                    error = new Error(`WebSocket closed with code ${code}: ${reason}`);
                    if (receiveRejecter) {
                        receiveRejecter(error);
                        receiveRejecter = undefined;
                        receiveResolver = undefined;
                    }
                }
            },
        },
    };
}
//# sourceMappingURL=RpcServerSession.js.map