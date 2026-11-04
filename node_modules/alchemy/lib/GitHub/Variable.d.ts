import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type Environment } from "./Environment.ts";
import type * as GitHub from "./Providers.ts";
export interface VariableProps {
    /**
     * Repository owner (user or organization).
     */
    owner: string;
    /**
     * Repository name.
     */
    repository: string;
    /**
     * Variable name (e.g. `AWS_ROLE_ARN`).
     */
    name: string;
    /**
     * Variable value.
     */
    value: string;
    /**
     * Optional environment. When set the variable is scoped to that GitHub
     * Actions environment instead of the whole repository. Accepts an
     * environment name or a `GitHub.Environment` resource.
     */
    environment?: string | Environment;
    /**
     * Override the GitHub host or API base URL for this resource only (e.g.
     * `github.example.com` for GitHub Enterprise). Falls back to
     * `GitHub.providers({ baseUrl })`, then to the host resolved by the auth
     * provider. Changing it replaces the resource — the same name on a
     * different GitHub instance is a different physical resource.
     */
    baseUrl?: string;
}
export interface Variable extends Resource<"GitHub.Variable", VariableProps, {
    /**
     * ISO-8601 timestamp of the last update.
     */
    updatedAt: string;
}, never, GitHub.Providers> {
}
/**
 * A GitHub Actions repository variable.
 *
 * `Variable` manages the lifecycle of a plain-text configuration variable
 * in GitHub Actions. Variables are visible in workflow logs and are
 * suitable for non-sensitive configuration like region names, environment
 * labels, or feature flags. For sensitive values, use `GitHub.Secret`
 * instead.
 *
 * Authentication is resolved via the `GitHubCredentials` service supplied
 * by `GitHub.providers()` (which uses the Alchemy AuthProvider — env,
 * stored PAT, `gh` CLI, or OAuth). The token needs `repo` scope for
 * private repositories or `public_repo` for public ones.
 * ### Repository Variables
 * Store variables accessible to all GitHub Actions workflows in the
 * repository.
 *
 * **Example:** Create a Repository Variable
 * ```typescript
 * yield* GitHub.Variable("aws-region", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "AWS_REGION",
 *   value: "us-east-1",
 * });
 * ```
 *
 * ### Environment Variables
 * Scope a variable to a specific GitHub Actions environment (e.g.
 * `production`, `staging`). Use `GitHub.Environment` to manage the
 * environment itself.
 *
 * **Example:** Create an Environment Variable
 * ```typescript
 * yield* GitHub.Variable("region", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   environment: "production",
 *   name: "AWS_REGION",
 *   value: "us-east-1",
 * });
 * ```
 *
 * ### Wiring with Other Resources
 * Pass output attributes from other resources into GitHub variables so
 * that CI workflows can reference them.
 *
 * **Example:** Store a Worker URL for CI
 * ```typescript
 * const worker = yield* Cloudflare.Worker("Api", { ... });
 *
 * yield* GitHub.Variable("api-url", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "API_URL",
 *   value: worker.url!,
 * });
 * ```
 *
 * **Example:** Multiple Variables
 * ```typescript
 * yield* GitHub.Variable("region", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "AWS_REGION",
 *   value: "us-east-1",
 * });
 *
 * yield* GitHub.Variable("stage", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "DEPLOY_STAGE",
 *   value: "production",
 * });
 * ```
 *
 * @resource
 */
export declare const Variable: import("../Resource.ts").ResourceClass<Variable>;
export declare const VariableProvider: () => import("effect/Layer").Layer<Provider.Provider<Variable>, never, GitHub.GitHubCredentials>;
//# sourceMappingURL=Variable.d.ts.map