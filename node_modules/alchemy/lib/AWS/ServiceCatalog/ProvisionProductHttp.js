import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { ProvisionProduct } from "./ProvisionProduct.js";
export const ProvisionProductHttp = Layer.effect(ProvisionProduct, makeServiceCatalogHttpBinding({
    capability: "ProvisionProduct",
    iamActions: [
        "servicecatalog:ProvisionProduct",
        "cloudformation:CreateStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:GetTemplateSummary",
        "cloudformation:SetStackPolicy",
        "cloudformation:ValidateTemplate",
        "s3:GetObject",
    ],
    operation: servicecatalog.provisionProduct,
}));
//# sourceMappingURL=ProvisionProductHttp.js.map