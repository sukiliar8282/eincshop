import * as Redacted from "effect/Redacted";
import { type StoredAuthConfig } from "../Auth/StoredAuthProvider.ts";
export declare const HETZNER_AUTH_PROVIDER_NAME = "Hetzner";
export declare const HCLOUD_TOKEN_ENV = "HCLOUD_TOKEN";
export declare const HCLOUD_ENDPOINT_ENV = "HCLOUD_ENDPOINT";
export type HetznerAuthConfig = StoredAuthConfig;
export type HetznerResolvedCredentials = {
    type: "token";
    token: Redacted.Redacted<string>;
    apiBaseUrl: string;
    source: {
        type: HetznerAuthConfig["method"] | "env";
        details?: string;
    };
};
/**
 * Layer that registers the Hetzner {@link AuthProvider} into the
 * {@link AuthProviders} registry.
 *
 * Auth is a Hetzner Cloud API token (`HCLOUD_TOKEN`). An optional
 * `HCLOUD_ENDPOINT` overrides the API root.
 */
export declare const HetznerAuth: import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map