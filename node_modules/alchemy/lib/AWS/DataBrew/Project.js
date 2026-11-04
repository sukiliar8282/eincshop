import * as databrew from "@distilled.cloud/aws/databrew";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { cleanMap, databrewArn, fetchObservedTags, retryWhileConflict, retryWhileRoleNotAssumable, syncTags, } from "./internal.js";
/**
 * An AWS Glue DataBrew project — the interactive workspace binding a dataset
 * to a recipe's working version. The project definition is free; costs only
 * accrue when an interactive session is started in the console.
 * ### Creating Projects
 * **Example:** Dataset + Recipe Project
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const project = yield* AWS.DataBrew.Project("Explore", {
 *   datasetName: dataset.datasetName,
 *   recipeName: recipe.recipeName,
 *   role: role.roleArn,
 * });
 * ```
 *
 * **Example:** Custom Sample
 * ```typescript
 * const project = yield* AWS.DataBrew.Project("Explore", {
 *   datasetName: dataset.datasetName,
 *   recipeName: recipe.recipeName,
 *   sample: { type: "RANDOM", size: 250 },
 *   role: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export const Project = Resource("AWS.DataBrew.Project");
const buildSample = (sample) => sample ? { Size: sample.size, Type: sample.type } : undefined;
export const ProjectProvider = () => Provider.effect(Project, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.projectName ??
            (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    const observe = Effect.fn(function* (name) {
        return yield* databrew
            .describeProject({ Name: name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return Project.Provider.of({
        stables: ["projectName", "projectArn"],
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const pages = yield* databrew.listProjects
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.Projects ?? [])
                .map((p) => ({
                projectName: p.Name,
                projectArn: p.ResourceArn ??
                    databrewArn(region, accountId, "project", p.Name),
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.projectName ?? (yield* createName(id, olds ?? {}));
            const project = yield* observe(name);
            if (project === undefined)
                return undefined;
            const arn = project.ResourceArn ??
                databrewArn(region, accountId, "project", name);
            const attrs = { projectName: name, projectArn: arn };
            const tags = cleanMap(project.Tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            // UpdateProject only accepts Sample + RoleArn — the dataset and
            // recipe associations are immutable.
            if (olds.datasetName !== news.datasetName) {
                return { action: "replace" };
            }
            if (olds.recipeName !== news.recipeName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.projectName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            const project = yield* observe(name);
            // 2. ENSURE / 3. SYNC (Sample + RoleArn are the mutable aspects)
            if (project === undefined) {
                yield* retryWhileRoleNotAssumable(databrew.createProject({
                    Name: name,
                    DatasetName: news.datasetName,
                    RecipeName: news.recipeName,
                    Sample: buildSample(news.sample),
                    RoleArn: news.role,
                    Tags: desiredTags,
                })).pipe(Effect.catchTag("ConflictException", () => Effect.void));
            }
            else {
                yield* retryWhileRoleNotAssumable(databrew.updateProject({
                    Name: name,
                    Sample: buildSample(news.sample),
                    RoleArn: news.role,
                }));
            }
            const arn = project?.ResourceArn ??
                databrewArn(region, accountId, "project", name);
            // 3b. SYNC TAGS against observed cloud tags
            const observedTags = yield* fetchObservedTags(arn);
            yield* syncTags(arn, observedTags, desiredTags);
            yield* session.note(name);
            return { projectName: name, projectArn: arn };
        }),
        delete: Effect.fn(function* ({ output }) {
            // ConflictException while an interactive session is winding down.
            yield* retryWhileConflict(databrew.deleteProject({ Name: output.projectName })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        }),
    });
}));
//# sourceMappingURL=Project.js.map