import * as forecast from "@distilled.cloud/aws/forecast";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { StopResource } from "./StopResource.js";
export const StopResourceHttp = Layer.effect(StopResource, makeForecastHttpBinding({
    capability: "StopResource",
    iamActions: ["forecast:StopResource"],
    operation: forecast.stopResource,
}));
//# sourceMappingURL=StopResourceHttp.js.map