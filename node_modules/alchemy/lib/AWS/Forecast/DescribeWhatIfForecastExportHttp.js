import * as forecast from "@distilled.cloud/aws/forecast";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { DescribeWhatIfForecastExport } from "./DescribeWhatIfForecastExport.js";
export const DescribeWhatIfForecastExportHttp = Layer.effect(DescribeWhatIfForecastExport, makeForecastHttpBinding({
    capability: "DescribeWhatIfForecastExport",
    iamActions: ["forecast:DescribeWhatIfForecastExport"],
    operation: forecast.describeWhatIfForecastExport,
}));
//# sourceMappingURL=DescribeWhatIfForecastExportHttp.js.map