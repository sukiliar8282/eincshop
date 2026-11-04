import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeAccountHttpBinding } from "./BindingHttp.js";
import { ListTables } from "./ListTables.js";
export const ListTablesHttp = Layer.effect(ListTables, makeAccountHttpBinding({
    tag: "AWS.DynamoDB.ListTables",
    operation: DynamoDB.listTables,
    actions: ["dynamodb:ListTables"],
}));
//# sourceMappingURL=ListTablesHttp.js.map