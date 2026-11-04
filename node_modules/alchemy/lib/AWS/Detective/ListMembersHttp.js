import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { ListMembers } from "./ListMembers.js";
export const ListMembersHttp = Layer.effect(ListMembers, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.ListMembers",
    operation: detective.listMembers,
    actions: ["detective:ListMembers"],
}));
//# sourceMappingURL=ListMembersHttp.js.map