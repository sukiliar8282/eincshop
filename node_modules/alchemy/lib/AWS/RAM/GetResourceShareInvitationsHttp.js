import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { GetResourceShareInvitations } from "./GetResourceShareInvitations.js";
export const GetResourceShareInvitationsHttp = Layer.effect(GetResourceShareInvitations, makeRAMHttpBinding({
    capability: "GetResourceShareInvitations",
    iamActions: ["ram:GetResourceShareInvitations"],
    operation: ram.getResourceShareInvitations,
}));
//# sourceMappingURL=GetResourceShareInvitationsHttp.js.map