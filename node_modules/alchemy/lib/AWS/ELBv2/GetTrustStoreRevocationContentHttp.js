import * as elbv2 from "@distilled.cloud/aws/elastic-load-balancing-v2";
import * as Layer from "effect/Layer";
import { makeTrustStoreHttpBinding } from "./BindingHttp.js";
import { GetTrustStoreRevocationContent } from "./GetTrustStoreRevocationContent.js";
export const GetTrustStoreRevocationContentHttp = Layer.effect(GetTrustStoreRevocationContent, makeTrustStoreHttpBinding({
    tag: "AWS.ELBv2.GetTrustStoreRevocationContent",
    operation: elbv2.getTrustStoreRevocationContent,
    actions: ["elasticloadbalancing:GetTrustStoreRevocationContent"],
}));
//# sourceMappingURL=GetTrustStoreRevocationContentHttp.js.map