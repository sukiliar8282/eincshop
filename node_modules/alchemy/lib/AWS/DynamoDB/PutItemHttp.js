import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { PutItem } from "./PutItem.js";
export const PutItemHttp = Layer.effect(PutItem, makeTableHttpBinding({
    tag: "AWS.DynamoDB.PutItem",
    operation: DynamoDB.putItem,
    actions: ["dynamodb:PutItem"],
}));
//# sourceMappingURL=PutItemHttp.js.map