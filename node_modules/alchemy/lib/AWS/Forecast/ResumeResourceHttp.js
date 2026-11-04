import * as forecast from "@distilled.cloud/aws/forecast";
import * as Layer from "effect/Layer";
import { makeForecastHttpBinding } from "./BindingHttp.js";
import { ResumeResource } from "./ResumeResource.js";
export const ResumeResourceHttp = Layer.effect(ResumeResource, makeForecastHttpBinding({
    capability: "ResumeResource",
    iamActions: ["forecast:ResumeResource"],
    operation: forecast.resumeResource,
}));
//# sourceMappingURL=ResumeResourceHttp.js.map