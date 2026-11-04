import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListInsights } from "./ListInsights.js";
export const ListInsightsHttp = Layer.effect(ListInsights, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListInsights",
    operation: devopsguru.listInsights,
    actions: ["devops-guru:ListInsights"],
}));
//# sourceMappingURL=ListInsightsHttp.js.map