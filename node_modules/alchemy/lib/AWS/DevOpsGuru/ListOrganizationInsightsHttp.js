import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListOrganizationInsights } from "./ListOrganizationInsights.js";
export const ListOrganizationInsightsHttp = Layer.effect(ListOrganizationInsights, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListOrganizationInsights",
    operation: devopsguru.listOrganizationInsights,
    actions: ["devops-guru:ListOrganizationInsights"],
}));
//# sourceMappingURL=ListOrganizationInsightsHttp.js.map