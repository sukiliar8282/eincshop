import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveAccountHttpBinding } from "./BindingHttp.js";
import { DisassociateMembership } from "./DisassociateMembership.js";
export const DisassociateMembershipHttp = Layer.effect(DisassociateMembership, makeDetectiveAccountHttpBinding({
    tag: "AWS.Detective.DisassociateMembership",
    operation: detective.disassociateMembership,
    actions: ["detective:DisassociateMembership"],
}));
//# sourceMappingURL=DisassociateMembershipHttp.js.map