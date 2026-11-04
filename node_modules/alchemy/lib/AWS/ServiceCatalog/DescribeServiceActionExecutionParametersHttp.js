import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { DescribeServiceActionExecutionParameters } from "./DescribeServiceActionExecutionParameters.js";
export const DescribeServiceActionExecutionParametersHttp = Layer.effect(DescribeServiceActionExecutionParameters, makeServiceCatalogHttpBinding({
    capability: "DescribeServiceActionExecutionParameters",
    iamActions: ["servicecatalog:DescribeServiceActionExecutionParameters"],
    operation: servicecatalog.describeServiceActionExecutionParameters,
}));
//# sourceMappingURL=DescribeServiceActionExecutionParametersHttp.js.map