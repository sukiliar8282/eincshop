import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationStackHttpBinding } from "./BindingHttp.js";
import { GetTemplate } from "./GetTemplate.js";
export const GetTemplateHttp = Layer.effect(GetTemplate, makeCloudFormationStackHttpBinding({
    tag: "AWS.CloudFormation.GetTemplate",
    operation: cloudformation.getTemplate,
    actions: ["cloudformation:GetTemplate"],
}));
//# sourceMappingURL=GetTemplateHttp.js.map