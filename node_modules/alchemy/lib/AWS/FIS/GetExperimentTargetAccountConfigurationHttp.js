import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { GetExperimentTargetAccountConfiguration } from "./GetExperimentTargetAccountConfiguration.js";
export const GetExperimentTargetAccountConfigurationHttp = Layer.effect(GetExperimentTargetAccountConfiguration, makeFisAccountHttpBinding({
    tag: "AWS.FIS.GetExperimentTargetAccountConfiguration",
    operation: fis.getExperimentTargetAccountConfiguration,
    actions: ["fis:GetExperimentTargetAccountConfiguration"],
}));
//# sourceMappingURL=GetExperimentTargetAccountConfigurationHttp.js.map