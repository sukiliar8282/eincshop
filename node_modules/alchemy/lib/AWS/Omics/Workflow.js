import * as omics from "@distilled.cloud/aws/omics";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { fetchOmicsTags, syncOmicsTags } from "./internal.js";
/**
 * Coerce a definition zip that survived engine plan/state serialization back
 * into a `Uint8Array`. The engine round-trips a `Uint8Array` prop as an
 * index-keyed plain object (`{"0":80,"1":75,...}`), so a provider that carries
 * binary members must rebuild the array before encoding the request.
 */
const coerceBytes = (value) => {
    if (value === undefined)
        return undefined;
    if (value instanceof Uint8Array)
        return value;
    if (Array.isArray(value))
        return Uint8Array.from(value);
    if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value)
            .map(([k, v]) => [Number(k), v])
            .sort((a, b) => a[0] - b[0]);
        return Uint8Array.from(entries.map(([, v]) => v));
    }
    return undefined;
};
/**
 * An Amazon HealthOmics private workflow — a bioinformatics workflow (WDL,
 * Nextflow, or CWL) that is executed as one or more runs.
 *
 * A workflow name is auto-generated from the app, stage, and logical ID
 * unless you provide one. The workflow definition (`engine`, `definitionZip`,
 * `definitionUri`, `main`, `parameterTemplate`, `accelerators`) is immutable —
 * changing any of it replaces the workflow. `name`, `description`,
 * `storageCapacity`, and `storageType` are updated in place.
 * ### Creating a Workflow
 * **Example:** Workflow from an inline definition zip
 * ```typescript
 * import * as Omics from "alchemy/AWS/Omics";
 *
 * const workflow = yield* Omics.Workflow("Hello", {
 *   engine: "WDL",
 *   main: "main.wdl",
 *   definitionZip: myZipBytes,
 * });
 * ```
 *
 * **Example:** Workflow from an S3-hosted definition
 * ```typescript
 * const workflow = yield* Omics.Workflow("Hello", {
 *   engine: "NEXTFLOW",
 *   definitionUri: "s3://my-bucket/workflows/hello.zip",
 * });
 * ```
 *
 * @resource
 */
export const Workflow = Resource("AWS.Omics.Workflow");
export const WorkflowProvider = () => Provider.effect(Workflow, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 96 }));
    });
    // A freshly created workflow is CREATING until its definition is
    // validated; wait until it reaches a terminal state before returning so
    // downstream runs (and deletes) don't race the async provisioning.
    const waitUntilReady = Effect.fn(function* (workflowId) {
        const final = yield* omics.getWorkflow({ id: workflowId }).pipe(Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(11),
            ]),
            until: (w) => w.status === "ACTIVE" || w.status === "FAILED",
        }));
        if (final.status === "FAILED") {
            return yield* Effect.fail(new omics.ValidationException({
                message: `Workflow ${workflowId} failed: ${final.statusMessage ?? "unknown"}`,
            }));
        }
        return final;
    });
    return Workflow.Provider.of({
        stables: ["workflowId", "workflowArn"],
        list: () => omics.listWorkflows.items({}).pipe(Stream.map((item) => ({
            workflowId: item.id,
            workflowArn: item.arn,
            name: item.name ?? "",
            status: item.status ?? "",
        })), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
        read: Effect.fn(function* ({ id, output }) {
            if (output?.workflowId === undefined)
                return undefined;
            const found = yield* omics
                .getWorkflow({ id: output.workflowId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (found === undefined || found.id === undefined)
                return undefined;
            const attrs = {
                workflowId: found.id,
                workflowArn: found.arn,
                name: found.name ?? "",
                status: found.status ?? "",
            };
            const tags = yield* fetchOmicsTags(found.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            const prev = olds ?? {};
            if ((prev.engine ?? "WDL") !== (news.engine ?? "WDL") ||
                (prev.definitionUri ?? "") !== (news.definitionUri ?? "") ||
                (prev.main ?? "") !== (news.main ?? "") ||
                (prev.accelerators ?? "") !== (news.accelerators ?? "")) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            let workflow = output?.workflowId === undefined
                ? undefined
                : yield* omics
                    .getWorkflow({ id: output.workflowId })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (workflow === undefined || workflow.id === undefined) {
                const created = yield* omics.createWorkflow({
                    name,
                    description: news.description,
                    engine: news.engine ?? "WDL",
                    definitionZip: coerceBytes(news.definitionZip),
                    definitionUri: news.definitionUri,
                    main: news.main,
                    parameterTemplate: news.parameterTemplate,
                    storageCapacity: news.storageCapacity,
                    storageType: news.storageType,
                    accelerators: news.accelerators,
                    requestId: `alchemy-${id}`,
                    tags: desiredTags,
                });
                yield* waitUntilReady(created.id);
                workflow = yield* omics.getWorkflow({ id: created.id });
            }
            else {
                const patch = {};
                if (news.name !== undefined && news.name !== workflow.name) {
                    patch.name = news.name;
                }
                if (news.description !== undefined &&
                    news.description !== workflow.description) {
                    patch.description = news.description;
                }
                if (news.storageType !== undefined &&
                    news.storageType !== workflow.storageType) {
                    patch.storageType = news.storageType;
                }
                if (news.storageCapacity !== undefined &&
                    news.storageCapacity !== workflow.storageCapacity) {
                    patch.storageCapacity = news.storageCapacity;
                }
                if (Object.keys(patch).length > 0) {
                    yield* omics.updateWorkflow({ id: workflow.id, ...patch });
                    workflow = yield* omics.getWorkflow({ id: workflow.id });
                }
            }
            yield* syncOmicsTags(workflow.arn, desiredTags);
            yield* session.note(workflow.id);
            return {
                workflowId: workflow.id,
                workflowArn: workflow.arn,
                name: workflow.name ?? name,
                status: workflow.status ?? "",
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* omics
                .deleteWorkflow({ id: output.workflowId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Workflow.js.map