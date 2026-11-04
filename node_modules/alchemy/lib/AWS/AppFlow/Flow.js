import * as appflow from "@distilled.cloud/aws/appflow";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readAppFlowTags, syncAppFlowTags } from "./internal.js";
/**
 * An Amazon AppFlow flow. A flow transfers data between a source connector
 * and one or more destination connectors, applying field-mapping tasks.
 * The credential-free S3-to-S3 path is directly testable; other connectors
 * require a {@link ConnectorProfile} with vendor credentials.
 *
 * For an S3 source, the bucket policy must authorize the
 * `appflow.amazonaws.com` service principal (`s3:GetObject` + `s3:ListBucket`
 * on the source; `s3:PutObject` and the multipart/ACL actions on the
 * destination), and the source prefix must contain at least one object when
 * the flow is created — AppFlow validates connectivity by listing the source
 * at `CreateFlow` time and rejects an empty prefix with
 * `ConnectorServerException`.
 * ### Creating a Flow
 * **Example:** S3 to S3 On-Demand Flow
 * ```typescript
 * const flow = yield* AppFlow.Flow("Copy", {
 *   triggerConfig: { triggerType: "OnDemand" },
 *   sourceFlowConfig: {
 *     connectorType: "S3",
 *     sourceConnectorProperties: {
 *       S3: { bucketName: srcBucket, bucketPrefix: "input" },
 *     },
 *   },
 *   destinationFlowConfigList: [
 *     {
 *       connectorType: "S3",
 *       destinationConnectorProperties: {
 *         S3: { bucketName: dstBucket, bucketPrefix: "output" },
 *       },
 *     },
 *   ],
 *   tasks: [
 *     {
 *       taskType: "Map_all",
 *       sourceFields: [],
 *       connectorOperator: { S3: "NO_OP" },
 *       taskProperties: {},
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const Flow = Resource("AWS.AppFlow.Flow");
const ON_DEMAND = { triggerType: "OnDemand" };
export const FlowProvider = () => Provider.effect(Flow, Effect.gen(function* () {
    const toName = (id, props) => props.flowName
        ? Effect.succeed(props.flowName)
        : createPhysicalName({ id, maxLength: 100 });
    return {
        stables: ["flowName", "flowArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.flowName ?? (yield* toName(id, olds ?? {}));
            const flow = yield* appflow
                .describeFlow({ flowName: name })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (flow === undefined || flow.flowArn === undefined)
                return undefined;
            const attrs = {
                flowName: name,
                flowArn: flow.flowArn,
                flowStatus: flow.flowStatus,
            };
            const tags = yield* readAppFlowTags(flow.flowArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.flowName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const trigger = news.triggerConfig ?? ON_DEMAND;
            // 1. Observe.
            let live = yield* appflow
                .describeFlow({ flowName: name })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            // 2. Ensure — create if missing. Tolerate an AlreadyExists race by
            // falling back to describe.
            if (live === undefined) {
                yield* appflow
                    .createFlow({
                    flowName: name,
                    description: news.description,
                    kmsArn: news.kmsArn,
                    triggerConfig: trigger,
                    sourceFlowConfig: news.sourceFlowConfig,
                    destinationFlowConfigList: news.destinationFlowConfigList,
                    tasks: news.tasks,
                    metadataCatalogConfig: news.metadataCatalogConfig,
                    tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                live = yield* appflow.describeFlow({ flowName: name });
            }
            else {
                // 3. Sync — updateFlow converges the mutable configuration
                // (trigger, source/destination, tasks). It does not accept tags.
                yield* appflow.updateFlow({
                    flowName: name,
                    description: news.description,
                    triggerConfig: trigger,
                    sourceFlowConfig: news.sourceFlowConfig,
                    destinationFlowConfigList: news.destinationFlowConfigList,
                    tasks: news.tasks,
                    metadataCatalogConfig: news.metadataCatalogConfig,
                });
                live = yield* appflow.describeFlow({ flowName: name });
            }
            // 3b. Sync tags against observed cloud tags.
            if (live.flowArn) {
                yield* syncAppFlowTags(live.flowArn, desiredTags);
            }
            yield* session.note(name);
            return {
                flowName: name,
                flowArn: live.flowArn,
                flowStatus: live.flowStatus,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* appflow
                .deleteFlow({ flowName: output.flowName, forceDelete: true })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => appflow.listFlows.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.flows ?? [])
            .filter((f) => f.flowName !== undefined && f.flowArn !== undefined)
            .map((f) => ({
            flowName: f.flowName,
            flowArn: f.flowArn,
            flowStatus: f.flowStatus,
        }))))),
    };
}));
//# sourceMappingURL=Flow.js.map