import * as Redacted from "effect/Redacted";
import { type StoredAuthConfig } from "../Auth/StoredAuthProvider.ts";
export declare const NEON_AUTH_PROVIDER_NAME = "Neon";
export type NeonAuthConfig = StoredAuthConfig;
export type NeonResolvedCredentials = {
    type: "apiKey";
    apiKey: Redacted.Redacted<string>;
    source: {
        type: NeonAuthConfig["method"] | "env";
        details?: string;
    };
};
/**
 * Layer that registers the Neon {@link AuthProvider} into the
 * {@link AuthProviders} registry.
 */
export declare const NeonAuth: import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map