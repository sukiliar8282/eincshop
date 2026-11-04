import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Project } from "./Project.ts";
import type { Providers } from "./Providers.ts";
export interface BranchProps {
    /**
     * Project ID or `project.projectId` output that owns this branch.
     */
    project: string | Project;
    /**
     * Git-style branch name. If omitted, Alchemy generates a stable physical
     * name.
     */
    gitName?: string;
    /**
     * Promote this branch to be the project's default branch. Setting this to
     * `false` does not demote a current default because the Management API only
     * supports promotion; promoting another branch atomically demotes it.
     * Promotion changes `isDefault`, not the branch's immutable `preview` role.
     *
     * @default false
     */
    isDefault?: boolean;
}
export interface Branch extends Resource<"Prisma.Branch", BranchProps, {
    /**
     * Prisma branch ID.
     */
    branchId: string;
    /**
     * Git-style branch name.
     */
    gitName: string;
    /**
     * Project ID that owns the branch.
     */
    projectId: string;
    /**
     * Whether this branch is the project's default branch.
     */
    isDefault: boolean;
    /**
     * Branch that was default before this preview branch was promoted. Alchemy
     * restores it before deleting this resource so destroy remains reversible.
     */
    previousDefaultBranchId?: string;
    /**
     * Branch role used by Prisma to resolve deploy-time environment variables.
     */
    role: "production" | "preview";
    /**
     * ISO timestamp when the branch was created.
     */
    createdAt: string;
    /**
     * ISO timestamp when the branch was last updated.
     */
    updatedAt: string;
}, never, Providers> {
}
/**
 * A Prisma project branch for preview-class databases and compute resources.
 *
 * Standalone Branch resources always have the `preview` role. Promotion
 * changes only the default branch; Alchemy restores the previous default
 * before deleting a promoted branch.
 *
 * ### Creating a Branch
 * **Example:** Preview branch
 * ```typescript
 * const branch = yield* Prisma.Branch("preview", {
 *   project: project.projectId,
 *   gitName: "feature/search", // optional — omitted, a stable name is generated
 * });
 *
 * branch.role;      // "preview"
 * branch.isDefault; // false
 * ```
 *
 * ### Promoting a Branch
 * **Example:** Make a preview branch the default
 * ```typescript
 * const release = yield* Prisma.Branch("release", {
 *   project,
 *   gitName: "release/next",
 *   isDefault: true,
 * });
 *
 * release.role;      // still "preview"
 * release.isDefault; // true
 * ```
 *
 * @resource
 */
export declare const Branch: import("../Resource.ts").ResourceClass<Branch>;
export declare const BranchProvider: () => import("effect/Layer").Layer<Provider.Provider<Branch>, never, any>;
//# sourceMappingURL=Branch.d.ts.map