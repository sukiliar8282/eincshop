import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DescribeProducts } from "./DescribeProducts.js";
export const DescribeProductsHttp = Layer.effect(DescribeProducts, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DescribeProducts",
    operation: securityhub.describeProducts,
    actions: ["securityhub:DescribeProducts"],
}));
//# sourceMappingURL=DescribeProductsHttp.js.map