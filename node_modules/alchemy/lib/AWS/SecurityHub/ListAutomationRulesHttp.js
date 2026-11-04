import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListAutomationRules } from "./ListAutomationRules.js";
export const ListAutomationRulesHttp = Layer.effect(ListAutomationRules, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListAutomationRules",
    operation: securityhub.listAutomationRules,
    actions: ["securityhub:ListAutomationRules"],
}));
//# sourceMappingURL=ListAutomationRulesHttp.js.map