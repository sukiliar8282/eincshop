import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListMonitoredResources } from "./ListMonitoredResources.js";
export const ListMonitoredResourcesHttp = Layer.effect(ListMonitoredResources, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListMonitoredResources",
    operation: devopsguru.listMonitoredResources,
    actions: ["devops-guru:ListMonitoredResources"],
}));
//# sourceMappingURL=ListMonitoredResourcesHttp.js.map