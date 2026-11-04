import * as forecastquery from "@distilled.cloud/aws/forecastquery";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { QueryForecast } from "./QueryForecast.js";
export const QueryForecastHttp = Layer.effect(QueryForecast, makeForecastHttpBinding({
    capability: "QueryForecast",
    iamActions: ["forecast:QueryForecast"],
    operation: forecastquery.queryForecast,
}));
//# sourceMappingURL=QueryForecastHttp.js.map