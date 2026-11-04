import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeExecutionScopedHttpBinding } from "./BindingHttp.js";
import { UpdateMapRun } from "./UpdateMapRun.js";
export const UpdateMapRunHttp = Layer.effect(UpdateMapRun, makeExecutionScopedHttpBinding({
    tag: "AWS.StepFunctions.UpdateMapRun",
    operation: sfn.updateMapRun,
    actions: ["states:UpdateMapRun"],
    scope: "mapRun",
}));
//# sourceMappingURL=UpdateMapRunHttp.js.map