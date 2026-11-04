import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type * as GitHub from "./Providers.ts";
export interface EnvironmentProps {
    /**
     * Repository owner (user or organization).
     */
    owner: string;
    /**
     * Repository name.
     */
    repository: string;
    /**
     * Environment name (e.g. `production`, `staging`). The name is the
     * environment's identity — changing it replaces the environment.
     */
    name: string;
    /**
     * Minutes to wait before allowing deployments to proceed (0–43200,
     * i.e. up to 30 days). Requires a plan that supports environment
     * protection rules on the repository.
     * @default 0
     */
    waitTimer?: number;
    /**
     * Whether users who created or pushed the deployment are prevented
     * from approving their own deployment.
     * @default false
     */
    preventSelfReview?: boolean;
    /**
     * The people or teams that must review deployments to this environment.
     * Up to six users or teams in total; reviewers must have at least read
     * access to the repository. Users are referenced by login, teams by
     * slug (teams are only valid for organization-owned repositories).
     */
    reviewers?: {
        /**
         * User logins allowed to review deployments.
         */
        users?: string[];
        /**
         * Team slugs (within the owning organization) allowed to review
         * deployments.
         */
        teams?: string[];
    };
    /**
     * Which branches can deploy to this environment. Omit to allow all
     * branches. Set `protectedBranches: true` to restrict deployments to
     * branches with branch protection rules, or `customBranchPolicies` to a
     * list of branch name patterns (e.g. `["main", "release/*"]`).
     */
    deploymentBranchPolicy?: {
        protectedBranches: true;
    } | {
        customBranchPolicies: string[];
    };
    /**
     * Override the GitHub host or API base URL for this resource only (e.g.
     * `github.example.com` for GitHub Enterprise). Falls back to
     * `GitHub.providers({ baseUrl })`, then to the host resolved by the auth
     * provider. Changing it replaces the resource — the same name on a
     * different GitHub instance is a different physical resource.
     */
    baseUrl?: string;
}
export interface Environment extends Resource<"GitHub.Environment", EnvironmentProps, {
    /**
     * Numeric GitHub environment ID.
     */
    environmentId: number;
    /**
     * GraphQL node ID of the environment.
     */
    nodeId: string;
    /**
     * The environment name.
     */
    name: string;
    /**
     * URL to view the environment in a browser.
     */
    htmlUrl: string;
    /**
     * ISO-8601 timestamp of when the environment was created.
     */
    createdAt: string;
    /**
     * ISO-8601 timestamp of the last update.
     */
    updatedAt: string;
}, never, GitHub.Providers> {
}
/**
 * A GitHub Actions deployment environment.
 *
 * `Environment` manages a repository's deployment environment (e.g.
 * `production`, `staging`) along with its protection rules: required
 * reviewers, wait timers, self-review prevention, and deployment branch
 * policies. Pair it with `GitHub.Secret` and `GitHub.Variable` (both accept
 * an `environment` prop) to scope configuration to the environment.
 *
 * Environments are available on public repositories on every plan; private
 * repositories require GitHub Pro, Team, or Enterprise, and protection
 * rules on private repositories require Team or Enterprise.
 *
 * Authentication is resolved via the `GitHubCredentials` service supplied
 * by `GitHub.providers()` (env, stored PAT, `gh` CLI, or OAuth). The token
 * needs `repo` scope.
 * ### Creating an Environment
 * **Example:** Basic Environment
 * ```typescript
 * const production = yield* GitHub.Environment("production", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "production",
 * });
 * ```
 *
 * **Example:** Environment with Protection Rules
 * ```typescript
 * yield* GitHub.Environment("production", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "production",
 *   waitTimer: 30,
 *   preventSelfReview: true,
 *   reviewers: {
 *     users: ["release-manager"],
 *     teams: ["platform"],
 *   },
 * });
 * ```
 *
 * ### Deployment Branch Policies
 * **Example:** Restrict to Protected Branches
 * ```typescript
 * yield* GitHub.Environment("production", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "production",
 *   deploymentBranchPolicy: { protectedBranches: true },
 * });
 * ```
 *
 * **Example:** Restrict to Branch Name Patterns
 * ```typescript
 * yield* GitHub.Environment("production", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "production",
 *   deploymentBranchPolicy: {
 *     customBranchPolicies: ["main", "release/*"],
 *   },
 * });
 * ```
 *
 * ### Environment Secrets and Variables
 * **Example:** Scope Secrets and Variables to the Environment
 * ```typescript
 * const env = yield* GitHub.Environment("production", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   name: "production",
 * });
 *
 * yield* GitHub.Secret("deploy-key", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   environment: env,
 *   name: "DEPLOY_KEY",
 *   value: Redacted.make("my-secret-value"),
 * });
 *
 * yield* GitHub.Variable("region", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   environment: env,
 *   name: "AWS_REGION",
 *   value: "us-east-1",
 * });
 * ```
 *
 * @resource
 */
export declare const Environment: import("../Resource.ts").ResourceClass<Environment>;
export declare const resolveEnvironmentName: (environment: string | Environment | undefined) => string | undefined;
export declare const EnvironmentProvider: () => import("effect/Layer").Layer<Provider.Provider<Environment>, never, GitHub.GitHubCredentials>;
//# sourceMappingURL=Environment.d.ts.map