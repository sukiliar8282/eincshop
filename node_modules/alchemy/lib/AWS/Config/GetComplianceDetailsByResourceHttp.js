import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { GetComplianceDetailsByResource } from "./GetComplianceDetailsByResource.js";
export const GetComplianceDetailsByResourceHttp = Layer.effect(GetComplianceDetailsByResource, makeConfigAccountHttpBinding({
    tag: "AWS.Config.GetComplianceDetailsByResource",
    operation: config.getComplianceDetailsByResource,
    actions: ["config:GetComplianceDetailsByResource"],
}));
//# sourceMappingURL=GetComplianceDetailsByResourceHttp.js.map