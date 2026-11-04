import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationAccountHttpBinding } from "./BindingHttp.js";
import { ValidateTemplate } from "./ValidateTemplate.js";
export const ValidateTemplateHttp = Layer.effect(ValidateTemplate, makeCloudFormationAccountHttpBinding({
    tag: "AWS.CloudFormation.ValidateTemplate",
    operation: cloudformation.validateTemplate,
    actions: ["cloudformation:ValidateTemplate"],
}));
//# sourceMappingURL=ValidateTemplateHttp.js.map