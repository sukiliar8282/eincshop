import * as keyspaces from "@distilled.cloud/aws/keyspaces";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { RestoreTable } from "./RestoreTable.js";
/**
 * HTTP implementation of {@link RestoreTable}: grants `cassandra:Select` on
 * the source table plus `cassandra:Restore` (and the `Create`/`TagResource`
 * actions the restore performs) on the target keyspace and its tables, and
 * calls the Keyspaces HTTP API with the function's IAM credentials.
 */
export const RestoreTableHttp = Layer.effect(RestoreTable, Effect.gen(function* () {
    const restoreTable = yield* keyspaces.restoreTable;
    return Effect.fn(function* (source, targetKeyspace) {
        const SourceKeyspaceName = yield* source.keyspaceName;
        const SourceTableName = yield* source.tableName;
        const TargetKeyspaceName = yield* targetKeyspace.keyspaceName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Keyspaces.RestoreTable(${source}, ${targetKeyspace}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["cassandra:Select"],
                            Resource: [source.tableArn],
                        },
                        {
                            // The keyspace ARN ends with a trailing slash
                            // (`.../keyspace/name/`), so its tables match `table/*`.
                            Effect: "Allow",
                            Action: [
                                "cassandra:Restore",
                                "cassandra:Create",
                                "cassandra:TagResource",
                            ],
                            Resource: [
                                targetKeyspace.keyspaceArn,
                                Output.interpolate `${targetKeyspace.keyspaceArn}table/*`,
                            ],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.Keyspaces.RestoreTable(${source.LogicalId})`)(function* (request) {
            const sourceKeyspaceName = yield* SourceKeyspaceName;
            const sourceTableName = yield* SourceTableName;
            const targetKeyspaceName = yield* TargetKeyspaceName;
            return yield* restoreTable({
                ...request,
                sourceKeyspaceName,
                sourceTableName,
                targetKeyspaceName,
            });
        });
    });
}));
//# sourceMappingURL=RestoreTableHttp.js.map