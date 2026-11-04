import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListRecommendations } from "./ListRecommendations.js";
export const ListRecommendationsHttp = Layer.effect(ListRecommendations, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListRecommendations",
    operation: devopsguru.listRecommendations,
    actions: ["devops-guru:ListRecommendations"],
}));
//# sourceMappingURL=ListRecommendationsHttp.js.map