import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Layer from "effect/Layer";
import { makeFraudDetectorListHttpBinding } from "./BindingHttp.js";
import { GetListElements } from "./GetListElements.js";
export const GetListElementsHttp = Layer.effect(GetListElements, makeFraudDetectorListHttpBinding({
    tag: "AWS.FraudDetector.GetListElements",
    operation: frauddetector.getListElements,
    actions: ["frauddetector:GetListElements"],
}));
//# sourceMappingURL=GetListElementsHttp.js.map