import * as forecast from "@distilled.cloud/aws/forecast";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { DescribeWhatIfAnalysis } from "./DescribeWhatIfAnalysis.js";
export const DescribeWhatIfAnalysisHttp = Layer.effect(DescribeWhatIfAnalysis, makeForecastHttpBinding({
    capability: "DescribeWhatIfAnalysis",
    iamActions: ["forecast:DescribeWhatIfAnalysis"],
    operation: forecast.describeWhatIfAnalysis,
}));
//# sourceMappingURL=DescribeWhatIfAnalysisHttp.js.map