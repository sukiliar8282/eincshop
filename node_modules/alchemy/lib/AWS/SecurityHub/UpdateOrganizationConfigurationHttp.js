import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { UpdateOrganizationConfiguration } from "./UpdateOrganizationConfiguration.js";
export const UpdateOrganizationConfigurationHttp = Layer.effect(UpdateOrganizationConfiguration, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.UpdateOrganizationConfiguration",
    operation: securityhub.updateOrganizationConfiguration,
    actions: ["securityhub:UpdateOrganizationConfiguration"],
}));
//# sourceMappingURL=UpdateOrganizationConfigurationHttp.js.map