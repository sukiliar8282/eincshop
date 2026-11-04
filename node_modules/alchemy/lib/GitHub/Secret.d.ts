import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type Environment } from "./Environment.ts";
import type * as GitHub from "./Providers.ts";
export interface SecretProps {
    /**
     * Repository owner (user or organization).
     */
    owner: string;
    /**
     * Repository name.
     */
    repository: string;
    /**
     * Secret name (e.g. `AWS_ROLE_ARN`).
     */
    name: string;
    /**
     * Secret value. Wrap with `Redacted.make` to prevent the value from
     * appearing in logs or state.
     */
    value: Redacted.Redacted;
    /**
     * Optional environment. When set the secret is scoped to that GitHub
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
export interface Secret extends Resource<"GitHub.Secret", SecretProps, {
    /**
     * ISO-8601 timestamp of the last update.
     */
    updatedAt: string;
}, never, GitHub.Providers> {
}
/**
 * A GitHub Actions repository or environment secret.
 *
 * `Secret` manages the lifecycle of an encrypted secret in GitHub Actions.
 * Secrets are encrypted using the repository's (or environment's) public
 * key via `libsodium` before being stored. The resource is idempotent —
 * calling it with the same name will update the secret value in place.
 *
 * Authentication is resolved via the `GitHubCredentials` service supplied
 * by `GitHub.providers()` (which uses the Alchemy AuthProvider — env,
 * stored PAT, `gh` CLI, or OAuth). The token needs `repo` scope for
 * private repositories or `public_repo` for public ones.
 * ### Repository Secrets
 * Store secrets accessible to all GitHub Actions workflows in the
 * repository.
 *
 * **Example:** Create a Repository Secret
 * ```typescript
 * yield* GitHub.Secret("aws-role", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "AWS_ROLE_ARN",
 *   value: Redacted.make(role.roleArn),
 * });
 * ```
 *
 * ### Environment Secrets
 * Scope a secret to a specific GitHub Actions environment (e.g.
 * `production`, `staging`). Environment secrets require environment
 * protection rules to be satisfied before workflows can access them.
 *
 * **Example:** Create an Environment Secret
 * ```typescript
 * yield* GitHub.Secret("deploy-key", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   environment: "production",
 *   name: "DEPLOY_KEY",
 *   value: Redacted.make("my-secret-value"),
 * });
 * ```
 *
 * ### Wiring with Other Resources
 * A common pattern is wiring the output of another resource — like an
 * IAM role ARN or a database URL — directly into a GitHub secret so
 * that CI workflows can use it.
 *
 * **Example:** Store an IAM Role ARN for CI
 * ```typescript
 * const role = yield* AWS.IAM.Role("ci-role", { ... });
 *
 * yield* GitHub.Secret("ci-role-arn", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "AWS_ROLE_ARN",
 *   value: Redacted.make(role.roleArn),
 * });
 * ```
 *
 * **Example:** Store Multiple Secrets
 * ```typescript
 * yield* GitHub.Secret("db-url", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   environment: "production",
 *   name: "DATABASE_URL",
 *   value: Redacted.make(database.connectionString),
 * });
 *
 * yield* GitHub.Secret("api-key", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   environment: "production",
 *   name: "API_KEY",
 *   value: Redacted.make(apiKey),
 * });
 * ```
 *
 * @resource
 */
export declare const Secret: import("../Resource.ts").ResourceClass<Secret>;
export declare const SecretProvider: () => import("effect/Layer").Layer<Provider.Provider<Secret>, never, GitHub.GitHubCredentials>;
//# sourceMappingURL=Secret.d.ts.map