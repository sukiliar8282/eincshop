import * as bcm from "@distilled.cloud/aws/bcm-data-exports";
import * as Layer from "effect/Layer";
import { makeExportHttpBinding } from "./BindingHttp.js";
import { GetExecution } from "./GetExecution.js";
export const GetExecutionHttp = Layer.effect(GetExecution, makeExportHttpBinding({
    capability: "GetExecution",
    iamActions: ["bcm-data-exports:GetExecution"],
    operation: bcm.getExecution,
}));
//# sourceMappingURL=GetExecutionHttp.js.map