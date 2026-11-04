import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { StopExperiment } from "./StopExperiment.js";
export const StopExperimentHttp = Layer.effect(StopExperiment, makeFisAccountHttpBinding({
    tag: "AWS.FIS.StopExperiment",
    operation: fis.stopExperiment,
    actions: ["fis:StopExperiment"],
}));
//# sourceMappingURL=StopExperimentHttp.js.map