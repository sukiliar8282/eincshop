import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { SearchProvisionedProducts } from "./SearchProvisionedProducts.js";
export const SearchProvisionedProductsHttp = Layer.effect(SearchProvisionedProducts, makeServiceCatalogHttpBinding({
    capability: "SearchProvisionedProducts",
    iamActions: ["servicecatalog:SearchProvisionedProducts"],
    operation: servicecatalog.searchProvisionedProducts,
}));
//# sourceMappingURL=SearchProvisionedProductsHttp.js.map