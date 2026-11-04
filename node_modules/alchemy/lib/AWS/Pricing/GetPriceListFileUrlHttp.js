import * as pricing from "@distilled.cloud/aws/pricing";
import * as Layer from "effect/Layer";
import { makePricingHttpBinding } from "./BindingHttp.js";
import { GetPriceListFileUrl } from "./GetPriceListFileUrl.js";
export const GetPriceListFileUrlHttp = Layer.effect(GetPriceListFileUrl, makePricingHttpBinding({
    capability: "GetPriceListFileUrl",
    iamActions: ["pricing:GetPriceListFileUrl"],
    operation: pricing.getPriceListFileUrl,
}));
//# sourceMappingURL=GetPriceListFileUrlHttp.js.map