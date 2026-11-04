import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { SearchInsights } from "./SearchInsights.js";
export const SearchInsightsHttp = Layer.effect(SearchInsights, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.SearchInsights",
    operation: devopsguru.searchInsights,
    actions: ["devops-guru:SearchInsights"],
}));
//# sourceMappingURL=SearchInsightsHttp.js.map