import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GetServiceLastAccessedDetails } from "./GetServiceLastAccessedDetails.js";
export const GetServiceLastAccessedDetailsHttp = Layer.effect(GetServiceLastAccessedDetails, makeIamHttpBinding({
    capability: "GetServiceLastAccessedDetails",
    iamActions: ["iam:GetServiceLastAccessedDetails"],
    operation: iam.getServiceLastAccessedDetails,
}));
//# sourceMappingURL=GetServiceLastAccessedDetailsHttp.js.map