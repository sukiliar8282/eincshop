import * as pricing from "@distilled.cloud/aws/pricing";
import * as Layer from "effect/Layer";
import { makePricingHttpBinding } from "./BindingHttp.js";
import { GetAttributeValues } from "./GetAttributeValues.js";
export const GetAttributeValuesHttp = Layer.effect(GetAttributeValues, makePricingHttpBinding({
    capability: "GetAttributeValues",
    iamActions: ["pricing:GetAttributeValues"],
    operation: pricing.getAttributeValues,
}));
//# sourceMappingURL=GetAttributeValuesHttp.js.map