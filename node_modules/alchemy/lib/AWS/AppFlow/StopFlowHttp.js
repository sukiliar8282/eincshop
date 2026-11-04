import * as appflow from "@distilled.cloud/aws/appflow";
import * as Layer from "effect/Layer";
import { makeAppFlowHttpBinding } from "./BindingHttp.js";
import { StopFlow } from "./StopFlow.js";
export const StopFlowHttp = Layer.effect(StopFlow, makeAppFlowHttpBinding({
    action: "StopFlow",
    operation: appflow.stopFlow,
    identifier: (flow) => flow.flowName,
    requestKey: "flowName",
    resources: (flow) => [flow.flowArn],
}));
//# sourceMappingURL=StopFlowHttp.js.map