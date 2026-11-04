import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetViolationDetails } from "./GetViolationDetails.js";
export const GetViolationDetailsHttp = Layer.effect(GetViolationDetails, makeFmsHttpBinding({
    capability: "GetViolationDetails",
    iamActions: ["fms:GetViolationDetails"],
    operation: fms.getViolationDetails,
}));
//# sourceMappingURL=GetViolationDetailsHttp.js.map