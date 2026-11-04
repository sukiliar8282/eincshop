import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { AlchemyContext } from "../AlchemyContext.ts";
import { AuthProviders } from "../Auth/AuthProvider.ts";
import { Stack } from "../Stack.ts";
import { Stage } from "../Stage.ts";
/**
 * The stack-specific half of the sidecar environment. One sidecar process
 * serves many stacks (the test harness shares a single child across all
 * test files), so this part travels per RPC session — as a query parameter
 * on the session websocket — rather than being baked into the child's env
 * at spawn time.
 */
export interface SessionEnvironment {
    alchemyContext: AlchemyContext["Service"];
    stack: {
        name: string;
        stage: string;
    };
}
export interface RpcServerEnvironment {
    profile: string | undefined;
    envFile: string | undefined;
    /**
     * Default session environment for sessions that do not carry their own
     * (legacy single-stack boots). Sessions created by {@link RpcProviderProxy}
     * always send an explicit {@link SessionEnvironment}.
     */
    alchemyContext?: AlchemyContext["Service"];
    stack?: {
        name: string;
        stage: string;
    };
}
/** Query parameter carrying the JSON {@link SessionEnvironment} on session websockets. */
export declare const SESSION_ENV_PARAM = "alchemy-session-env";
export declare const encodeSessionEnvironment: (env: SessionEnvironment) => string;
export declare const decodeSessionEnvironment: (raw: string) => SessionEnvironment;
export type RpcEnvironmentServices = Layer.Success<ReturnType<typeof layer>>;
export declare const layer: (environment: Pick<RpcServerEnvironment, "profile" | "envFile"> & SessionEnvironment) => Layer.Layer<AlchemyContext | AuthProviders | import("../Auth/Credentials.ts").CredentialsStore | import("../Auth/Profile.ts").ProfileStore | Stack | Stage, import("effect/PlatformError").PlatformError, import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
export declare const RPC_SERVER_ENVIRONMENT_KEY: "ALCHEMY_RPC_SERVER_ENVIRONMENT";
/** The spawn-time environment the parent baked into the child's process env. */
export declare const fromProcessEnv: Effect.Effect<RpcServerEnvironment, unknown>;
/**
 * Legacy single-stack boot: the full environment (including the stack) baked
 * into the process env at spawn time. Used by children that serve exactly one
 * stack for their whole lifetime (e.g. the Vite dev-server child, which gets
 * an explicit environment from `startViteChild`). RPC sidecars do NOT use
 * this — their sessions each carry a {@link SessionEnvironment}.
 */
export declare const fromEnv: () => Layer.Layer<AlchemyContext | AuthProviders | import("../Auth/Credentials.ts").CredentialsStore | import("../Auth/Profile.ts").ProfileStore | Stack | Stage, unknown, import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=RpcServerEnvironment.d.ts.map