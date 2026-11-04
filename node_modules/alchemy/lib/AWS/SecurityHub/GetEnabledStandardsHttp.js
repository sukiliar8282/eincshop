import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetEnabledStandards } from "./GetEnabledStandards.js";
export const GetEnabledStandardsHttp = Layer.effect(GetEnabledStandards, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetEnabledStandards",
    operation: securityhub.getEnabledStandards,
    actions: ["securityhub:GetEnabledStandards"],
}));
//# sourceMappingURL=GetEnabledStandardsHttp.js.map