import * as Effect from "effect/Effect";
import { AlchemistInvalidInput } from "../Errors.ts";
import { type Target } from "../Session.ts";
export interface CheckEnvironmentInput extends Target {
    /** Providers to check. Omitted means every registered provider. */
    readonly providers?: ReadonlyArray<string>;
}
export interface EnvironmentCheck {
    readonly provider: string;
    readonly status: "satisfied" | "missing" | "no-contract";
    readonly missing: ReadonlyArray<{
        readonly alternatives: ReadonlyArray<string>;
    }>;
}
export interface EnvironmentCheckResult {
    readonly checks: ReadonlyArray<EnvironmentCheck>;
    readonly satisfied: boolean;
}
/**
 * Verify the environment variables each registered provider's CI contract
 * requires are present.
 */
export declare const checkEnvironment: (input: CheckEnvironmentInput) => Effect.Effect<{
    checks: {
        provider: string;
        status: "missing" | "no-contract" | "satisfied";
        missing: {
            alternatives: ReadonlyArray<string>;
        }[];
    }[];
    satisfied: boolean;
}, AlchemistInvalidInput | import("../../Auth/AuthProvider.ts").AuthError | import("effect/PlatformError").PlatformError | import("../../Auth/Profile.ts").ProfileError, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
//# sourceMappingURL=provider.d.ts.map