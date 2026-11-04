import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Namespace from "../../Namespace.js";
import { ClusterEventSource as DocDBClusterEventSourceContract, } from "../DocDB/ClusterEventSource.js";
import { EventSourceMapping } from "./EventSourceMapping.js";
import * as Lambda from "./Function.js";
export const isDocumentDBEvent = (event) => typeof event?.eventSourceArn === "string" && Array.isArray(event?.events);
/** @binding */
export const DocDBClusterEventSource = Layer.effect(DocDBClusterEventSourceContract, Effect.gen(function* () {
    const host = yield* Lambda.Function;
    const Mapping = yield* EventSourceMapping;
    return Effect.fn(function* (cluster, props, process) {
        const ClusterArn = yield* cluster.dbClusterArn;
        // Deploy-time: grant IAM (secret access) and create the DocumentDB
        // event-source mapping. Skipped once running inside the deployed Function
        // (the global guard), where the only work is registering the runtime
        // handler below. Namespaced under the host so the mapping's logical
        // identity is stable.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                yield* host.bind `Allow(${host}, AWS.DocDB.ClusterEventSource(${cluster}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["secretsmanager:GetSecretValue"],
                            Resource: [props.secretArn],
                        },
                    ],
                });
                yield* Mapping(`AWS.Lambda.EventSourceMapping(${host.LogicalId}, ${cluster.LogicalId})`, {
                    functionName: host.functionName,
                    eventSourceArn: cluster.dbClusterArn,
                    startingPosition: props.startingPosition ?? "LATEST",
                    batchSize: props.batchSize,
                    maximumBatchingWindow: props.maximumBatchingWindow,
                    enabled: props.enabled ?? true,
                    documentDBEventSourceConfig: {
                        DatabaseName: props.databaseName,
                        CollectionName: props.collectionName,
                        FullDocument: props.fullDocument ?? "Default",
                    },
                    sourceAccessConfigurations: [
                        { Type: "BASIC_AUTH", URI: props.secretArn },
                    ],
                });
            }));
        }
        yield* host.listen(Effect.gen(function* () {
            const clusterArn = yield* ClusterArn;
            return (event) => {
                if (isDocumentDBEvent(event) &&
                    event.eventSourceArn === clusterArn) {
                    return process(Stream.fromArray(event.events)).pipe(Effect.orDie);
                }
            };
        }));
    });
}));
//# sourceMappingURL=DocDBClusterEventSource.js.map