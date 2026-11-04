import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
export interface ProjectProps {
    /**
     * The identifier of the {@link Domain} the project lives in. Accepts a
     * domain's `domainId` output. Changing it triggers a replacement.
     */
    domainId: string;
    /**
     * Name of the project. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. The name is mutable — it
     * converges via `UpdateProject` without replacement.
     */
    name?: string;
    /**
     * A description of the project.
     */
    description?: string;
    /**
     * Glossary term identifiers to attach to the project.
     */
    glossaryTerms?: string[];
}
export interface Project extends Resource<"AWS.DataZone.Project", ProjectProps, {
    /** The unique identifier of the project. */
    projectId: string;
    /** The identifier of the domain the project lives in. */
    domainId: string;
    /** The name of the project. */
    name: string;
    /** The status of the project (`ACTIVE` once settled). */
    projectStatus: string | undefined;
    /** The identifier of the domain unit the project belongs to. */
    domainUnitId: string | undefined;
    /** The DataZone user who created the project. */
    createdBy: string;
}> {
}
/**
 * An Amazon DataZone project — the collaboration space within a domain where
 * teams catalog, publish, and subscribe to data assets.
 *
 * The creating principal is automatically the project owner. DataZone
 * projects do not support resource tags, so ownership is tracked purely by
 * identity.
 *
 * ### Creating Projects
 * **Example:** Minimal Project
 * ```typescript
 * import * as DataZone from "alchemy/AWS/DataZone";
 *
 * const domain = yield* DataZone.Domain("governance", {});
 *
 * const project = yield* DataZone.Project("analytics", {
 *   domainId: domain.domainId,
 *   description: "Analytics team project",
 * });
 * ```
 *
 * **Example:** Project with an Explicit Name
 * ```typescript
 * const project = yield* DataZone.Project("analytics", {
 *   domainId: domain.domainId,
 *   name: "analytics-team",
 *   glossaryTerms: [term.id],
 * });
 * ```
 *
 * @resource
 */
export declare const Project: import("../../Resource.ts").ResourceClass<Project>;
export declare const ProjectProvider: () => import("effect/Layer").Layer<Provider.Provider<Project>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Project.d.ts.map