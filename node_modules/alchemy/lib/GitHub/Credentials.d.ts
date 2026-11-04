import { Octokit } from "@octokit/rest";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
export interface GitHubCredentialsService {
    readonly token: Redacted.Redacted<string>;
    /**
     * REST API base URL for GitHub Enterprise (e.g.
     * `https://github.example.com/api/v3` for GitHub Enterprise Server, or
     * `https://api.acme.ghe.com` for GitHub Enterprise Cloud with data
     * residency). `undefined` targets github.com.
     */
    readonly baseUrl?: string;
    /**
     * Construct an Octokit for these credentials. Pass `override` to target a
     * different host than the credentials' own `baseUrl` — `override.baseUrl`
     * is used verbatim, including `undefined` for github.com (which is why the
     * override is an object rather than an optional string: it distinguishes
     * "no override" from "override to the github.com default").
     */
    readonly octokit: (override?: {
        baseUrl: string | undefined;
    }) => Octokit;
}
declare const GitHubCredentials_base: Context.ServiceClass<GitHubCredentials, "GitHub::Credentials", Effect.Effect<GitHubCredentialsService, never, never>>;
export declare class GitHubCredentials extends GitHubCredentials_base {
}
/**
 * Build a `GitHubCredentials` layer from a literal token. Useful for
 * tests or when callers already have a PAT in hand.
 *
 * Pass `baseUrl` to target a GitHub Enterprise instance. It accepts a
 * hostname or URL and is normalized into the REST API base URL — a GitHub
 * Enterprise Server host gets `/api/v3` appended, a `*.ghe.com`
 * data-residency host gets the `api.` prefix.
 */
export declare const fromToken: (token: string | Redacted.Redacted<string>, options?: {
    readonly baseUrl?: string;
}) => Layer.Layer<GitHubCredentials, never, never>;
/**
 * Build a `GitHubCredentials` layer that reads the token from
 * `GITHUB_ACCESS_TOKEN` or `GITHUB_TOKEN` at layer build time.
 *
 * GitHub Enterprise is resolved from the environment too: `GITHUB_BASE_URL`,
 * `GITHUB_API_URL` (set by GitHub Actions runners), or `GH_HOST` select the
 * host, and on an enterprise host `GH_ENTERPRISE_TOKEN` /
 * `GITHUB_ENTERPRISE_TOKEN` are checked before the standard token variables.
 */
export declare const fromEnv: () => Layer.Layer<GitHubCredentials, never, never>;
/**
 * Build a `GitHubCredentials` layer that resolves a token via the
 * Alchemy AuthProvider for the configured profile (defaults to
 * the current Alchemy profile).
 *
 * Pass `baseUrl` to hard-code the GitHub host — it takes precedence over
 * whatever host the auth provider resolved from the profile config or
 * environment. `GitHub.providers({ baseUrl })` threads its option here.
 */
export declare const fromAuthProvider: (options?: {
    readonly baseUrl?: string;
}) => Layer.Layer<GitHubCredentials, never, import("../index.ts").AuthProviders | import("../Auth/Profile.ts").ProfileStore>;
export {};
//# sourceMappingURL=Credentials.d.ts.map