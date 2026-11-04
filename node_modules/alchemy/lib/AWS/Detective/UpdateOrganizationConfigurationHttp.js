import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { UpdateOrganizationConfiguration } from "./UpdateOrganizationConfiguration.js";
export const UpdateOrganizationConfigurationHttp = Layer.effect(UpdateOrganizationConfiguration, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.UpdateOrganizationConfiguration",
    operation: detective.updateOrganizationConfiguration,
    actions: ["detective:UpdateOrganizationConfiguration"],
}));
//# sourceMappingURL=UpdateOrganizationConfigurationHttp.js.map