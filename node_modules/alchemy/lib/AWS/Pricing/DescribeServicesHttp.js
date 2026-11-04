import * as pricing from "@distilled.cloud/aws/pricing";
import * as Layer from "effect/Layer";
import { makePricingHttpBinding } from "./BindingHttp.js";
import { DescribeServices } from "./DescribeServices.js";
export const DescribeServicesHttp = Layer.effect(DescribeServices, makePricingHttpBinding({
    capability: "DescribeServices",
    iamActions: ["pricing:DescribeServices"],
    operation: pricing.describeServices,
}));
//# sourceMappingURL=DescribeServicesHttp.js.map