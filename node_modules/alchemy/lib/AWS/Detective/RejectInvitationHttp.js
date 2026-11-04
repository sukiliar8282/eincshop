import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveAccountHttpBinding } from "./BindingHttp.js";
import { RejectInvitation } from "./RejectInvitation.js";
export const RejectInvitationHttp = Layer.effect(RejectInvitation, makeDetectiveAccountHttpBinding({
    tag: "AWS.Detective.RejectInvitation",
    operation: detective.rejectInvitation,
    actions: ["detective:RejectInvitation"],
}));
//# sourceMappingURL=RejectInvitationHttp.js.map