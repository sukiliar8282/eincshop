import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { DisassociateMember } from "./DisassociateMember.js";
export const DisassociateMemberHttp = Layer.effect(DisassociateMember, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.DisassociateMember",
    operation: inspector2.disassociateMember,
    actions: ["inspector2:DisassociateMember"],
}));
//# sourceMappingURL=DisassociateMemberHttp.js.map