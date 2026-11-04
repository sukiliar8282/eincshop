import * as ram from "@distilled.cloud/aws/ram";
import * as Layer from "effect/Layer";
import { makeRAMHttpBinding } from "./BindingHttp.js";
import { RejectResourceShareInvitation } from "./RejectResourceShareInvitation.js";
export const RejectResourceShareInvitationHttp = Layer.effect(RejectResourceShareInvitation, makeRAMHttpBinding({
    capability: "RejectResourceShareInvitation",
    iamActions: ["ram:RejectResourceShareInvitation"],
    operation: ram.rejectResourceShareInvitation,
}));
//# sourceMappingURL=RejectResourceShareInvitationHttp.js.map