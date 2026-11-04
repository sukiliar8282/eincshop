import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeExecutionScopedHttpBinding } from "./BindingHttp.js";
import { ListMapRuns } from "./ListMapRuns.js";
export const ListMapRunsHttp = Layer.effect(ListMapRuns, makeExecutionScopedHttpBinding({
    tag: "AWS.StepFunctions.ListMapRuns",
    operation: sfn.listMapRuns,
    actions: ["states:ListMapRuns"],
}));
//# sourceMappingURL=ListMapRunsHttp.js.map