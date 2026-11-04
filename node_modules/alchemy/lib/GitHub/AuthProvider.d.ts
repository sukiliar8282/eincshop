import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import { AuthError } from "../Auth/AuthProvider.ts";
/** Typed values stored in a GitHub provider profile document. */
export declare const GitHubAuthConfigSchema: Schema.Union<readonly [Schema.Struct<{
    readonly method: Schema.Literal<"stored">;
    readonly token: Schema.String;
    readonly baseUrl: Schema.optionalKey<Schema.String>;
}>, Schema.Struct<{
    readonly method: Schema.Literal<"gh-cli">;
    readonly token: Schema.optionalKey<Schema.String>;
    readonly baseUrl: Schema.optionalKey<Schema.String>;
}>]>;
export type GitHubAuthConfig = typeof GitHubAuthConfigSchema.Type;
export interface GitHubResolvedCredentials {
    type: "token";
    token: Redacted.Redacted<string>;
    /**
     * Normalized REST API base URL for GitHub Enterprise (e.g.
     * `https://github.example.com/api/v3` or `https://api.acme.ghe.com`).
     * `undefined` means github.com.
     */
    baseUrl?: string;
    source: {
        type: GitHubAuthConfig["method"] | "env";
        details?: string;
    };
}
export declare const GITHUB_AUTH_PROVIDER_NAME = "GitHub";
/** Resolve standalone GitHub credentials from environment variables. */
export declare const readEnvCredentials: (configBaseUrl?: string) => Effect.Effect<GitHubResolvedCredentials, AuthError>;
/**
 * Build the Layer that registers the GitHub {@link AuthProvider} into the
 * {@link AuthProviders} registry. Included in the GitHub `providers()` layer
 * so the alchemy CLI can discover it.
 *
 * Supported methods:
 * - `gh-cli`: shells out to `gh auth token` (recommended).
 * - `stored`: prompts for a PAT and stores it inline in the provider file.
 *
 * GitHub Enterprise (Server or Cloud with data residency) is supported by
 * every method: `alchemy profile edit --reconfigure GitHub` prompts for the host, or set
 * `GITHUB_BASE_URL` / `GITHUB_API_URL` / `GH_HOST` in the environment. The
 * host is normalized into the REST API base URL passed to Octokit, and
 * `gh auth token` is invoked with `--hostname` so the CLI returns the token
 * for the right host.
 *
 * Browser/device OAuth is intentionally not implemented: GitHub's
 * OAuth App flow requires a `client_secret` we cannot ship, and
 * device flow is exactly what `gh auth login` already does.
 */
export interface GitHubAuthOptions {
    /**
     * Hard-code the GitHub host or API base URL (e.g. `github.example.com`
     * or `https://github.example.com/api/v3`). When set, it takes precedence
     * over the profile's configured host and the environment for every auth
     * method, the configure flow stops prompting for a host, and the `gh` CLI
     * method authenticates against this host. `GitHub.providers({ baseUrl })`
     * threads its option here.
     */
    readonly baseUrl?: string;
}
export declare const makeGitHubAuth: (authOptions?: GitHubAuthOptions) => import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
/**
 * The default GitHub AuthProvider layer — {@link makeGitHubAuth} with no
 * hard-coded host. Use `GitHub.providers({ baseUrl })` (or
 * `makeGitHubAuth({ baseUrl })` directly) to pin a GitHub Enterprise host.
 */
export declare const GitHubAuth: import("effect/Layer").Layer<never, never, import("../index.ts").AuthProviders | ChildProcessSpawner | import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=AuthProvider.d.ts.map