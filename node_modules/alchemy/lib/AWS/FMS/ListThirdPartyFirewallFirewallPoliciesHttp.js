import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListThirdPartyFirewallFirewallPolicies } from "./ListThirdPartyFirewallFirewallPolicies.js";
export const ListThirdPartyFirewallFirewallPoliciesHttp = Layer.effect(ListThirdPartyFirewallFirewallPolicies, makeFmsHttpBinding({
    capability: "ListThirdPartyFirewallFirewallPolicies",
    iamActions: ["fms:ListThirdPartyFirewallFirewallPolicies"],
    operation: fms.listThirdPartyFirewallFirewallPolicies,
}));
//# sourceMappingURL=ListThirdPartyFirewallFirewallPoliciesHttp.js.map