import * as Effect from "effect/Effect";
import { AuthError } from "../Auth/AuthProvider.ts";
/**
 * Normalize a user-supplied GitHub host or URL into the REST API base URL
 * Octokit expects, following the same conventions as the `gh` CLI and the
 * Terraform GitHub provider:
 *
 * - `github.com` / `api.github.com` → `undefined` (Octokit's default)
 * - GitHub Enterprise Cloud with data residency (`acme.ghe.com` or
 *   `api.acme.ghe.com`) → `https://api.acme.ghe.com`
 * - GitHub Enterprise Server (`github.example.com`) → `https://github.example.com/api/v3`;
 *   an explicit path (e.g. an already-complete `/api/v3` URL) is honored as-is.
 *
 * Accepts a bare hostname or a full URL.
 */
export declare const normalizeGitHubBaseUrl: (input: string) => Effect.Effect<string | undefined, AuthError>;
/**
 * The hostname `gh auth token --hostname` expects for a normalized API base
 * URL — the plain host for GitHub Enterprise Server, and the `api.`-less
 * host for GitHub Enterprise Cloud with data residency.
 */
export declare const githubHostname: (baseUrl: string) => string;
/**
 * Resolve the GitHub API base URL from the environment:
 * `GITHUB_BASE_URL` (Terraform convention), then `GITHUB_API_URL` (set by
 * GitHub Actions runners), then `GH_HOST` (gh CLI convention, a bare
 * hostname). Returns `undefined` when unset or when the value points at
 * github.com.
 */
export declare const resolveGitHubBaseUrlFromEnv: Effect.Effect<string | undefined, AuthError>;
//# sourceMappingURL=BaseUrl.d.ts.map