import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { DisassociateThirdPartyFirewall } from "./DisassociateThirdPartyFirewall.js";
export const DisassociateThirdPartyFirewallHttp = Layer.effect(DisassociateThirdPartyFirewall, makeFmsHttpBinding({
    capability: "DisassociateThirdPartyFirewall",
    iamActions: ["fms:DisassociateThirdPartyFirewall"],
    operation: fms.disassociateThirdPartyFirewall,
}));
//# sourceMappingURL=DisassociateThirdPartyFirewallHttp.js.map