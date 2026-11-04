import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { ListExperimentTemplates } from "./ListExperimentTemplates.js";
export const ListExperimentTemplatesHttp = Layer.effect(ListExperimentTemplates, makeFisAccountHttpBinding({
    tag: "AWS.FIS.ListExperimentTemplates",
    operation: fis.listExperimentTemplates,
    actions: ["fis:ListExperimentTemplates"],
}));
//# sourceMappingURL=ListExperimentTemplatesHttp.js.map