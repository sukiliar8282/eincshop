import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeSloIdHttpBinding } from "./BindingHttp.js";
import { ListServiceLevelObjectiveExclusionWindows } from "./ListServiceLevelObjectiveExclusionWindows.js";
export const ListServiceLevelObjectiveExclusionWindowsHttp = Layer.effect(ListServiceLevelObjectiveExclusionWindows, makeSloIdHttpBinding({
    tag: "AWS.ApplicationSignals.ListServiceLevelObjectiveExclusionWindows",
    operation: appsignals.listServiceLevelObjectiveExclusionWindows,
    actions: ["application-signals:ListServiceLevelObjectiveExclusionWindows"],
}));
//# sourceMappingURL=ListServiceLevelObjectiveExclusionWindowsHttp.js.map