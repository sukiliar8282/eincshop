import * as forecast from "@distilled.cloud/aws/forecast";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { GetAccuracyMetrics } from "./GetAccuracyMetrics.js";
export const GetAccuracyMetricsHttp = Layer.effect(GetAccuracyMetrics, makeForecastHttpBinding({
    capability: "GetAccuracyMetrics",
    iamActions: ["forecast:GetAccuracyMetrics"],
    operation: forecast.getAccuracyMetrics,
}));
//# sourceMappingURL=GetAccuracyMetricsHttp.js.map