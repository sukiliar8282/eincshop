import type { HttpEffect } from "../Http.ts";
/**
 * Serve schemaless RPC only on the private mesh, and only with the
 * host's {@link RPC_TOKEN_ENV}. Public `*.up.railway.app` requests to
 * `/__rpc__/*` get 401 even if they guess the path or the token.
 *
 * Implemented here (not `alchemy/Rpc.serveRpc`) so canvas Functions stay
 * under the 96KB start-command cap. Value methods only — no streams.
 *
 * Importing this module registers the Function-runtime hook. Tagged
 * Functions that host RPC methods must import it (or `bindFunction`,
 * which re-exports this module).
 */
export declare const serveRailwayRpc: <Req = never>(shape: Record<string, unknown>, fallback: HttpEffect<Req>) => HttpEffect<Req>;
/** Register private-mesh RPC on this Function/Service isolate. */
export declare const enableRailwayRpc: () => void;
//# sourceMappingURL=rpc-server.d.ts.map