import { RpcSession, type RpcCompatible } from "capnweb";
/**
 * A platform-agnostic interface for a server-side WebSocket.
 */
export interface ServerWebSocketLike {
    send: (message: string) => any | Promise<any>;
    close: (code?: number, reason?: string) => void;
}
/**
 * Represents a websocket RPC session with capnweb.
 * Use the `dispatch` object to handle messages that are received from the client.
 */
export type ServerRpcSession<T extends RpcCompatible<T>> = ReturnType<typeof makeServerRpcSession<T>>;
/**
 * Constructs a ServerRpcSession using capnweb.
 * @param ws - The WebSocket to use for the session.
 * @param main - The main object to use for the session.
 * @returns A ServerRpcSession.
 */
export declare function makeServerRpcSession<T extends RpcCompatible<T>>(ws: ServerWebSocketLike, main: T): {
    session: RpcSession<undefined>;
    dispatch: {
        message: (data: string | Buffer<ArrayBuffer>) => void;
        close: (code: number, reason: string) => void;
    };
};
//# sourceMappingURL=RpcServerSession.d.ts.map