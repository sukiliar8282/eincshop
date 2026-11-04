import * as datazone from "@distilled.cloud/aws/datazone";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { unredact } from "./internal.js";
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
export const Project = Resource("AWS.DataZone.Project");
/** Project status values indicating an in-flight transition to wait out. */
const PROJECT_TRANSIENT = new Set(["DELETING", "MOVING", "UPDATING"]);
/**
 * A freshly created domain propagates the creator's user profile eventually;
 * `createProject` can transiently reject with `AccessDeniedException` right
 * after domain creation. Wrapped in an explicitly-typed helper so the
 * `Effect.retry` conditional return type does not leak into declaration emit
 * (see PATTERNS §7).
 */
const retryWhileUserProfilePropagates = (self) => Effect.retry(self, {
    while: (e) => e._tag === "AccessDeniedException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
export const ProjectProvider = () => Provider.effect(Project, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    // A deleted project — or a project inside a deleted domain — is
    // reported as AccessDeniedException, NOT ResourceNotFoundException:
    // DataZone evaluates domain-scoped authorization before existence.
    // Both mean "absent".
    const getProjectOrUndefined = Effect.fn(function* (domainId, projectId) {
        return yield* datazone
            .getProject({ domainIdentifier: domainId, identifier: projectId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)));
    });
    const findByName = Effect.fn(function* (domainId, name) {
        const found = yield* datazone
            .listProjects({ domainIdentifier: domainId, name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)));
        const summary = (found?.items ?? []).find((s) => unredact(s.name) === name && s.projectStatus !== "DELETING");
        return summary?.id;
    });
    // Poll the project to a settled (non-transient) status — project
    // operations settle within seconds.
    const waitForSettled = Effect.fn(function* (domainId, projectId) {
        return yield* getProjectOrUndefined(domainId, projectId).pipe(Effect.repeat({
            schedule: Schedule.fixed("3 seconds"),
            until: (project) => project === undefined ||
                project.projectStatus === undefined ||
                !PROJECT_TRANSIENT.has(project.projectStatus),
            times: 20,
        }));
    });
    // Poll the project until it no longer exists — deletion is async but
    // settles within seconds for empty projects.
    const waitForGone = Effect.fn(function* (domainId, projectId) {
        yield* getProjectOrUndefined(domainId, projectId).pipe(Effect.repeat({
            schedule: Schedule.fixed("3 seconds"),
            until: (project) => project === undefined,
            times: 20,
        }));
    });
    const toAttributes = (project) => ({
        projectId: project.id,
        domainId: project.domainId,
        name: unredact(project.name),
        projectStatus: project.projectStatus,
        domainUnitId: project.domainUnitId,
        createdBy: project.createdBy,
    });
    return Project.Provider.of({
        stables: ["projectId", "domainId", "createdBy"],
        // Projects are keyed by their parent domain — there is no
        // account-level enumeration without a domain identifier.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const domainId = output?.domainId ?? olds?.domainId;
            if (domainId === undefined)
                return undefined;
            const projectId = output?.projectId ??
                (yield* findByName(domainId, yield* createName(id, olds ?? { domainId })));
            if (projectId === undefined)
                return undefined;
            const project = yield* getProjectOrUndefined(domainId, projectId);
            if (project === undefined || project.projectStatus === "DELETING") {
                return undefined;
            }
            // Projects have no tags — ownership is tracked purely by identity.
            return toAttributes(project);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds !== undefined && olds.domainId !== news.domainId) {
                return { action: "replace" };
            }
            // name, description, and glossaryTerms converge via updateProject.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const domainId = news.domainId;
            const name = yield* createName(id, news);
            // 1. OBSERVE — cloud state is authoritative; output is only an id
            //    cache. Fall back to a name lookup after state loss.
            let project = output?.projectId
                ? yield* getProjectOrUndefined(domainId, output.projectId)
                : undefined;
            if (project === undefined) {
                const foundId = yield* findByName(domainId, name);
                if (foundId !== undefined) {
                    project = yield* getProjectOrUndefined(domainId, foundId);
                }
            }
            if (project === undefined) {
                // 2. ENSURE — create (retrying the user-profile propagation
                //    window right after domain creation).
                project = yield* retryWhileUserProfilePropagates(datazone.createProject({
                    domainIdentifier: domainId,
                    name,
                    description: news.description,
                    glossaryTerms: news.glossaryTerms,
                }));
                project = (yield* waitForSettled(domainId, project.id)) ?? project;
            }
            else {
                // 3. SYNC — wait out any in-flight transition, then converge the
                //    mutable aspects by diffing OBSERVED state against desired.
                project = (yield* waitForSettled(domainId, project.id)) ?? project;
                const observedTerms = project.glossaryTerms ?? [];
                const desiredTerms = news.glossaryTerms ?? [];
                const drifted = unredact(project.name) !== name ||
                    (project.description === undefined
                        ? undefined
                        : unredact(project.description)) !==
                        (news.description ?? undefined) ||
                    observedTerms.length !== desiredTerms.length ||
                    desiredTerms.some((t) => !observedTerms.includes(t));
                if (drifted) {
                    yield* datazone.updateProject({
                        domainIdentifier: domainId,
                        identifier: project.id,
                        name,
                        description: news.description,
                        glossaryTerms: news.glossaryTerms,
                    });
                    project =
                        (yield* getProjectOrUndefined(domainId, project.id)) ?? project;
                }
            }
            yield* session.note(project.id);
            return toAttributes(project);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* datazone
                .deleteProject({
                domainIdentifier: output.domainId,
                identifier: output.projectId,
                skipDeletionCheck: true,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // deleting a project whose domain is already gone surfaces as
            // AccessDenied — auth is checked before existence.
            Effect.catchTag("AccessDeniedException", () => Effect.void));
            yield* waitForGone(output.domainId, output.projectId);
        }),
    });
}));
//# sourceMappingURL=Project.js.map