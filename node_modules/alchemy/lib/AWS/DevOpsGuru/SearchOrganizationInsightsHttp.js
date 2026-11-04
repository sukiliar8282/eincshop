import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { SearchOrganizationInsights } from "./SearchOrganizationInsights.js";
export const SearchOrganizationInsightsHttp = Layer.effect(SearchOrganizationInsights, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.SearchOrganizationInsights",
    operation: devopsguru.searchOrganizationInsights,
    actions: ["devops-guru:SearchOrganizationInsights"],
}));
//# sourceMappingURL=SearchOrganizationInsightsHttp.js.map