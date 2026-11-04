import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { DescribeProvisionedProduct } from "./DescribeProvisionedProduct.js";
export const DescribeProvisionedProductHttp = Layer.effect(DescribeProvisionedProduct, makeServiceCatalogHttpBinding({
    capability: "DescribeProvisionedProduct",
    iamActions: ["servicecatalog:DescribeProvisionedProduct"],
    operation: servicecatalog.describeProvisionedProduct,
}));
//# sourceMappingURL=DescribeProvisionedProductHttp.js.map