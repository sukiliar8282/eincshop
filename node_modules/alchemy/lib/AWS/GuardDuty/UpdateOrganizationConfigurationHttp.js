import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Layer from "effect/Layer";
import { makeGuardDutyDetectorHttpBinding } from "./BindingHttp.js";
import { UpdateOrganizationConfiguration } from "./UpdateOrganizationConfiguration.js";
export const UpdateOrganizationConfigurationHttp = Layer.effect(UpdateOrganizationConfiguration, makeGuardDutyDetectorHttpBinding({
    tag: "AWS.GuardDuty.UpdateOrganizationConfiguration",
    operation: guardduty.updateOrganizationConfiguration,
    actions: ["guardduty:UpdateOrganizationConfiguration"],
}));
//# sourceMappingURL=UpdateOrganizationConfigurationHttp.js.map