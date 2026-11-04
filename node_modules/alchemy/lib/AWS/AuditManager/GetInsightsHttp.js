import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Layer from "effect/Layer";
import { makeAuditManagerAccountHttpBinding } from "./BindingHttp.js";
import { GetInsights } from "./GetInsights.js";
export const GetInsightsHttp = Layer.effect(GetInsights, makeAuditManagerAccountHttpBinding({
    tag: "AWS.AuditManager.GetInsights",
    operation: auditmanager.getInsights,
    actions: ["auditmanager:GetInsights"],
}));
//# sourceMappingURL=GetInsightsHttp.js.map