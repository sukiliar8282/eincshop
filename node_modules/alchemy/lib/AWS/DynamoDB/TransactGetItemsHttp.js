import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import * as Layer from "effect/Layer";
import { isBindingHost } from "../Lambda/Function.js";
import { TransactGetItems, } from "./TransactGetItems.js";
export const TransactGetItemsHttp = Layer.effect(TransactGetItems, Effect.gen(function* () {
    const transactGetItems = yield* DynamoDB.transactGetItems;
    return Effect.fn(function* (...tables) {
        const sortedTables = sortTables(tables);
        const tableNames = new Map(yield* Effect.forEach(sortedTables, (table) => Effect.gen(function* () {
            return [table.LogicalId, yield* table.tableName];
        })));
        const getTableName = Effect.fn(function* (tableId) {
            const TableName = tableNames.get(tableId);
            if (!TableName) {
                return yield* Effect.die(new Error(`TransactGetItems request references unbound table '${tableId}'`));
            }
            return yield* TableName;
        });
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.DynamoDB.TransactGetItems(${sortedTables}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["dynamodb:GetItem"],
                            Resource: sortedTables.map((table) => table.tableArn),
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.DynamoDB.TransactGetItems(${sortedTables})`)(function* (request) {
            const transactItems = yield* Effect.forEach(request.TransactItems, ({ Get }) => Effect.gen(function* () {
                return {
                    Get: {
                        ...Get,
                        TableName: yield* getTableName(Get.Table),
                    },
                };
            }));
            return yield* transactGetItems({
                ...request,
                TransactItems: transactItems,
            });
        });
    });
}));
const sortTables = (tables) => [
    ...new Map(tables.map((table) => [table.LogicalId, table])).values(),
].sort((a, b) => a.LogicalId.localeCompare(b.LogicalId));
//# sourceMappingURL=TransactGetItemsHttp.js.map