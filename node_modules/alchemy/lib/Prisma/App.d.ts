import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Project } from "./Project.ts";
import type { Providers } from "./Providers.ts";
import type { PrismaRegionId } from "./Types.ts";
export interface AppProps {
    /**
     * Project ID or `project.projectId` output that owns this App.
     */
    project: string | Project;
    /**
     * App display name. If omitted, Alchemy generates a stable physical name.
     */
    displayName?: string;
    /**
     * Region where the App is placed.
     *
     * @default The project's default region, falling back to "us-east-1"
     */
    regionId?: PrismaRegionId;
    /**
     * Branch ID to attach the App to. Mutually exclusive with branchGitName.
     */
    branchId?: string;
    /**
     * Branch git name to attach the App to. Mutually exclusive with branchId.
     */
    branchGitName?: string;
}
export interface App extends Resource<"Prisma.App", AppProps, {
    /**
     * Prisma App ID.
     */
    appId: string;
    /**
     * App display name.
     */
    name: string;
    /**
     * Project ID that owns the App.
     */
    projectId: string;
    /**
     * Region ID where the App is placed.
     */
    regionId: string;
    /**
     * Branch ID attached to the App, or null when unassigned.
     */
    branchId: string | null;
    /**
     * Latest promoted deployment ID, when available.
     */
    latestDeploymentId: string | null;
    /**
     * Stable App endpoint domain.
     */
    appEndpointDomain: string;
    /**
     * ISO timestamp when the App was created.
     */
    createdAt: string;
}, never, Providers> {
}
/**
 * A Prisma App, the long-lived application configuration that owns deployments.
 *
 * Omit `branchId` and `branchGitName` to attach the App to the project's
 * current default branch. App regions are immutable; create a second App and
 * cut traffic over when moving regions. Use `Prisma.Compute` for the usual
 * build, deployment, health-check, and promotion workflow; use `App` directly
 * when managing standalone `Prisma.Deployment` resources.
 *
 * ### Creating an App
 * **Example:** App on the default branch
 * ```typescript
 * const app = yield* Prisma.App("web", {
 *   project,
 * });
 * ```
 *
 * **Example:** App on a preview branch
 * ```typescript
 * const app = yield* Prisma.App("preview-web", {
 *   project,
 *   branchId: preview.branchId,
 * });
 * ```
 *
 * @resource
 */
export declare const App: import("../Resource.ts").ResourceClass<App>;
export declare const AppProvider: () => import("effect/Layer").Layer<Provider.Provider<App>, never, any>;
//# sourceMappingURL=App.d.ts.map