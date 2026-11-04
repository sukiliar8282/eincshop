import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { UpdateConfiguration } from "./UpdateConfiguration.js";
export const UpdateConfigurationHttp = Layer.effect(UpdateConfiguration, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.UpdateConfiguration",
    operation: inspector2.updateConfiguration,
    actions: ["inspector2:UpdateConfiguration"],
}));
//# sourceMappingURL=UpdateConfigurationHttp.js.map