import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetProtectionStatus } from "./GetProtectionStatus.js";
export const GetProtectionStatusHttp = Layer.effect(GetProtectionStatus, makeFmsHttpBinding({
    capability: "GetProtectionStatus",
    iamActions: ["fms:GetProtectionStatus"],
    operation: fms.getProtectionStatus,
}));
//# sourceMappingURL=GetProtectionStatusHttp.js.map