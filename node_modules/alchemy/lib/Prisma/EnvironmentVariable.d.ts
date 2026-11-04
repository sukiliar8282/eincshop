import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Project } from "./Project.ts";
import type { Providers } from "./Providers.ts";
export interface EnvironmentVariableProps {
    /**
     * Project ID or `project.projectId` output that owns this variable.
     */
    project: string | Project;
    /**
     * Preview branch ID for a branch override. Omit for project-level templates.
     */
    branchId?: string;
    /**
     * Environment variable class.
     */
    class: "production" | "preview";
    /**
     * Environment variable key.
     */
    key: string;
    /**
     * Secret value. Must be wrapped with `Redacted.make(...)` so the engine
     * redacts it before resource props are persisted to state.
     */
    value: Redacted.Redacted<string>;
}
export interface EnvironmentVariable extends Resource<"Prisma.EnvironmentVariable", EnvironmentVariableProps, {
    /**
     * Prisma environment variable ID.
     */
    environmentVariableId: string;
    /**
     * Project ID that owns the variable.
     */
    projectId: string;
    /**
     * Branch ID for branch overrides, or null for project templates.
     */
    branchId: string | null;
    /**
     * Environment variable class.
     */
    class: "production" | "preview";
    /**
     * Environment variable key.
     */
    key: string;
    /**
     * Secret value, redacted in state.
     */
    value: Redacted.Redacted<string>;
    /**
     * Key identifier for the encrypted stored value.
     */
    valueKid: string;
    /**
     * Whether Prisma manages this variable internally.
     */
    isManagedBySystem: boolean;
    /**
     * ISO timestamp when the variable was created.
     */
    createdAt: string;
    /**
     * ISO timestamp when the variable was last updated.
     */
    updatedAt: string;
}, never, Providers> {
}
/**
 * A Prisma compute environment variable.
 *
 * Values are write-only in Prisma. Alchemy stores them as `Redacted` values
 * and reapplies the desired value to repair drift.
 *
 * ### Creating a Variable
 * **Example:** Project-level production variable
 * ```typescript
 * yield* Prisma.EnvironmentVariable("api-url", {
 *   project: project.projectId,
 *   // No branchId: this is a project-level template.
 *   class: "production",
 *   key: "API_URL",
 *   value: Redacted.make("https://api.example.com"),
 * });
 * ```
 *
 * **Example:** Preview branch override
 * ```typescript
 * yield* Prisma.EnvironmentVariable("preview-api-url", {
 *   project,
 *   branchId: preview.branchId,
 *   // Branch overrides always use the preview class.
 *   class: "preview",
 *   key: "API_URL",
 *   value: Redacted.make("https://preview.example.com"),
 * });
 * ```
 *
 * @resource
 */
export declare const EnvironmentVariable: import("../Resource.ts").ResourceClass<EnvironmentVariable>;
export declare const EnvironmentVariableProvider: () => import("effect/Layer").Layer<Provider.Provider<EnvironmentVariable>, never, any>;
//# sourceMappingURL=EnvironmentVariable.d.ts.map