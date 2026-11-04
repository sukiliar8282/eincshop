import * as devopsguru from "@distilled.cloud/aws/devops-guru";
import * as Layer from "effect/Layer";
import { makeDevOpsGuruAccountHttpBinding } from "./BindingHttp.js";
import { ListEvents } from "./ListEvents.js";
export const ListEventsHttp = Layer.effect(ListEvents, makeDevOpsGuruAccountHttpBinding({
    tag: "AWS.DevOpsGuru.ListEvents",
    operation: devopsguru.listEvents,
    actions: ["devops-guru:ListEvents"],
}));
//# sourceMappingURL=ListEventsHttp.js.map