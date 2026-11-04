import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Namespace from "../../Namespace.js";
import * as Output from "../../Output.js";
import { TableEventSource as DynamoDBTableEventSource, } from "../DynamoDB/Stream.js";
import { EventSourceMapping } from "./EventSourceMapping.js";
import * as Lambda from "./Function.js";
export const isDynamoDBStreamEvent = (event) => Array.isArray(event?.Records) &&
    event.Records.length > 0 &&
    event.Records[0].eventSource === "aws:dynamodb";
/** @binding */
export const TableEventSource = Layer.effect(DynamoDBTableEventSource, Effect.gen(function* () {
    const host = yield* Lambda.Function;
    const Mapping = yield* EventSourceMapping;
    return Effect.fn(function* (table, props, process) {
        const TableArn = yield* table.tableArn;
        // Deploy-time: enable the table stream, grant IAM, and create the
        // event-source mapping. Skipped once running inside the deployed Function
        // (the global guard), where the only work is registering the runtime
        // handler below. Namespaced under the host so the mapping's logical
        // identity matches the previous Binding.Policy.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                const latestStreamArn = table.latestStreamArn.pipe(Output.mapEffect((arn) => typeof arn === "string"
                    ? Effect.succeed(arn)
                    : Effect.die(`latestStreamArn is not a string: ${arn}`)));
                const streamViewType = props.streamViewType ?? "NEW_AND_OLD_IMAGES";
                yield* Effect.logInfo(`Lambda TableEventSource: binding stream ${streamViewType} for ${table.LogicalId}`);
                yield* table.bind `AWS.DynamoDB.Stream(${host}, ${table}, ${streamViewType})`({
                    streamSpecification: {
                        StreamEnabled: true,
                        StreamViewType: streamViewType,
                    },
                });
                yield* Effect.logInfo(`Lambda TableEventSourcePolicy: creating mapping for ${host.LogicalId} <- ${table.LogicalId}`);
                yield* host.bind `Allow(${host}, AWS.DynamoDB.Table.ReadStream(${table}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: [
                                "dynamodb:DescribeStream",
                                "dynamodb:GetRecords",
                                "dynamodb:GetShardIterator",
                            ],
                            Resource: [latestStreamArn],
                        },
                    ],
                });
                yield* host.bind `Allow(${host}, AWS.DynamoDB.ListStreams(${table}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["dynamodb:ListStreams"],
                            Resource: [table.tableArn],
                        },
                    ],
                });
                yield* Mapping(`AWS.Lambda.EventSourceMapping(${host.LogicalId}, ${table.LogicalId})`, {
                    functionName: host.functionName,
                    eventSourceArn: latestStreamArn,
                    batchSize: props.batchSize,
                    maximumBatchingWindow: props.maximumBatchingWindow,
                    enabled: true,
                    startingPosition: props.startingPosition ?? "LATEST",
                    startingPositionTimestamp: props.startingPositionTimestamp,
                    parallelizationFactor: props.parallelizationFactor,
                    bisectBatchOnFunctionError: props.bisectBatchOnFunctionError,
                    maximumRecordAge: props.maximumRecordAge,
                    maximumRetryAttempts: props.maximumRetryAttempts,
                    tumblingWindow: props.tumblingWindow,
                });
            }));
        }
        yield* host.listen(Effect.gen(function* () {
            const tableArn = yield* TableArn;
            const streamArnPrefix = `${tableArn}/stream/`;
            return (event) => {
                if (isDynamoDBStreamEvent(event)) {
                    const records = event.Records.filter((record) => record.eventSourceARN?.startsWith(streamArnPrefix) === true);
                    if (records.length > 0) {
                        return process(Stream.fromArray(records)).pipe(Effect.orDie);
                    }
                }
            };
        }));
    });
}));
//# sourceMappingURL=TableEventSource.js.map