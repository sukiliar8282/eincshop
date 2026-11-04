import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { DescribeProduct } from "./DescribeProduct.js";
export const DescribeProductHttp = Layer.effect(DescribeProduct, makeServiceCatalogHttpBinding({
    capability: "DescribeProduct",
    iamActions: ["servicecatalog:DescribeProduct"],
    operation: servicecatalog.describeProduct,
}));
//# sourceMappingURL=DescribeProductHttp.js.map