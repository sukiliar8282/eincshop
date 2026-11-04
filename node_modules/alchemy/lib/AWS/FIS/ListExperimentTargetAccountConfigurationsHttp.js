import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { ListExperimentTargetAccountConfigurations } from "./ListExperimentTargetAccountConfigurations.js";
export const ListExperimentTargetAccountConfigurationsHttp = Layer.effect(ListExperimentTargetAccountConfigurations, makeFisAccountHttpBinding({
    tag: "AWS.FIS.ListExperimentTargetAccountConfigurations",
    operation: fis.listExperimentTargetAccountConfigurations,
    actions: ["fis:ListExperimentTargetAccountConfigurations"],
}));
//# sourceMappingURL=ListExperimentTargetAccountConfigurationsHttp.js.map