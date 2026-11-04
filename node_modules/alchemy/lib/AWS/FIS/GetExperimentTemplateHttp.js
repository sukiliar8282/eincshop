import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisTemplateHttpBinding } from "./BindingHttp.js";
import { GetExperimentTemplate } from "./GetExperimentTemplate.js";
export const GetExperimentTemplateHttp = Layer.effect(GetExperimentTemplate, makeFisTemplateHttpBinding({
    tag: "AWS.FIS.GetExperimentTemplate",
    operation: fis.getExperimentTemplate,
    actions: ["fis:GetExperimentTemplate"],
    requestKey: "id",
}));
//# sourceMappingURL=GetExperimentTemplateHttp.js.map