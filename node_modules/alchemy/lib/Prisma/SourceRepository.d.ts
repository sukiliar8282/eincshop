import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Project } from "./Project.ts";
import type { Providers } from "./Providers.ts";
export interface SourceRepositoryProps {
    /**
     * Project ID or project output to link. Linking has Management API side
     * effects: it creates/renames the default branch and attaches currently
     * unassigned databases and apps. To order downstream resources
     * after those effects, pass this resource's `projectId` output to them.
     * Deleting this resource only disconnects the repository link; Prisma
     * preserves branches and resources that were attached while linking.
     */
    project: string | Project;
    /**
     * Git provider.
     *
     * @default "github"
     */
    provider?: "github";
    /**
     * GitHub's permanent numeric repository ID, not `owner/repo`, a Prisma
     * project ID, or an SCM installation ID. Retrieve it with:
     *
     * ```bash
     * gh api repos/OWNER/REPO --jq '.id'
     * ```
     */
    providerRepositoryId: number;
    /**
     * Optional SCM installation ID to use for linking. When omitted, Prisma
     * auto-picks the workspace's installation.
     */
    installationId?: string;
}
export interface SourceRepository extends Resource<"Prisma.SourceRepository", SourceRepositoryProps, {
    /**
     * Prisma source repository link ID.
     */
    sourceRepositoryId: string;
    /**
     * Project ID linked to the repository.
     */
    projectId: string;
    /**
     * Numeric provider repository ID.
     */
    repoId: number;
    /**
     * Source control provider.
     */
    provider: "github";
    /**
     * Full repository name, for example "owner/repo".
     */
    repoFullName: string;
    /**
     * Default repository branch.
     */
    defaultBranch: string;
    /**
     * Whether the repository is private.
     */
    isPrivate: boolean;
    /**
     * Link status.
     */
    status: "active" | "archived";
    /**
     * SCM installation ID used for the link.
     */
    installationId: string;
    /**
     * ISO timestamp when the link was created.
     */
    createdAt: string;
    /**
     * ISO timestamp when the link was last updated.
     */
    updatedAt: string;
}, never, Providers> {
}
/**
 * A linked source repository for Prisma apps.
 *
 * GitHub is currently the only supported provider. Linking requires an
 * existing Prisma SCM installation. `providerRepositoryId` is GitHub's
 * permanent numeric repository ID; retrieve it with
 * `gh api repos/OWNER/REPO --jq '.id'`. When `installationId` is omitted,
 * Prisma selects the workspace installation.
 *
 * Linking creates or renames the repository-owned default branch. Observe
 * that branch through the Management API; do not declare it again as a
 * separate `Prisma.Branch` resource. Use this resource's outputs to order
 * downstream databases and apps after the link side effects complete.
 * Deleting the link does not roll those side effects back: existing branches,
 * databases, and apps remain in the project.
 *
 * The project, repository ID, provider, and installation form an immutable
 * link identity. Alchemy refuses an automatic relink because unlinking cannot
 * roll back branch and resource attachments. Existing links require explicit
 * adoption.
 *
 * ### Finding the Repository ID
 * **Example:** Read the numeric GitHub repository ID
 * ```bash
 * gh api repos/OWNER/REPO --jq '.id'
 * ```
 *
 * ### Linking a Repository
 * **Example:** GitHub repository
 * ```typescript
 * const repo = yield* Prisma.SourceRepository("repo", {
 *   project: project.projectId,
 *   // Replace with the value returned by the GitHub command above.
 *   providerRepositoryId: 123456789,
 * });
 * const database = yield* Prisma.Database("database", {
 *   project: repo.projectId,
 *   branchGitName: repo.defaultBranch,
 * });
 * ```
 *
 * @resource
 */
export declare const SourceRepository: import("../Resource.ts").ResourceClass<SourceRepository>;
export declare const SourceRepositoryProvider: () => import("effect/Layer").Layer<Provider.Provider<SourceRepository>, never, any>;
//# sourceMappingURL=SourceRepository.d.ts.map