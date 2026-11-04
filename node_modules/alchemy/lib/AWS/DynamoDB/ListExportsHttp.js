import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableArnHttpBinding } from "./BindingHttp.js";
import { ListExports } from "./ListExports.js";
export const ListExportsHttp = Layer.effect(ListExports, makeTableArnHttpBinding({
    tag: "AWS.DynamoDB.ListExports",
    key: "TableArn",
    operation: DynamoDB.listExports,
    actions: ["dynamodb:ListExports"],
}));
//# sourceMappingURL=ListExportsHttp.js.map