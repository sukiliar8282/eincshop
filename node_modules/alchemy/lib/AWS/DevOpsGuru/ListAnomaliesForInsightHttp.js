import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListAnomaliesForInsight } from "./ListAnomaliesForInsight.js";
export const ListAnomaliesForInsightHttp = Layer.effect(ListAnomaliesForInsight, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListAnomaliesForInsight",
    operation: devopsguru.listAnomaliesForInsight,
    actions: ["devops-guru:ListAnomaliesForInsight"],
}));
//# sourceMappingURL=ListAnomaliesForInsightHttp.js.map