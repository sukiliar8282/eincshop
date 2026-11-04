import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeApplicationSignalsAccountHttpBinding } from "./BindingHttp.js";
import { ListServiceLevelObjectives } from "./ListServiceLevelObjectives.js";
export const ListServiceLevelObjectivesHttp = Layer.effect(ListServiceLevelObjectives, makeApplicationSignalsAccountHttpBinding({
    tag: "AWS.ApplicationSignals.ListServiceLevelObjectives",
    operation: appsignals.listServiceLevelObjectives,
    actions: ["application-signals:ListServiceLevelObjectives"],
}));
//# sourceMappingURL=ListServiceLevelObjectivesHttp.js.map