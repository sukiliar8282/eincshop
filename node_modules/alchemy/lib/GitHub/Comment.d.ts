import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import * as GitHub from "./Providers.ts";
export interface CommentProps {
    /**
     * Repository owner (user or organization).
     */
    owner: string;
    /**
     * Repository name.
     */
    repository: string;
    /**
     * Issue or Pull Request number to comment on.
     */
    issueNumber: number;
    /**
     * Comment body (supports GitHub Markdown).
     *
     * The body is automatically dedented, so you can use indented template
     * literals without worrying about leading whitespace. Accepts
     * `Output<string>` at the call site via `Output.interpolate` to embed
     * resource attributes that are not yet resolved.
     */
    body: string;
    /**
     * Whether to allow deletion of the comment when the resource is destroyed.
     * By default, comments are never deleted to preserve discussion history.
     * @default false
     */
    allowDelete?: boolean;
    /**
     * Override the GitHub host or API base URL for this resource only (e.g.
     * `github.example.com` for GitHub Enterprise). Falls back to
     * `GitHub.providers({ baseUrl })`, then to the host resolved by the auth
     * provider. Changing it replaces the resource — the same name on a
     * different GitHub instance is a different physical resource.
     */
    baseUrl?: string;
}
export interface Comment extends Resource<"GitHub.Comment", CommentProps, {
    /**
     * The numeric ID of the comment in GitHub.
     */
    commentId: number;
    /**
     * URL to view the comment in a browser.
     */
    htmlUrl: string;
    /**
     * ISO-8601 timestamp of the last update.
     */
    updatedAt: string;
}, never, GitHub.Providers> {
}
/**
 * A GitHub issue or pull request comment.
 *
 * `Comment` manages the lifecycle of a single comment on an issue or pull
 * request. Comments are created on the first deploy and updated in place on
 * subsequent deploys when the `body` changes. By default, comments are never
 * deleted to preserve discussion history — set `allowDelete: true` to opt in.
 *
 * Authentication is resolved in order: explicit `token` prop,
 * `GITHUB_ACCESS_TOKEN` env var, `GITHUB_TOKEN` env var. The token needs
 * `repo` scope for private repositories or `public_repo` for public ones.
 * ### Creating Comments
 * **Example:** Comment on an Issue
 * ```typescript
 * const comment = yield* GitHub.Comment("issue-comment", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   issueNumber: 123,
 *   body: "This is a comment created by Alchemy!",
 * });
 * ```
 *
 * **Example:** Comment on a Pull Request
 * ```typescript
 * const prComment = yield* GitHub.Comment("pr-comment", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   issueNumber: 456,
 *   body: "## Deployment Status\n\nSuccessfully deployed to staging!",
 * });
 * ```
 *
 * ### Updating Comments
 * Deploy with the same logical ID and a different `body` to update the
 * existing comment in place rather than creating a new one.
 *
 * **Example:** Update Comment Content
 * ```typescript
 * const comment = yield* GitHub.Comment("status-comment", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   issueNumber: 789,
 *   body: "Deployment completed successfully!",
 * });
 * ```
 *
 * ### Deleting Comments
 * **Example:** Allow Comment Deletion
 * ```typescript
 * const comment = yield* GitHub.Comment("temp-comment", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   issueNumber: 123,
 *   body: "This comment can be deleted",
 *   allowDelete: true,
 * });
 * ```
 *
 * ### CI Preview Comments
 * A common pattern is posting a preview-deployment URL on every pull request.
 * The comment auto-updates on each push because the logical ID stays the same.
 *
 * **Example:** PR Preview Comment
 * ```typescript
 * if (process.env.PULL_REQUEST) {
 *   yield* GitHub.Comment("preview-comment", {
 *     owner: "my-org",
 *     repository: "my-repo",
 *     issueNumber: Number(process.env.PULL_REQUEST),
 *     body: Output.interpolate`
 *       ## Preview Deployed
 *
 *       **URL:** ${website.url}
 *     `,
 *   });
 * }
 * ```
 *
 * @resource
 */
export declare const Comment: import("../Resource.ts").ResourceClass<Comment>;
export declare const CommentProvider: () => import("effect/Layer").Layer<Provider.Provider<Comment>, never, GitHub.GitHubCredentials>;
//# sourceMappingURL=Comment.d.ts.map