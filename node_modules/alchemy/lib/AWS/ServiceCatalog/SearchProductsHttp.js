import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { SearchProducts } from "./SearchProducts.js";
export const SearchProductsHttp = Layer.effect(SearchProducts, makeServiceCatalogHttpBinding({
    capability: "SearchProducts",
    iamActions: ["servicecatalog:SearchProducts"],
    operation: servicecatalog.searchProducts,
}));
//# sourceMappingURL=SearchProductsHttp.js.map