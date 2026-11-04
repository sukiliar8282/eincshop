import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { TerminateProvisionedProduct } from "./TerminateProvisionedProduct.js";
export const TerminateProvisionedProductHttp = Layer.effect(TerminateProvisionedProduct, makeServiceCatalogHttpBinding({
    capability: "TerminateProvisionedProduct",
    iamActions: [
        "servicecatalog:TerminateProvisionedProduct",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
    ],
    operation: servicecatalog.terminateProvisionedProduct,
}));
//# sourceMappingURL=TerminateProvisionedProductHttp.js.map