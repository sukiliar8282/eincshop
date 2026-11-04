import * as Redacted from "effect/Redacted";
import { type StoredAuthConfig } from "../Auth/StoredAuthProvider.ts";
export declare const FLY_AUTH_PROVIDER_NAME = "Fly";
export declare const FLY_API_TOKEN_ENV = "FLY_API_TOKEN";
export declare const FLY_API_HOSTNAME_ENV = "FLY_API_HOSTNAME";
export type FlyAuthConfig = StoredAuthConfig;
export type FlyResolvedCredentials = {
    type: "token";
    apiKey: Redacted.Redacted<string>;
    apiBaseUrl: string;
    source: {
        type: FlyAuthConfig["method"] | "env";
        details?: string;
    };
};
/**
 * Layer that registers the Fly {@link AuthProvider} into the
 * {@link AuthProviders} registry. Fly uses a stored API token locally and
 * `FLY_API_TOKEN` in CI; `FLY_API_HOSTNAME` optionally overrides the API root.
 */
export declare const FlyAuth: import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map