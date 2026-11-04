import * as pricing from "@distilled.cloud/aws/pricing";
import * as Layer from "effect/Layer";
import { makePricingHttpBinding } from "./BindingHttp.js";
import { ListPriceLists } from "./ListPriceLists.js";
export const ListPriceListsHttp = Layer.effect(ListPriceLists, makePricingHttpBinding({
    capability: "ListPriceLists",
    iamActions: ["pricing:ListPriceLists"],
    operation: pricing.listPriceLists,
}));
//# sourceMappingURL=ListPriceListsHttp.js.map