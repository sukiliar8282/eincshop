import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { retryRolePropagation, syncEntityResolutionTags, toTagRecord, } from "./internal.js";
/**
 * An AWS Entity Resolution ID mapping workflow — a data-processing job
 * definition that translates record identifiers between a `SOURCE` and a
 * `TARGET` ID namespace, using rule-based matching or a provider service.
 *
 * The workflow definition itself is cheap and instant; a mapping RUN
 * (`StartIdMappingJob`) processes the full input and takes many minutes.
 *
 * ### Creating ID Mapping Workflows
 * **Example:** Rule-based ID mapping between two namespaces
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const workflow = yield* AWS.EntityResolution.IdMappingWorkflow("Map", {
 *   inputSourceConfig: [
 *     { inputSourceARN: source.idNamespaceArn, type: "SOURCE" },
 *     { inputSourceARN: target.idNamespaceArn, type: "TARGET" },
 *   ],
 *   idMappingTechniques: {
 *     idMappingType: "RULE_BASED",
 *     ruleBasedProperties: {
 *       ruleDefinitionType: "TARGET",
 *       attributeMatchingModel: "ONE_TO_ONE",
 *       recordMatchingModel: "ONE_SOURCE_TO_ONE_TARGET",
 *     },
 *   },
 *   outputSourceConfig: [
 *     { outputS3Path: `s3://${bucket.bucketName}/idmapping/` },
 *   ],
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export const IdMappingWorkflow = Resource("AWS.EntityResolution.IdMappingWorkflow");
export const IdMappingWorkflowProvider = () => Provider.effect(IdMappingWorkflow, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.workflowName ??
            (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    /** Get an ID mapping workflow by name; typed not-found → undefined. */
    const getByName = Effect.fn(function* (workflowName) {
        return yield* entityresolution
            .getIdMappingWorkflow({ workflowName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["workflowName", "workflowArn"],
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.workflowName ?? (yield* createName(id, olds ?? {}));
            const workflow = yield* getByName(name);
            if (workflow === undefined)
                return undefined;
            const attrs = {
                workflowName: workflow.workflowName,
                workflowArn: workflow.workflowArn,
            };
            // getIdMappingWorkflow returns tags — use the observed tags for
            // the ownership check.
            const tags = toTagRecord(workflow.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.workflowName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. Observe — names are unique, so the name IS the identity.
            let workflow = yield* getByName(name);
            // 2. Ensure — create when missing. A freshly-created IAM role is
            //    transiently rejected while IAM propagates; tolerate the
            //    concurrent-create race, then re-observe: the create response
            //    is a structural subset of the Get shape (it omits
            //    createdAt/updatedAt/tags).
            if (workflow === undefined) {
                yield* entityresolution
                    .createIdMappingWorkflow({
                    workflowName: name,
                    description: news.description,
                    inputSourceConfig: news.inputSourceConfig,
                    outputSourceConfig: news.outputSourceConfig,
                    idMappingTechniques: news.idMappingTechniques,
                    incrementalRunConfig: news.incrementalRunConfig,
                    roleArn: news.roleArn,
                    tags: desiredTags,
                })
                    .pipe(retryRolePropagation, Effect.catchTag("ConflictException", () => Effect.void));
                workflow = yield* entityresolution.getIdMappingWorkflow({
                    workflowName: name,
                });
            }
            // 3. Sync — everything except the name updates in place via a
            //    full-PUT update. Only call the API on an actual delta between
            //    OBSERVED and desired configuration.
            const desired = {
                description: news.description ?? undefined,
                inputSourceConfig: news.inputSourceConfig,
                outputSourceConfig: news.outputSourceConfig ?? undefined,
                idMappingTechniques: news.idMappingTechniques,
                incrementalRunConfig: news.incrementalRunConfig ?? undefined,
                roleArn: news.roleArn ?? undefined,
            };
            const observed = {
                description: workflow.description ?? undefined,
                inputSourceConfig: workflow.inputSourceConfig,
                outputSourceConfig: workflow.outputSourceConfig ?? undefined,
                idMappingTechniques: workflow.idMappingTechniques,
                incrementalRunConfig: workflow.incrementalRunConfig ?? undefined,
                roleArn: workflow.roleArn ?? undefined,
            };
            if (!deepEqual(observed, desired)) {
                // The update response omits createdAt/updatedAt/tags; the ARN is
                // stable, so keep the observed Get shape.
                yield* entityresolution
                    .updateIdMappingWorkflow({
                    workflowName: name,
                    description: news.description,
                    inputSourceConfig: news.inputSourceConfig,
                    outputSourceConfig: news.outputSourceConfig,
                    idMappingTechniques: news.idMappingTechniques,
                    incrementalRunConfig: news.incrementalRunConfig,
                    roleArn: news.roleArn,
                })
                    .pipe(retryRolePropagation);
            }
            const workflowArn = workflow.workflowArn;
            // 3b. Sync tags against OBSERVED cloud tags (adoption-safe).
            yield* syncEntityResolutionTags(workflowArn, desiredTags);
            yield* session.note(workflowArn);
            return { workflowName: name, workflowArn };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteIdMappingWorkflow succeeds even when the workflow is
            // already gone; a running mapping job conflicts — retry briefly.
            yield* entityresolution
                .deleteIdMappingWorkflow({ workflowName: output.workflowName })
                .pipe(Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("2 seconds"),
                    Schedule.recurs(10),
                ]),
            }));
        }),
        list: () => entityresolution.listIdMappingWorkflows.items({}).pipe(Stream.map((summary) => ({
            workflowName: summary.workflowName,
            workflowArn: summary.workflowArn,
        })), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
    };
}));
//# sourceMappingURL=IdMappingWorkflow.js.map