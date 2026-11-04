import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { GetItem } from "./GetItem.js";
export const GetItemHttp = Layer.effect(GetItem, makeTableHttpBinding({
    tag: "AWS.DynamoDB.GetItem",
    operation: DynamoDB.getItem,
    actions: ["dynamodb:GetItem"],
}));
//# sourceMappingURL=GetItemHttp.js.map