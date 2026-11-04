import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Layer from "effect/Layer";
import { makeDistributionScopedHttpBinding } from "./BindingHttp.js";
import { GetInvalidation } from "./GetInvalidation.js";
export const GetInvalidationHttp = Layer.effect(GetInvalidation, makeDistributionScopedHttpBinding({
    tag: "AWS.CloudFront.GetInvalidation",
    operation: cloudfront.getInvalidation,
    actions: ["cloudfront:GetInvalidation"],
}));
//# sourceMappingURL=GetInvalidationHttp.js.map