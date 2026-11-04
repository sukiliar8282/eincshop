import * as forecastquery from "@distilled.cloud/aws/forecastquery";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { QueryWhatIfForecast } from "./QueryWhatIfForecast.js";
export const QueryWhatIfForecastHttp = Layer.effect(QueryWhatIfForecast, makeForecastHttpBinding({
    capability: "QueryWhatIfForecast",
    iamActions: ["forecast:QueryWhatIfForecast"],
    operation: forecastquery.queryWhatIfForecast,
}));
//# sourceMappingURL=QueryWhatIfForecastHttp.js.map