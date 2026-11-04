import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type * as GitHub from "./Providers.ts";
export interface RepositoryProps {
    /**
     * Repository owner — a user or organization login.
     *
     * Changing the owner replaces the repository: a NEW, EMPTY repository is
     * created under the new owner — history, issues, and pull requests are
     * not carried over. The old repository is retained on GitHub under the
     * default `retain` removal policy; it is only deleted when the resource
     * opted into deletion via `destroy()`. To actually move a repository
     * between owners with its history, transfer it in the GitHub UI/API
     * first, then update `owner` here and deploy with `--adopt`.
     */
    owner: string;
    /**
     * Repository name. Renaming (deploying with the same logical ID and a
     * different `name`) renames the existing repository in place rather than
     * replacing it.
     */
    name: string;
    /**
     * Short description shown on the repository page.
     */
    description?: string;
    /**
     * Homepage URL shown on the repository page.
     */
    homepage?: string;
    /**
     * Repository visibility. `internal` is only valid for repositories owned by
     * an organization on GitHub Enterprise. When omitted, GitHub's default
     * applies (`public`).
     * @default "public"
     */
    visibility?: "public" | "private" | "internal";
    /**
     * Whether the Issues tab is enabled.
     * @default true
     */
    hasIssues?: boolean;
    /**
     * Whether the Projects tab is enabled.
     * @default true
     */
    hasProjects?: boolean;
    /**
     * Whether the Wiki tab is enabled.
     * @default true
     */
    hasWiki?: boolean;
    /**
     * Whether GitHub Discussions are enabled.
     * @default false
     */
    hasDiscussions?: boolean;
    /**
     * Whether the repository is a template repository.
     * @default false
     */
    isTemplate?: boolean;
    /**
     * Whether the repository is archived (read-only).
     * @default false
     */
    archived?: boolean;
    /**
     * The default branch name. Only applied to repositories that already have
     * at least one branch — setting it on an empty repository has no effect.
     */
    defaultBranch?: string;
    /**
     * Whether squash merges are allowed.
     * @default true
     */
    allowSquashMerge?: boolean;
    /**
     * Whether merge commits are allowed.
     * @default true
     */
    allowMergeCommit?: boolean;
    /**
     * Whether rebase merges are allowed.
     * @default true
     */
    allowRebaseMerge?: boolean;
    /**
     * Whether auto-merge is enabled for pull requests.
     * @default false
     */
    allowAutoMerge?: boolean;
    /**
     * Whether head branches are automatically deleted after a pull request is
     * merged.
     * @default false
     */
    deleteBranchOnMerge?: boolean;
    /**
     * Repository topics. The provided list fully replaces the existing topics.
     */
    topics?: string[];
    /**
     * Initialize the repository with an empty README on creation. Only used at
     * create time — ignored on subsequent updates.
     * @default false
     */
    autoInit?: boolean;
    /**
     * Name of the `.gitignore` template to apply on creation (e.g. `"Node"`).
     * Only used at create time.
     */
    gitignoreTemplate?: string;
    /**
     * Keyword of the license template to apply on creation (e.g. `"mit"`).
     * Only used at create time.
     */
    licenseTemplate?: string;
    /**
     * Override the GitHub host or API base URL for this resource only (e.g.
     * `github.example.com` for GitHub Enterprise). Falls back to
     * `GitHub.providers({ baseUrl })`, then to the host resolved by the auth
     * provider. Changing it replaces the resource — the same name on a
     * different GitHub instance is a different physical resource.
     */
    baseUrl?: string;
}
export interface Repository extends Resource<"GitHub.Repository", RepositoryProps, {
    /**
     * Numeric GitHub repository ID.
     */
    repoId: number;
    /**
     * GraphQL node ID of the repository.
     */
    nodeId: string;
    /**
     * Full name in `owner/name` form.
     */
    fullName: string;
    /**
     * URL to view the repository in a browser.
     */
    htmlUrl: string;
    /**
     * Git protocol clone URL (`git://`).
     */
    gitUrl: string;
    /**
     * SSH clone URL (`git@github.com:owner/name.git`).
     */
    sshUrl: string;
    /**
     * HTTPS clone URL.
     */
    cloneUrl: string;
    /**
     * The resolved default branch name.
     */
    defaultBranch: string;
    /**
     * ISO-8601 timestamp of when the repository was created.
     */
    createdAt: string;
    /**
     * ISO-8601 timestamp of the last update.
     */
    updatedAt: string;
}, never, GitHub.Providers> {
}
/**
 * A GitHub repository.
 *
 * `Repository` manages the lifecycle of a repository owned by a user or
 * organization. The repository is created on first deploy and its settings are
 * converged on every subsequent deploy.
 *
 * Repositories default to **retain** on removal — destroying the stack does
 * NOT delete the repository on GitHub, protecting its irreplaceable history
 * (issues, pull requests, commits). Opt in to actual deletion by wrapping the
 * resource (or the whole stack) in {@link destroy}() from
 * `alchemy/RemovalPolicy`.
 *
 * Authentication is resolved via the `GitHubCredentials` service supplied by
 * `GitHub.providers()` (env, stored PAT, `gh` CLI, or OAuth). The token needs
 * `repo` scope (and `delete_repo` when deletion is opted in via `destroy()`).
 * ### Creating a Repository
 * **Example:** Basic Repository
 * ```typescript
 * const repo = yield* GitHub.Repository("api", {
 *   owner: "my-org",
 *   name: "api",
 *   description: "API service",
 *   autoInit: true,
 * });
 * ```
 *
 * **Example:** Private Repository with Settings
 * ```typescript
 * const repo = yield* GitHub.Repository("internal-tools", {
 *   owner: "my-org",
 *   name: "internal-tools",
 *   visibility: "private",
 *   hasWiki: false,
 *   hasProjects: false,
 *   deleteBranchOnMerge: true,
 * });
 * ```
 *
 * **Example:** Initialize from Templates
 * The `autoInit`, `gitignoreTemplate`, and `licenseTemplate` props seed the
 * first commit. They are only honored at create time — changing them on a
 * later deploy has no effect on an existing repository.
 * ```typescript
 * const repo = yield* GitHub.Repository("service", {
 *   owner: "my-org",
 *   name: "service",
 *   autoInit: true,
 *   gitignoreTemplate: "Node",
 *   licenseTemplate: "mit",
 * });
 * ```
 *
 * ### Topics and Merge Configuration
 * **Example:** Repository with Topics and Merge Policy
 * ```typescript
 * const repo = yield* GitHub.Repository("sdk", {
 *   owner: "my-org",
 *   name: "sdk",
 *   topics: ["typescript", "effect", "sdk"],
 *   allowMergeCommit: false,
 *   allowRebaseMerge: false,
 *   allowSquashMerge: true,
 *   allowAutoMerge: true,
 * });
 * ```
 *
 * ### Renaming a Repository
 * **Example:** Rename in Place
 * Keep the same logical ID and change `name` to rename the live repository
 * instead of replacing it — the repository's history, issues, and pull
 * requests are preserved. Only changing `owner` triggers a replacement.
 * ```typescript
 * // First deploy creates "api".
 * const repo = yield* GitHub.Repository("api", {
 *   owner: "my-org",
 *   name: "api",
 * });
 *
 * // A later deploy with the SAME logical ID ("api") renames it to "gateway".
 * const repo = yield* GitHub.Repository("api", {
 *   owner: "my-org",
 *   name: "gateway",
 * });
 * ```
 *
 * ### Archiving a Repository
 * **Example:** Make a Repository Read-Only
 * Archiving sets the repository to read-only. Set `archived` back to `false`
 * on a later deploy to un-archive it.
 * ```typescript
 * yield* GitHub.Repository("legacy", {
 *   owner: "my-org",
 *   name: "legacy-service",
 *   archived: true,
 * });
 * ```
 *
 * ### Wiring with Other Resources
 * The repository's outputs can drive other GitHub resources so the whole
 * repository configuration lives in one program.
 *
 * **Example:** Seed a Variable into the Repository
 * ```typescript
 * const repo = yield* GitHub.Repository("api", {
 *   owner: "my-org",
 *   name: "api",
 *   autoInit: true,
 * });
 *
 * yield* GitHub.Variable("region", {
 *   owner: "my-org",
 *   repository: repo.name!,
 *   name: "AWS_REGION",
 *   value: "us-east-1",
 * });
 * ```
 *
 * **Example:** Store a Secret in the Repository
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 *
 * const repo = yield* GitHub.Repository("api", {
 *   owner: "my-org",
 *   name: "api",
 *   autoInit: true,
 * });
 *
 * yield* GitHub.Secret("deploy-token", {
 *   owner: "my-org",
 *   repository: repo.name!,
 *   name: "DEPLOY_TOKEN",
 *   value: Redacted.make("my-secret-value"),
 * });
 * ```
 *
 * ### Deleting a Repository
 * **Example:** Allow Repository Deletion
 * ```typescript
 * import { destroy } from "alchemy/RemovalPolicy";
 *
 * yield* GitHub.Repository("ephemeral", {
 *   owner: "my-org",
 *   name: "ephemeral-preview",
 * }).pipe(destroy());
 * ```
 *
 * @resource
 */
export declare const Repository: import("../Resource.ts").ResourceClass<Repository>;
export declare const RepositoryProvider: () => import("effect/Layer").Layer<Provider.Provider<Repository>, never, GitHub.GitHubCredentials>;
//# sourceMappingURL=Repository.d.ts.map