import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { GetResourceConfigHistory } from "./GetResourceConfigHistory.js";
export const GetResourceConfigHistoryHttp = Layer.effect(GetResourceConfigHistory, makeConfigAccountHttpBinding({
    tag: "AWS.Config.GetResourceConfigHistory",
    operation: config.getResourceConfigHistory,
    actions: ["config:GetResourceConfigHistory"],
}));
//# sourceMappingURL=GetResourceConfigHistoryHttp.js.map