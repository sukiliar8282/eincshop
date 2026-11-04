import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { DescribeProvisioningParameters } from "./DescribeProvisioningParameters.js";
export const DescribeProvisioningParametersHttp = Layer.effect(DescribeProvisioningParameters, makeServiceCatalogHttpBinding({
    capability: "DescribeProvisioningParameters",
    iamActions: ["servicecatalog:DescribeProvisioningParameters"],
    operation: servicecatalog.describeProvisioningParameters,
}));
//# sourceMappingURL=DescribeProvisioningParametersHttp.js.map