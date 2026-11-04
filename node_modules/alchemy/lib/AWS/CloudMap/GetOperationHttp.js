import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapAccountHttpBinding } from "./BindingHttp.js";
import { GetOperation } from "./GetOperation.js";
export const GetOperationHttp = Layer.effect(GetOperation, makeCloudMapAccountHttpBinding({
    tag: "AWS.CloudMap.GetOperation",
    operation: SD.getOperation,
    // GetOperation does not support resource-level IAM permissions.
    actions: ["servicediscovery:GetOperation"],
}));
//# sourceMappingURL=GetOperationHttp.js.map