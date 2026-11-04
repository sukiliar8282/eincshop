import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { UpdateItem } from "./UpdateItem.js";
export const UpdateItemHttp = Layer.effect(UpdateItem, makeTableHttpBinding({
    tag: "AWS.DynamoDB.UpdateItem",
    operation: DynamoDB.updateItem,
    actions: ["dynamodb:UpdateItem"],
}));
//# sourceMappingURL=UpdateItemHttp.js.map