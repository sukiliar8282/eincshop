import * as forecast from "@distilled.cloud/aws/forecast";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { DescribeWhatIfForecast } from "./DescribeWhatIfForecast.js";
export const DescribeWhatIfForecastHttp = Layer.effect(DescribeWhatIfForecast, makeForecastHttpBinding({
    capability: "DescribeWhatIfForecast",
    iamActions: ["forecast:DescribeWhatIfForecast"],
    operation: forecast.describeWhatIfForecast,
}));
//# sourceMappingURL=DescribeWhatIfForecastHttp.js.map