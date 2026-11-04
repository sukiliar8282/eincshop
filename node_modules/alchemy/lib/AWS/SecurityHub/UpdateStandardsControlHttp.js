import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { UpdateStandardsControl } from "./UpdateStandardsControl.js";
export const UpdateStandardsControlHttp = Layer.effect(UpdateStandardsControl, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.UpdateStandardsControl",
    operation: securityhub.updateStandardsControl,
    actions: ["securityhub:UpdateStandardsControl"],
}));
//# sourceMappingURL=UpdateStandardsControlHttp.js.map