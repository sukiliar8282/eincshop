import * as ds from "@distilled.cloud/aws/directory-service";
import * as Layer from "effect/Layer";
import { makeDirectoryServiceAccountHttpBinding } from "./BindingHttp.js";
import { GetDirectoryLimits } from "./GetDirectoryLimits.js";
export const GetDirectoryLimitsHttp = Layer.effect(GetDirectoryLimits, makeDirectoryServiceAccountHttpBinding({
    tag: "AWS.DirectoryService.GetDirectoryLimits",
    operation: ds.getDirectoryLimits,
    actions: ["ds:GetDirectoryLimits"],
}));
//# sourceMappingURL=GetDirectoryLimitsHttp.js.map