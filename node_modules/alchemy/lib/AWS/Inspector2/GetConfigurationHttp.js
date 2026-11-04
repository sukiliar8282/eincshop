import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { GetConfiguration } from "./GetConfiguration.js";
export const GetConfigurationHttp = Layer.effect(GetConfiguration, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.GetConfiguration",
    operation: inspector2.getConfiguration,
    actions: ["inspector2:GetConfiguration"],
}));
//# sourceMappingURL=GetConfigurationHttp.js.map