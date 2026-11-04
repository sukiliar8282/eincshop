import * as Config from "effect/Config";
export interface GitHubEnv {
    /** The commit SHA that triggered the workflow run. */
    readonly sha: string;
    /** The repository owner from `GITHUB_REPOSITORY_OWNER`. */
    readonly owner: string;
    /** The repository name parsed from `GITHUB_REPOSITORY`. */
    readonly repository: string;
    /** The pull request number exported by the Alchemy GitHub Action. */
    readonly pr: number | undefined;
}
/**
 * GitHub Actions metadata for conditional resources in `alchemy.run.ts`.
 *
 * Resolves to `undefined` outside GitHub Actions. In GitHub Actions, it reads
 * `GITHUB_SHA`, `GITHUB_REPOSITORY_OWNER`, `GITHUB_REPOSITORY`, and the optional
 * `PULL_REQUEST` variable exported by the Alchemy GitHub Action.
 */
export declare const GitHubEnv: Config.Config<GitHubEnv | undefined>;
//# sourceMappingURL=Env.d.ts.map