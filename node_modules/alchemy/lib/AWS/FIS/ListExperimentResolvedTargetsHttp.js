import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { ListExperimentResolvedTargets } from "./ListExperimentResolvedTargets.js";
export const ListExperimentResolvedTargetsHttp = Layer.effect(ListExperimentResolvedTargets, makeFisAccountHttpBinding({
    tag: "AWS.FIS.ListExperimentResolvedTargets",
    operation: fis.listExperimentResolvedTargets,
    actions: ["fis:ListExperimentResolvedTargets"],
}));
//# sourceMappingURL=ListExperimentResolvedTargetsHttp.js.map