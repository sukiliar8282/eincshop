import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveAccountHttpBinding } from "./BindingHttp.js";
import { ListInvitations } from "./ListInvitations.js";
export const ListInvitationsHttp = Layer.effect(ListInvitations, makeDetectiveAccountHttpBinding({
    tag: "AWS.Detective.ListInvitations",
    operation: detective.listInvitations,
    actions: ["detective:ListInvitations"],
}));
//# sourceMappingURL=ListInvitationsHttp.js.map