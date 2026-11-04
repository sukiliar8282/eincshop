import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetFindingHistory } from "./GetFindingHistory.js";
export const GetFindingHistoryHttp = Layer.effect(GetFindingHistory, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetFindingHistory",
    operation: securityhub.getFindingHistory,
    actions: ["securityhub:GetFindingHistory"],
}));
//# sourceMappingURL=GetFindingHistoryHttp.js.map