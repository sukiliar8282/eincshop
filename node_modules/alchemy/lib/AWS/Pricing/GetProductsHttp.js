import * as pricing from "@distilled.cloud/aws/pricing";
import * as Layer from "effect/Layer";
import { makePricingHttpBinding } from "./BindingHttp.js";
import { GetProducts } from "./GetProducts.js";
export const GetProductsHttp = Layer.effect(GetProducts, makePricingHttpBinding({
    capability: "GetProducts",
    iamActions: ["pricing:GetProducts"],
    operation: pricing.getProducts,
}));
//# sourceMappingURL=GetProductsHttp.js.map