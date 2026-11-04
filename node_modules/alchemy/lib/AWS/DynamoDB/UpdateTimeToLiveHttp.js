import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Layer from "effect/Layer";
import { makeTableHttpBinding } from "./BindingHttp.js";
import { UpdateTimeToLive } from "./UpdateTimeToLive.js";
export const UpdateTimeToLiveHttp = Layer.effect(UpdateTimeToLive, makeTableHttpBinding({
    tag: "AWS.DynamoDB.UpdateTimeToLive",
    operation: DynamoDB.updateTimeToLive,
    actions: ["dynamodb:UpdateTimeToLive"],
}));
//# sourceMappingURL=UpdateTimeToLiveHttp.js.map