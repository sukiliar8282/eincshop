import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetFindings } from "./GetFindings.js";
export const GetFindingsHttp = Layer.effect(GetFindings, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetFindings",
    operation: securityhub.getFindings,
    actions: ["securityhub:GetFindings"],
}));
//# sourceMappingURL=GetFindingsHttp.js.map