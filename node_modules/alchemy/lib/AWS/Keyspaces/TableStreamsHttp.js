import * as keyspacesstreams from "@distilled.cloud/aws/keyspacesstreams";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { TableStreams, } from "./TableStreams.js";
/**
 * HTTP implementation of {@link TableStreams}: grants the CDC stream read
 * actions (`cassandra:ListStreams` / `GetStream` / `GetShardIterator` /
 * `GetRecords`) on the bound table and its streams, and calls the Keyspaces
 * streams HTTP API with the function's IAM credentials.
 */
export const TableStreamsHttp = Layer.effect(TableStreams, Effect.gen(function* () {
    const listStreams = yield* keyspacesstreams.listStreams;
    const getStream = yield* keyspacesstreams.getStream;
    const getShardIterator = yield* keyspacesstreams.getShardIterator;
    const getRecords = yield* keyspacesstreams.getRecords;
    return Effect.fn(function* (table) {
        const KeyspaceName = yield* table.keyspaceName;
        const TableName = yield* table.tableName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Keyspaces.TableStreams(${table}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: [
                                "cassandra:GetRecords",
                                "cassandra:GetShardIterator",
                                "cassandra:GetStream",
                                "cassandra:ListStreams",
                            ],
                            Resource: [
                                table.tableArn,
                                Output.interpolate `${table.tableArn}/stream/*`,
                            ],
                        },
                    ],
                });
            }
        }
        const logicalId = table.LogicalId;
        const client = {
            listStreams: Effect.fn(`AWS.Keyspaces.TableStreams.listStreams(${logicalId})`)(function* (request) {
                const keyspaceName = yield* KeyspaceName;
                const tableName = yield* TableName;
                return yield* listStreams({ ...request, keyspaceName, tableName });
            }),
            getStream: Effect.fn(`AWS.Keyspaces.TableStreams.getStream(${logicalId})`)(function* (request) {
                return yield* getStream(request);
            }),
            getShardIterator: Effect.fn(`AWS.Keyspaces.TableStreams.getShardIterator(${logicalId})`)(function* (request) {
                return yield* getShardIterator(request);
            }),
            getRecords: Effect.fn(`AWS.Keyspaces.TableStreams.getRecords(${logicalId})`)(function* (request) {
                return yield* getRecords(request);
            }),
        };
        return client;
    });
}));
//# sourceMappingURL=TableStreamsHttp.js.map