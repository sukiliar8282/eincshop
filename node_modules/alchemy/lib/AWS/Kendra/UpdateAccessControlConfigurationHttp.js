import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { UpdateAccessControlConfiguration } from "./UpdateAccessControlConfiguration.js";
export const UpdateAccessControlConfigurationHttp = Layer.effect(UpdateAccessControlConfiguration, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.UpdateAccessControlConfiguration",
    operation: kendra.updateAccessControlConfiguration,
    actions: ["kendra:UpdateAccessControlConfiguration"],
    subResources: ["access-control-configuration/*"],
}));
//# sourceMappingURL=UpdateAccessControlConfigurationHttp.js.map