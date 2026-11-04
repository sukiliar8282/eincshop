import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetInsights } from "./GetInsights.js";
export const GetInsightsHttp = Layer.effect(GetInsights, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetInsights",
    operation: securityhub.getInsights,
    actions: ["securityhub:GetInsights"],
}));
//# sourceMappingURL=GetInsightsHttp.js.map