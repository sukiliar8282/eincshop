import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetThirdPartyFirewallAssociationStatus } from "./GetThirdPartyFirewallAssociationStatus.js";
export const GetThirdPartyFirewallAssociationStatusHttp = Layer.effect(GetThirdPartyFirewallAssociationStatus, makeFmsHttpBinding({
    capability: "GetThirdPartyFirewallAssociationStatus",
    iamActions: ["fms:GetThirdPartyFirewallAssociationStatus"],
    operation: fms.getThirdPartyFirewallAssociationStatus,
}));
//# sourceMappingURL=GetThirdPartyFirewallAssociationStatusHttp.js.map