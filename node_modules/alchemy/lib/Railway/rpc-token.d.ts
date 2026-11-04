/** Env var on the RPC host. Callers send it as {@link RPC_TOKEN_HEADER}. */
export declare const RPC_TOKEN_ENV = "ALCHEMY_RPC_TOKEN";
/** Request header the caller must send. Never accepted from the public edge. */
export declare const RPC_TOKEN_HEADER = "x-alchemy-rpc-token";
export declare const PRIVATE_HOST_SUFFIX = ".railway.internal";
export declare const DEFAULT_RPC_PORT = 3000;
/** Same prefix as `alchemy/Rpc` so Function canvas code does not import Rpc.ts. */
export declare const RPC_PATH_PREFIX = "/__rpc__/";
/** Same envelope tag as `alchemy/Rpc.ErrorTag`. */
export declare const RPC_ERROR_TAG = "~alchemy/rpc/error";
export declare const RPC_TOKEN_ATTR = "rpcToken";
export declare const rpcEnvKeys: (logicalId: string) => {
    host: string;
    port: string;
    token: string;
};
/**
 * Child {@link makeRandom} for a Function/Service logical id. Generated
 * once, persisted in alchemy state, reused on later deploys.
 */
export declare const mintRpcToken: (logicalId: string) => import("effect/Effect").Effect<import("../Output.ts").ObjectExpr<import("effect/Redacted").Redacted<string>, never>, never, import("../Provider.ts").Provider<import("../Random.ts").Random>>;
//# sourceMappingURL=rpc-token.d.ts.map