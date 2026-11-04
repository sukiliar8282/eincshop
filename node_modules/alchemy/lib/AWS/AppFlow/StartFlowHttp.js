import * as appflow from "@distilled.cloud/aws/appflow";
import * as Layer from "effect/Layer";
import { makeAppFlowHttpBinding } from "./BindingHttp.js";
import { StartFlow } from "./StartFlow.js";
export const StartFlowHttp = Layer.effect(StartFlow, makeAppFlowHttpBinding({
    action: "StartFlow",
    operation: appflow.startFlow,
    identifier: (flow) => flow.flowName,
    requestKey: "flowName",
    resources: (flow) => [flow.flowArn],
}));
//# sourceMappingURL=StartFlowHttp.js.map