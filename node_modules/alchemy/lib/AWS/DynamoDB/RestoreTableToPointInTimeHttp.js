import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import * as Layer from "effect/Layer";
import { isBindingHost } from "../Lambda/Function.js";
import { RestoreTableToPointInTime, } from "./RestoreTableToPointInTime.js";
export const RestoreTableToPointInTimeHttp = Layer.effect(RestoreTableToPointInTime, Effect.gen(function* () {
    const restoreTableToPointInTime = yield* DynamoDB.restoreTableToPointInTime;
    return Effect.fn(function* (from, to) {
        const SourceTableName = yield* from.tableName;
        const TargetTableName = yield* to.tableName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.DynamoDB.RestoreTableToPointInTime(${from}, ${to}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["dynamodb:RestoreTableToPointInTime"],
                            Resource: [from.tableArn],
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
        return Effect.fn(`AWS.DynamoDB.RestoreTableToPointInTime(${from.LogicalId}, ${to.LogicalId})`)(function* (request) {
            return yield* restoreTableToPointInTime({
                ...request,
                SourceTableName: yield* SourceTableName,
                TargetTableName: yield* TargetTableName,
            });
        });
    });
}));
//# sourceMappingURL=RestoreTableToPointInTimeHttp.js.map