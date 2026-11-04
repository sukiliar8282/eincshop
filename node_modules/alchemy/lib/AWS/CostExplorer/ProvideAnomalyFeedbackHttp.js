import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { ProvideAnomalyFeedback } from "./ProvideAnomalyFeedback.js";
export const ProvideAnomalyFeedbackHttp = Layer.effect(ProvideAnomalyFeedback, makeCostExplorerHttpBinding({
    capability: "ProvideAnomalyFeedback",
    iamActions: ["ce:ProvideAnomalyFeedback"],
    operation: ce.provideAnomalyFeedback,
}));
//# sourceMappingURL=ProvideAnomalyFeedbackHttp.js.map