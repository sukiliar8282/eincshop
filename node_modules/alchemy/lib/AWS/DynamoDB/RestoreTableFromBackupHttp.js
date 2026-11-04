import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { RestoreTableFromBackup, } from "./RestoreTableFromBackup.js";
export const RestoreTableFromBackupHttp = Layer.effect(RestoreTableFromBackup, Effect.gen(function* () {
    const restoreTableFromBackup = yield* DynamoDB.restoreTableFromBackup;
    return Effect.fn(function* (from, to) {
        const TargetTableName = yield* to.tableName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.DynamoDB.RestoreTableFromBackup(${from}, ${to}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["dynamodb:RestoreTableFromBackup"],
                            Resource: [Output.interpolate `${from.tableArn}/backup/*`],
                        },
                        {
                            Effect: "Allow",
                            Action: [
                                "dynamodb:PutItem",
                                "dynamodb:UpdateItem",
                                "dynamodb:DeleteItem",
                                "dynamodb:GetItem",
                                "dynamodb:Query",
                                "dynamodb:Scan",
                                "dynamodb:BatchWriteItem",
                            ],
                            Resource: [to.tableArn],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.DynamoDB.RestoreTableFromBackup(${from.LogicalId}, ${to.LogicalId})`)(function* (request) {
            return yield* restoreTableFromBackup({
                ...request,
                TargetTableName: yield* TargetTableName,
            });
        });
    });
}));
//# sourceMappingURL=RestoreTableFromBackupHttp.js.map