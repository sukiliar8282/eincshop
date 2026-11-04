import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeTemplateScopedHttpBinding } from "./BindingHttp.js";
import { RenderEmailTemplate } from "./RenderEmailTemplate.js";
export const RenderEmailTemplateHttp = Layer.effect(RenderEmailTemplate, makeTemplateScopedHttpBinding({
    tag: "AWS.SES.RenderEmailTemplate",
    operation: sesv2.testRenderEmailTemplate,
    actions: ["ses:TestRenderEmailTemplate"],
}));
//# sourceMappingURL=RenderEmailTemplateHttp.js.map