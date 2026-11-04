import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapServiceHttpBinding } from "./BindingHttp.js";
import { GetInstance } from "./GetInstance.js";
export const GetInstanceHttp = Layer.effect(GetInstance, makeCloudMapServiceHttpBinding({
    tag: "AWS.CloudMap.GetInstance",
    operation: SD.getInstance,
    actions: ["servicediscovery:GetInstance"],
}));
//# sourceMappingURL=GetInstanceHttp.js.map