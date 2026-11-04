import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListAnomalousLogGroups } from "./ListAnomalousLogGroups.js";
export const ListAnomalousLogGroupsHttp = Layer.effect(ListAnomalousLogGroups, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListAnomalousLogGroups",
    operation: devopsguru.listAnomalousLogGroups,
    actions: ["devops-guru:ListAnomalousLogGroups"],
}));
//# sourceMappingURL=ListAnomalousLogGroupsHttp.js.map