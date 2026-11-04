import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { ListExperiments } from "./ListExperiments.js";
export const ListExperimentsHttp = Layer.effect(ListExperiments, makeFisAccountHttpBinding({
    tag: "AWS.FIS.ListExperiments",
    operation: fis.listExperiments,
    actions: ["fis:ListExperiments"],
}));
//# sourceMappingURL=ListExperimentsHttp.js.map