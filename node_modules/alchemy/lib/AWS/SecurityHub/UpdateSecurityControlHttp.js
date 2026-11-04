import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { UpdateSecurityControl } from "./UpdateSecurityControl.js";
export const UpdateSecurityControlHttp = Layer.effect(UpdateSecurityControl, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.UpdateSecurityControl",
    operation: securityhub.updateSecurityControl,
    actions: ["securityhub:UpdateSecurityControl"],
}));
//# sourceMappingURL=UpdateSecurityControlHttp.js.map