import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { UpdateEc2DeepInspectionConfiguration } from "./UpdateEc2DeepInspectionConfiguration.js";
export const UpdateEc2DeepInspectionConfigurationHttp = Layer.effect(UpdateEc2DeepInspectionConfiguration, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.UpdateEc2DeepInspectionConfiguration",
    operation: inspector2.updateEc2DeepInspectionConfiguration,
    actions: ["inspector2:UpdateEc2DeepInspectionConfiguration"],
}));
//# sourceMappingURL=UpdateEc2DeepInspectionConfigurationHttp.js.map